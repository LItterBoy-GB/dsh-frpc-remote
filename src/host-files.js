import { lstat, opendir, realpath, stat } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep, join, dirname, parse } from 'node:path'

const fail = (status, message) => Object.assign(new Error(message), { status })
const fullyQualified = path => isAbsolute(path) && (process.platform !== 'win32' || /^(?:[a-z]:[\\/]|\\\\[^\\]+\\[^\\]+)/i.test(path))
export function validateRoots(roots) {
  if (!Array.isArray(roots) || roots.length > 20) throw new Error('允许浏览的目录最多为 20 项')
  for (const root of roots) {
    if (typeof root !== 'string' || !root.trim() || root.length > 4096 || !fullyQualified(root) || /[\u0000-\u001f\u007f]/u.test(root)
      || /^\\\\[?.]\\/u.test(root)) throw new Error('允许浏览的目录必须为完整的普通文件系统路径')
  }
  return roots
}
export function contains(root, path) {
  const part = relative(root, path)
  return part === '' || (part !== '..' && !part.startsWith('..' + sep) && !isAbsolute(part))
}
function validPath(path) {
  if (typeof path !== 'string' || path.length > 4096 || !fullyQualified(path) || /[\u0000-\u001f\u007f]/u.test(path) || /^\\\\[?.]\\/u.test(path)) {
    throw fail(400, '请使用允许目录中的完整路径')
  }
}

/** 仅提供目录元数据与文件路径，不读取内容、不改变工作区或文件系统。 */
export class HostFiles {
  constructor(roots = [], allowAll = false) {
    this.roots = [...validateRoots(roots)]
    this.allowAll = allowAll === true
    this.active = 0
  }
  async rootsSnapshot() {
    const candidates = this.allowAll ? process.platform === 'win32' ? Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index) + ':\\') : ['/'] : this.roots
    if (!this.snapshot) this.snapshot = Promise.all(candidates.map(async (configured, id) => {
      try {
        const path = await realpath(configured)
        if (!(await stat(path)).isDirectory()) throw new Error('not-directory')
        return { id, configured, path, available: true }
      } catch (_) { return { id, configured, available: false, message: '目录不存在或无法访问，请检查设置' } }
    })).then(roots => this.allowAll ? roots.filter(root => root.available) : roots)
    return this.snapshot
  }
  async root(id, path) {
    // “所有目录”的手动跳转也支持其他磁盘及 UNC 共享；系统权限仍由 OS 执行。
    if (this.allowAll && id === -1) {
      const root = await realpath(parse(path).root)
      return { id, configured: root, path: root, available: true }
    }
    if (!Number.isInteger(id) || id < 0) throw fail(400, '请选择允许浏览的目录')
    const root = (await this.rootsSnapshot()).find(root => root.id === id)
    if (!root) throw fail(403, '该目录未被允许浏览')
    if (!root.available) throw fail(404, root.message)
    // 配置目录如果是联接/符号链接，固定首次解析的目标，拒绝运行中重定向。
    if (await realpath(root.configured) !== root.path) throw fail(403, '允许目录的真实位置已改变，请重新保存设置')
    return root
  }
  async checked(id, path) {
    validPath(path)
    const root = await this.root(id, path), absolute = resolve(path)
    if (!contains(root.path, absolute)) throw fail(403, '只能浏览允许目录中的文件')
    const actual = await realpath(absolute)
    if (!contains(root.path, actual)) throw fail(403, '目标超出允许目录，无法通过链接访问')
    return { root, path: actual }
  }
  async bounded(operation, signal) {
    if (this.active >= 4) throw fail(429, '文件浏览请求较多，请稍后重试')
    this.active++
    try { signal?.throwIfAborted(); return await operation() }
    catch (error) {
      if (error.status) throw error
      if (signal?.aborted) throw fail(408, '文件浏览已取消或超时')
      if (['ENOENT', 'ENOTDIR'].includes(error.code)) throw fail(404, '文件或目录已不存在，请刷新列表')
      throw fail(400, '无法访问文件或目录，请检查路径和系统权限')
    } finally { this.active-- }
  }
  async list({ root: id, path, search = '' }, signal) {
    if (typeof search !== 'string' || search.length > 200 || /[\u0000-\u001f\u007f]/u.test(search)) throw fail(400, '筛选文字无效')
    return this.bounded(async () => {
      const target = await this.checked(id, path)
      if (!(await stat(target.path)).isDirectory()) throw fail(400, '请选择目录')
      const entries = [], query = search.toLocaleLowerCase()
      let scanned = 0, truncated = false
      const directory = await opendir(target.path)
      for await (const entry of directory) {
        signal?.throwIfAborted()
        if (++scanned > 5000) { truncated = true; break }
        if (/[\u0000-\u001f\u007f]/u.test(entry.name) || !entry.name.toLocaleLowerCase().includes(query)) continue
        const file = join(target.path, entry.name)
        try {
          // 不跟随任何符号链接或 Windows 目录联接，也不暴露其外部目标。
          const info = await lstat(file)
          if (info.isSymbolicLink() || (!info.isFile() && !info.isDirectory())) continue
          if (await realpath(file) !== file) continue
          entries.push({ name: entry.name, path: file, type: info.isDirectory() ? 'directory' : 'file', size: info.isFile() ? info.size : undefined })
          if (entries.length >= 500) { truncated = true; break }
        } catch (_) { /* 扫描期间消失或无权限的子项不加入列表。 */ }
      }
      signal?.throwIfAborted()
      // 检查扫描期间的目录替换；不把失效位置的列表交给浏览器。
      const after = await this.checked(id, target.path)
      if (after.path !== target.path) throw fail(409, '目录已发生变化，请刷新后重试')
      entries.sort((a, b) => (a.type === b.type ? 0 : a.type === 'directory' ? -1 : 1) || a.name.localeCompare(b.name))
      return { root: id, path: target.path, parent: target.path === target.root.path ? null : dirname(target.path), entries, truncated }
    }, signal)
  }
  async select({ root: id, path }, signal) {
    return this.bounded(async () => {
      const target = await this.checked(id, path)
      if ((await lstat(resolve(path))).isSymbolicLink() || !(await lstat(target.path)).isFile()) throw fail(400, '请选择普通文件；不支持符号链接')
      const after = await this.checked(id, path)
      signal?.throwIfAborted()
      if (after.path !== target.path) throw fail(409, '文件位置已改变，请刷新后重试')
      return { path: target.path }
    }, signal)
  }
}
