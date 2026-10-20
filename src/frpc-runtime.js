import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { access, chmod, copyFile, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { createHash } from 'node:crypto'
import { delimiter, isAbsolute, join, resolve } from 'node:path'
import { homedir } from 'node:os'
import { gunzipSync } from 'node:zlib'
import { unzipSync } from 'fflate'
import tar from 'tar-stream'

const run = promisify(execFile)
export const FRP_VERSION = '0.71.1'
const MAX_BYTES = 64 * 1024 * 1024
// 固定官方 Release asset 的 digest；下载时不信任可变的 latest 或同源校验文件。
const releases = {
  'win32-x64': ['windows_amd64.zip', 'b90074b2b6a1d792a7a40f085ac6d276bcab2d1bc60201f8a86ca53ce65ce821'],
  'win32-arm64': ['windows_arm64.zip', '6c25afb4058f7708937db7064836fec593e941de0e6c2c255982335a9b16d370'],
  'linux-x64': ['linux_amd64.tar.gz', '1d9875210972a5d1a62b2dc4c48df45ab0af05d3ca1b5e494a014428259df803'],
  'linux-arm64': ['linux_arm64.tar.gz', '8edf590b0c396fa42f9c147121a76af83cfc2002b08f5aef0ea1008c43482019'],
  'darwin-x64': ['darwin_amd64.tar.gz', '8acb59b6fb998cc8d209d1373d90bf70fa5ec3efeb4dfbc7bda6ce3abd78cb45'],
  'darwin-arm64': ['darwin_arm64.tar.gz', 'd15d0324b99e14619c9aa46e37f6db588c06a09be4bc6f7948890b6b61077842'],
}
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

export function releaseFor(platform = process.platform, arch = process.arch) {
  const release = releases[`${platform}-${arch}`]
  if (!release) throw new Error(`暂不支持自动下载 ${platform}/${arch}，请手动填写 frpc 完整路径`)
  const [suffix, sha256] = release
  const name = `frp_${FRP_VERSION}_${suffix}`
  const binary = platform === 'win32' ? 'frpc.exe' : 'frpc'
  return { name, sha256, version: FRP_VERSION, binary, entry: `${name.replace(/\.(zip|tar.gz)$/, '')}/${binary}`,
    url: `https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/${name}` }
}

export async function probeExecutable(file, signal) {
  const { stdout } = await run(file, ['--version'], { windowsHide: true, shell: false, timeout: 5000, maxBuffer: 4096, signal })
  const version = stdout.trim()
  if (!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(version)) throw new Error('程序未返回可识别的 frpc 版本')
  if (Number(version.split('.')[0]) === 0 && Number(version.split('.')[1]) < 52) throw new Error('frpc 版本过旧，需要 0.52.0 或更新版本')
  return version
}

export async function findExecutable(command, env = process.env, platform = process.platform) {
  const explicit = isAbsolute(command) || /[\\/]/.test(command)
  const paths = explicit ? [resolve(command)] : (env.PATH || env.Path || '').split(delimiter).filter(Boolean).flatMap(dir => {
    const base = join(dir.replace(/^"|"$/g, ''), command)
    return platform === 'win32' && !/\.exe$/i.test(base) ? [base + '.exe'] : [base]
  })
  for (const file of paths) {
    try {
      if (!(await stat(file)).isFile()) continue
      await access(file, platform === 'win32' ? constants.F_OK : constants.X_OK)
      return file
    } catch (error) {
      if (!['ENOENT', 'ENOTDIR', 'EACCES'].includes(error.code)) throw error
    }
  }
}

export async function extractBinary(bytes, release) {
  if (release.name.endsWith('.zip')) {
    const files = unzipSync(bytes, { filter: entry => entry.name === release.entry })
    const binary = files[release.entry]
    if (!binary?.length || binary.length > MAX_BYTES) throw new Error('官方压缩包中缺少有效的 frpc 程序')
    return Buffer.from(binary)
  }
  const unpack = tar.extract()
  return new Promise((resolve, reject) => {
    let binary
    unpack.on('entry', (header, stream, next) => {
      if (header.name !== release.entry) { stream.resume(); stream.on('end', next); return }
      if (binary || header.type !== 'file' || header.size > MAX_BYTES) { unpack.destroy(new Error('frpc 压缩包条目无效')); return }
      const chunks = []; let size = 0
      stream.on('data', chunk => {
        size += chunk.length
        if (size > MAX_BYTES) unpack.destroy(new Error('frpc 解压文件过大'))
        else chunks.push(chunk)
      })
      stream.on('end', () => { binary = Buffer.concat(chunks); next() })
      stream.on('error', reject)
    })
    unpack.on('error', reject)
    unpack.on('finish', () => binary?.length ? resolve(binary) : reject(new Error('官方压缩包中缺少 frpc 程序')))
    try { unpack.end(gunzipSync(bytes, { maxOutputLength: MAX_BYTES })) } catch (error) { reject(error) }
  })
}

export class FrpcRuntime {
  constructor(options = {}) {
    this.home = options.home || process.env.DSH_HOME || join(homedir(), '.dsh')
    this.platform = options.platform || process.platform
    this.arch = options.arch || process.arch
    this.env = options.env || process.env
    this.fetch = options.fetch || globalThis.fetch
    this.probe = options.probe || probeExecutable
    try { this.release = options.release || releaseFor(this.platform, this.arch) }
    catch (_) { this.release = undefined }
    this.binary = this.release?.binary || (this.platform === 'win32' ? 'frpc.exe' : 'frpc')
    this.directory = join(this.home, 'tools', `frp-${FRP_VERSION}`, `${this.platform}-${this.arch}`)
    this.executable = join(this.directory, this.binary)
    this.controller = new AbortController()
    this.status = { state: 'unchecked', platform: this.platform, arch: this.arch, targetVersion: FRP_VERSION }
  }
  publish(patch) { this.status = { ...this.status, message: undefined, ...patch } }
  async cached() {
    if (!this.release) return
    try {
      const marker = JSON.parse(await readFile(join(this.directory, 'verified.json'), 'utf8'))
      const bytes = await readFile(this.executable)
      if (marker.archiveSha256 !== this.release.sha256 || marker.binarySha256 !== sha256(bytes)) return
      return this.executable
    } catch (error) {
      if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error
    }
  }
  async check(requested = 'auto') {
    if (this.installing) return { ...this.status }
    this.controller.signal.throwIfAborted()
    this.publish({ state: 'checking', requested, path: undefined, source: undefined, version: undefined })
    try {
      const automatic = !requested.trim() || ['auto', 'frpc', 'frpc.exe'].includes(requested.trim().toLowerCase())
      const found = await findExecutable(automatic ? 'frpc' : requested.trim(), this.env, this.platform)
      let file = found, source = automatic ? 'path' : 'custom'
      if (!file && automatic) { file = await this.cached(); source = 'managed' }
      if (!file && automatic) {
        // 兼容先前手工安装到 DSH tools 目录的客户端。
        file = await findExecutable(join(this.home, 'tools', `frp-${FRP_VERSION}`, this.binary), this.env, this.platform)
        source = 'existing'
      }
      if (!file) { this.publish({ state: 'missing', message: automatic ? '未找到 frpc，可自动下载安装' : '指定路径不存在，请修正路径或改为 auto' }); return { ...this.status } }
      const version = await this.probe(file, this.controller.signal)
      this.publish({ state: 'ready', path: file, source, version })
    } catch (error) {
      this.controller.signal.throwIfAborted()
      this.publish({ state: 'error', message: `frpc 检测失败：${error.message}` })
    }
    return { ...this.status }
  }
  async ensure(requested = 'auto', autoDownload = true) {
    if (this.installing) return this.installing
    const result = await this.check(requested)
    if (result.state === 'ready') return result.path
    const automatic = !requested.trim() || ['auto', 'frpc', 'frpc.exe'].includes(requested.trim().toLowerCase())
    if (result.state === 'missing' && automatic && autoDownload) return this.install()
    throw new Error(result.message || 'frpc 尚未就绪，请检测路径或点击自动安装')
  }
  install() {
    if (this.installing) return this.installing
    this.installing = this.download().catch(error => {
      this.publish({ state: 'error', message: `frpc 自动安装失败：${error.message}。可重试或手动填写完整路径` })
      throw error
    }).finally(() => { this.installing = undefined })
    return this.installing
  }
  async download() {
    if (!this.release) throw new Error(`暂不支持自动下载 ${this.platform}/${this.arch}，请手动填写 frpc 完整路径`)
    const signal = AbortSignal.any([this.controller.signal, AbortSignal.timeout(180000)])
    signal.throwIfAborted()
    const cached = await this.cached()
    if (cached) {
      const version = await this.probe(cached, signal)
      this.publish({ state: 'ready', path: cached, source: 'managed', version })
      return cached
    }
    this.publish({ state: 'downloading', received: 0, total: undefined })
    const response = await this.fetch(this.release.url, { signal, redirect: 'follow' })
    if (!response.ok || !response.body) throw new Error(`下载服务器返回 HTTP ${response.status}`)
    const total = Number(response.headers.get('content-length')) || undefined
    if (total > MAX_BYTES) throw new Error('frpc 压缩包超过大小限制')
    const chunks = []; let received = 0
    for await (const chunk of response.body) {
      signal.throwIfAborted(); received += chunk.length
      if (received > MAX_BYTES) throw new Error('frpc 压缩包超过大小限制')
      chunks.push(chunk); this.publish({ received, total })
    }
    const archive = Buffer.concat(chunks)
    this.publish({ state: 'verifying' })
    if (sha256(archive) !== this.release.sha256) throw new Error('SHA-256 校验失败，未安装或运行下载文件')
    const binary = await extractBinary(archive, this.release)
    signal.throwIfAborted()
    await mkdir(this.directory, { recursive: true })
    const temporary = await mkdtemp(join(this.directory, '.install-'))
    try {
      const file = join(temporary, this.release.binary)
      await writeFile(file, binary, { mode: 0o755 }); await chmod(file, 0o755)
      const version = await this.probe(file, signal)
      if (version !== this.release.version) throw new Error(`下载程序版本不符：${version}`)
      signal.throwIfAborted()
      // 绝不覆盖已有程序；并发安装只接受内容相同的结果。
      try { await copyFile(file, this.executable, constants.COPYFILE_EXCL) }
      catch (error) { if (error.code !== 'EEXIST' || sha256(await readFile(this.executable)) !== sha256(binary)) throw error }
      await chmod(this.executable, 0o755)
      await writeFile(join(this.directory, 'verified.json'), JSON.stringify({ archiveSha256: this.release.sha256, binarySha256: sha256(binary), version }), { mode: 0o600 })
      signal.throwIfAborted()
      this.publish({ state: 'ready', path: this.executable, source: 'managed', version })
      return this.executable
    } finally { await rm(temporary, { recursive: true, force: true }) }
  }
  dispose() { this.controller.abort(new Error('frpc 插件已卸载或配置已更新')) }
}
