// Published DSH lazy-factory protocol; React is supplied by the host module table.
window.__ModuleLoader__.load({
  id: 'dsh-frpc-remote',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'frpcRemote'
    const zh = {
      nav: '远程访问', title: '通过 frpc 远程操作', description: '把当前 dsh 的 Web 界面转发到指定入口，继续使用 dsh 访问令牌认证。',
      enabled: '启用远程访问', frpcPath: 'frpc 可执行文件', serverAddr: 'frps 地址', serverPort: 'frps 端口', token: 'frps Token',
      tokenHint: '已保存的密钥不会显示。留空保留原值。', clearToken: '清除已保存的 Token', proxyName: '代理名称', proxyType: '代理类型',
      remotePort: 'TCP 映射端口', publicUrl: '远程访问地址', publicHint: '使用独立域名或端口的根地址。HTTPS 需在入口部署 TLS 反向代理并保留 Host、Origin 和 WebSocket。',
      advanced: '高级设置', trustedCaFile: 'frps TLS CA 文件', tlsServerName: 'frps TLS 证书名称', allowInsecureHttp: '允许明文 HTTP（仅用于可信网络）',
      restartDelayMs: '异常重启间隔（毫秒）', maxRestarts: '最大异常重启次数', save: '保存并应用', saving: '正在保存…', saved: '配置已保存。',
      failure: '保存结果尚未确认。请等待连接恢复后核对配置，当前草稿已保留。', conflict: '配置已发生变化，本次修改未被确认。请载入最新配置后重新编辑。', reloadConfig: '载入最新配置', discardDraft: '载入最新配置将放弃当前未保存的草稿，是否继续？', loading: '正在读取配置…', unavailable: '当前宿主未提供远程访问配置。',
      status: '连接状态', refresh: '刷新状态', open: '打开远程入口', copy: '复制访问链接', copied: '访问链接已复制。链接含访问令牌，请仅交给可信使用者。',
      statusFailure: '状态暂时不可用，稍后自动重试。', disabled: '未启用', starting: '正在准备', connecting: '正在连接', connected: '代理已连接', retrying: '等待重启', error: '连接失败',
      invalidRequired: '启用前请填写可执行文件、服务器地址、代理名称和访问地址。', invalidUrl: '请输入 HTTP(S) 根地址，不含查询参数、用户名或路径。',
      insecure: '明文 HTTP 需要明确勾选允许选项。', invalidPort: '端口必须是 1–65535 的整数。', invalidAdvanced: '重启间隔需为 500–60000，重启次数需为 0–20。',
      nameHint: '在同一台 frps 上应保持唯一。', secretSet: 'Token 已配置', secretEmpty: 'Token 未配置',
    }
    const en = {
      nav: 'Remote access', title: 'Remote control with frpc', description: 'Forward this dsh Web host while retaining its launch-token authentication.',
      enabled: 'Enable remote access', frpcPath: 'frpc executable', serverAddr: 'frps address', serverPort: 'frps port', token: 'frps token', tokenHint: 'Stored secrets are hidden. Leave blank to keep the current token.',
      clearToken: 'Clear the saved token', proxyName: 'Proxy name', proxyType: 'Proxy type', remotePort: 'TCP remote port', publicUrl: 'Public URL', publicHint: 'Use a dedicated root URL. HTTPS requires a TLS reverse proxy preserving Host, Origin and WebSocket upgrades.',
      advanced: 'Advanced', trustedCaFile: 'frps TLS CA file', tlsServerName: 'frps TLS server name', allowInsecureHttp: 'Allow plain HTTP (trusted networks only)', restartDelayMs: 'Restart delay (ms)', maxRestarts: 'Maximum restarts',
      save: 'Save and apply', saving: 'Saving…', saved: 'Configuration saved.', failure: 'Save is not yet confirmed. Check the configuration after reconnecting. Your draft is retained.', conflict: 'The configuration changed and this edit is not confirmed. Load the latest configuration before editing again.', reloadConfig: 'Load latest configuration', discardDraft: 'Loading the latest configuration discards this unsaved draft. Continue?', loading: 'Loading configuration…', unavailable: 'Remote access configuration is unavailable on this host.',
      status: 'Connection', refresh: 'Refresh status', open: 'Open remote entry', copy: 'Copy access link', copied: 'Access link copied. It contains a token; share only with trusted operators.', statusFailure: 'Status unavailable; retrying automatically.', disabled: 'Disabled', starting: 'Preparing', connecting: 'Connecting', connected: 'Proxy connected', retrying: 'Restart pending', error: 'Connection failed',
      invalidRequired: 'Provide the executable, server address, proxy name and public URL before enabling.', invalidUrl: 'Enter an HTTP(S) root URL without credentials, query or path.', insecure: 'Explicitly allow plain HTTP to use this URL.', invalidPort: 'Ports must be integers from 1 to 65535.', invalidAdvanced: 'Restart delay: 500–60000; restart count: 0–20.', nameHint: 'Must be unique on the same frps server.', secretSet: 'Token configured', secretEmpty: 'Token not configured',
    }
    Object.assign(zh, {
      title: '远程访问', intro: '通过 frpc 连接本机 dsh，继续使用访问令牌认证。', enabledHint: '保存后应用；关闭时释放本插件的隧道。',
      program: 'frpc 程序', server: '服务器', entry: '访问入口', frpcPath: '程序路径', pathHint: 'auto 或留空自动检测，也可填写完整路径。',
      autoDownload: '缺失时自动下载 frpc', autoDownloadHint: '启用连接时使用官方固定版本，下载后校验 SHA-256。', check: '检测路径', checking: '正在检测…', install: '自动安装', installing: '正在安装…', installed: '已安装并校验。保存后使用自动检测路径。', checked: '路径检测完成。',
      runtimeTitle: '程序检测', unchecked: '尚未检测', missing: '未找到程序', downloading: '正在下载', verifying: '正在校验', ready: '程序就绪', source_path: '系统 PATH', source_custom: '手动路径', source_managed: '自动安装', source_existing: '已有安装',
      required: '请填写此项。', invalidDelay: '请输入 500–60000 的整数。', invalidRestarts: '请输入 0–20 的整数。', invalidDomain: 'HTTP 模式需要域名。', invalidServer: '只填写主机名或 IP，不含空格。', actionFailure: '操作失败，请检查网络或手动填写程序路径。', copyFailure: '复制失败，请使用“打开远程入口”。',
    })
    Object.assign(en, {
      title: 'Remote access', intro: 'Connect to this dsh host through frpc with launch-token authentication.', enabledHint: 'Applied on save. Disabling releases this plugin’s tunnel.', program: 'frpc program', server: 'Server', entry: 'Public entry', frpcPath: 'Executable path', pathHint: 'Use auto or leave blank to detect; a full path also works.',
      autoDownload: 'Download frpc when missing', autoDownloadHint: 'Connect using a pinned official release, verified with SHA-256.', check: 'Check path', checking: 'Checking…', install: 'Install automatically', installing: 'Installing…', installed: 'Installed and verified. Save to use automatic detection.', checked: 'Path check complete.', runtimeTitle: 'Program check', unchecked: 'Not checked', missing: 'Program missing', downloading: 'Downloading', verifying: 'Verifying', ready: 'Program ready', source_path: 'System PATH', source_custom: 'Custom path', source_managed: 'Managed installation', source_existing: 'Existing installation',
      required: 'Complete this field.', invalidDelay: 'Enter an integer from 500 to 60000.', invalidRestarts: 'Enter an integer from 0 to 20.', invalidDomain: 'HTTP mode requires a domain.', invalidServer: 'Enter a hostname or IP without spaces.', actionFailure: 'Operation failed. Check the network or enter a program path.', copyFailure: 'Copy failed. Use “Open remote entry” instead.',
    })
    const css = `
.frpc-page{container:frpc / inline-size;max-width:760px;min-width:0;color:inherit;font:inherit}
.frpc-form{--frpc-accent:#2563eb;--frpc-good:light-dark(#15803d,#86efac);--frpc-error:light-dark(#dc2626,#fca5a5);--frpc-line:color-mix(in srgb,currentColor 18%,transparent);--frpc-muted:color-mix(in srgb,currentColor 68%,transparent);display:grid;gap:20px;min-width:0;padding:2px 0 12px}
.frpc-form *{box-sizing:border-box}.frpc-form h2,.frpc-form h3,.frpc-form p{margin:0}.frpc-form h2{font-size:20px;font-weight:600;line-height:1.4}.frpc-form h3{font-size:14px;font-weight:600;line-height:20px}
.frpc-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.frpc-intro,.frpc-help{font-size:12px;line-height:1.65;color:var(--frpc-muted)}
.frpc-status{display:inline-flex;align-items:center;gap:7px;white-space:nowrap;font-size:12px;line-height:24px;font-weight:500}.frpc-status:before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}.frpc-status[data-state=connected],.frpc-status[data-state=ready]{color:var(--frpc-good)}.frpc-form .frpc-status[data-state=error],.frpc-form .frpc-error{color:var(--frpc-error)}
.frpc-section{display:grid;gap:16px;border-top:1px solid var(--frpc-line);padding-top:20px;min-width:0}.frpc-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start}
.frpc-field{display:grid;grid-template-rows:20px 42px auto;gap:7px;min-width:0;align-content:start}.frpc-form .frpc-label{display:block;font-size:13px;font-weight:500;line-height:20px;margin:0;padding:0;white-space:nowrap}
.frpc-form .frpc-control{display:block;width:100%;min-width:0;max-width:100%;height:42px;min-height:42px;margin:0;border:1px solid var(--frpc-line);border-radius:6px;padding:9px 11px;background:transparent;color:inherit;font:inherit;font-size:14px;line-height:22px;box-shadow:none}.frpc-form select.frpc-control{padding-right:28px}.frpc-form .frpc-control[aria-invalid=true]{border-color:var(--frpc-error)}
.frpc-form .frpc-check{display:flex;align-items:center;gap:10px;min-height:42px;font-size:13px;line-height:20px;margin:0;padding:0;cursor:pointer}.frpc-form .frpc-check input{appearance:auto;display:block;flex:0 0 17px;width:17px;height:17px;min-height:17px;margin:0;padding:0;accent-color:var(--frpc-accent);border-radius:3px}
.frpc-enable{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:52px}.frpc-enable .frpc-help{max-width:260px;text-align:right}.frpc-program-actions,.frpc-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.frpc-form .frpc-button{display:inline-flex;align-items:center;justify-content:center;gap:6px;max-width:100%;min-height:42px;margin:0;border:1px solid var(--frpc-line);border-radius:6px;padding:9px 14px;background:transparent;color:inherit;font:inherit;font-size:13px;line-height:22px;text-decoration:none;cursor:pointer;white-space:nowrap}.frpc-form .frpc-button-primary{border-color:var(--frpc-accent);background:var(--frpc-accent);color:#fff}.frpc-form .frpc-button:disabled,.frpc-form .frpc-control:disabled{opacity:.55;cursor:default}
.frpc-form .frpc-control:focus-visible,.frpc-form .frpc-button:focus-visible,.frpc-form .frpc-check input:focus-visible,.frpc-form summary:focus-visible{outline:2px solid var(--frpc-accent);outline-offset:3px}
.frpc-runtime{display:grid;gap:8px;border-left:2px solid var(--frpc-line);padding:0 0 0 12px;min-width:0}.frpc-runtime[data-state=ready]{border-color:var(--frpc-good)}.frpc-runtime[data-state=error]{border-color:var(--frpc-error)}.frpc-runtime-title{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:12px}.frpc-path{font:inherit;font-size:12px;line-height:1.6;overflow-wrap:anywhere;white-space:pre-wrap;color:var(--frpc-muted);margin:0}.frpc-progress{width:100%;height:5px;accent-color:var(--frpc-accent)}
.frpc-error{font-size:12px;line-height:1.6;margin:0;overflow-wrap:anywhere}.frpc-notice{font-size:12px;line-height:1.6}.frpc-details summary{font-size:13px;line-height:22px;cursor:pointer;padding:8px 0}.frpc-details-content{display:grid;gap:16px;padding-top:12px}.frpc-footer{display:grid;gap:10px;border-top:1px solid var(--frpc-line);padding-top:18px}.frpc-connection-message{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;line-height:1.6;margin:0}
@container frpc (min-width:540px){.frpc-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}
@container frpc (max-width:360px){.frpc-enable{align-items:flex-start;flex-direction:column;gap:0}.frpc-enable .frpc-help{text-align:left}.frpc-head{align-items:flex-start;flex-direction:column;gap:2px}.frpc-form .frpc-button{white-space:normal}}
`
    Object.assign(zh, {
      hostFiles: '选择主机文件', allowedDirectories: '允许浏览的主机目录', rootsHint: '每行一个完整目录，最多 20 项。留空禁止浏览。选中文件只插入路径，不切换工作区或上传内容。', rootsTooMany: '允许目录最多为 20 项。', root: '允许目录', up: '上一级', filter: '筛选当前目录', filterAction: '筛选', file: '文件', directory: '目录', close: '关闭', cancel: '取消', insertPath: '插入完整路径', selectedFile: '已选文件', noRoots: '尚未配置允许目录。请在「设置 → 远程访问 → 主机文件」中添加目录并保存。', hostFilesSection: '主机文件', fileEmpty: '当前目录没有匹配的文件或目录。', fileLoading: '正在读取目录…', fileFailure: '无法读取主机目录，请检查连接与目录权限。', fileTruncated: '列表仅显示部分结果，请筛选文件名或进入更具体的目录。', fileNote: '浏览运行 dsh 的电脑；确认后将完整路径追加到当前草稿。', fileInsertFailure: '当前对话暂时无法插入路径，请保留选择并重试。', noSelected: '选择一个文件后再插入。', fileSkipped: '符号链接、目录联接和无法访问的文件不会显示。',
    })
    Object.assign(en, {
      hostFiles: 'Choose host file', allowedDirectories: 'Allowed host directories', rootsHint: 'One absolute directory per line, up to 20. Empty disables browsing. Selection inserts a path without changing workspace or uploading content.', rootsTooMany: 'Allow up to 20 directories.', root: 'Allowed directory', up: 'Parent', filter: 'Filter this directory', filterAction: 'Filter', file: 'File', directory: 'Directory', close: 'Close', cancel: 'Cancel', insertPath: 'Insert full path', selectedFile: 'Selected file', noRoots: 'No allowed directories. Add directories under Settings → Remote access → Host files and save.', hostFilesSection: 'Host files', fileEmpty: 'No matching files or directories.', fileLoading: 'Loading directory…', fileFailure: 'Cannot browse host files. Check the connection and directory permissions.', fileTruncated: 'Only part of the directory is shown. Filter by name or open a more specific directory.', fileNote: 'Browse the computer running dsh. Insert appends the full path to this draft.', fileInsertFailure: 'Cannot insert into this conversation right now. Keep the selection and retry.', noSelected: 'Choose a file to insert.', fileSkipped: 'Symbolic links, directory junctions and inaccessible entries are hidden.',
    })
    Object.assign(zh, { invalidRoot: '请为每项填写完整目录，例如 H:\\资料 或 /home/user/data。', browseScope: '浏览范围', allDirectories: '所有目录', selectedDirectories: '指定多个目录', allDirectoriesHint: '可浏览运行 dsh 的系统账号有权限访问的所有目录；支持磁盘切换和完整路径跳转。', jumpDirectory: '跳转到目录', jump: '跳转', customDirectory: '自定义路径' })
    Object.assign(en, { invalidRoot: 'Enter an absolute directory for every entry.', browseScope: 'Browse scope', allDirectories: 'All directories', selectedDirectories: 'Multiple specified directories', allDirectoriesHint: 'Browse directories accessible to the account running dsh, with drive selection and absolute-path navigation.', jumpDirectory: 'Go to directory', jump: 'Go', customDirectory: 'Custom path' })
    const filesCss = `
.frpc-form textarea.frpc-control{height:112px;resize:vertical;min-height:84px;line-height:22px}.frpc-root-field{display:grid;gap:7px}
.frpc-form select.frpc-control,.frpc-picker select.frpc-control{color-scheme:inherit}.frpc-form select.frpc-control option,.frpc-picker select.frpc-control option{background-color:Canvas;color:CanvasText}
.frpc-host-trigger{display:inline-flex;align-items:center;justify-content:center;min-height:32px;padding:4px 9px;border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:6px;background:transparent;color:inherit;font:inherit;font-size:12px;line-height:20px;cursor:pointer;white-space:nowrap}.frpc-host-trigger:disabled{opacity:.5;cursor:default}.frpc-host-trigger:focus-visible{outline:2px solid #2563eb;outline-offset:3px}
.frpc-picker{--frpc-line:color-mix(in srgb,currentColor 18%,transparent);--frpc-muted:color-mix(in srgb,currentColor 68%,transparent);--frpc-accent:#2563eb;--frpc-error:light-dark(#dc2626,#fca5a5);width:min(680px,calc(100vw - 32px));max-height:calc(100dvh - 32px);margin:auto;border:1px solid var(--frpc-line);border-radius:12px;padding:0;background:Canvas;color:CanvasText;font:inherit;box-shadow:0 18px 70px #0004;overflow:auto}.frpc-picker::backdrop{background:#0006}.frpc-picker *{box-sizing:border-box}.frpc-picker-body{display:grid;gap:16px;min-width:0;padding:24px}.frpc-picker h2{font-size:18px;line-height:26px;margin:0;font-weight:600}.frpc-picker p{margin:0}.frpc-picker .frpc-button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:9px 13px;border:1px solid var(--frpc-line);border-radius:6px;background:transparent;color:inherit;font:inherit;font-size:13px;line-height:22px;cursor:pointer}.frpc-picker .frpc-button-primary{background:var(--frpc-accent);border-color:var(--frpc-accent);color:#fff}.frpc-picker .frpc-button:disabled{opacity:.5;cursor:default}.frpc-picker .frpc-control{width:100%;min-width:0;height:42px;border:1px solid var(--frpc-line);border-radius:6px;background:transparent;color:inherit;font:inherit;font-size:14px;padding:9px 11px}.frpc-picker .frpc-label{font-size:13px;line-height:20px;font-weight:500}.frpc-picker .frpc-control:focus-visible,.frpc-picker button:focus-visible{outline:2px solid var(--frpc-accent);outline-offset:2px}.frpc-picker .frpc-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.frpc-picker .frpc-help{font-size:12px;line-height:1.65;color:var(--frpc-muted)}.frpc-picker-nav{display:flex;gap:12px;align-items:center;min-width:0}.frpc-picker-nav .frpc-button{flex:none}.frpc-picker-path{font-size:12px;line-height:1.65;overflow-wrap:anywhere;min-width:0}.frpc-picker-filter{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}.frpc-picker-jump{grid-template-columns:auto minmax(0,1fr) auto}.frpc-file-list{list-style:none;margin:0;padding:0;border-block:1px solid var(--frpc-line);max-height:min(34dvh,320px);min-height:88px;overflow:auto}.frpc-file-list li{margin:0;padding:0}.frpc-file-row{width:100%;display:flex;align-items:center;gap:12px;text-align:left;min-height:44px;border:0;border-bottom:1px solid color-mix(in srgb,currentColor 8%,transparent);background:transparent;color:inherit;font:inherit;font-size:13px;padding:10px 12px;cursor:pointer}.frpc-file-row:hover{background:color-mix(in srgb,currentColor 6%,transparent)}.frpc-file-row[aria-pressed=true]{background:color-mix(in srgb,#2563eb 14%,transparent);box-shadow:inset 3px 0 #2563eb}.frpc-file-name{flex:1;min-width:0;overflow-wrap:anywhere}.frpc-file-kind{flex:none;font-size:12px;color:var(--frpc-muted)}.frpc-picker-empty{padding:20px 12px;font-size:13px;line-height:1.7}.frpc-picker-selection{display:grid;gap:6px;min-width:0}.frpc-picker-footer{display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--frpc-line);padding-top:16px}.frpc-picker .frpc-error{color:var(--frpc-error);font-size:12px;line-height:1.6}
@media(max-width:480px){.frpc-picker-body{padding:16px;gap:12px}.frpc-host-trigger{max-width:120px;white-space:normal}.frpc-picker-footer .frpc-button{flex:1}}
`
    // 使用宿主公开的会话输入事件追加；不替换整份草稿，保留已有引用芯片。
    function appendHostPath(actx, input, path) {
      const state = input.state.getSnapshot()
      if (!['plain', 'claimed'].includes(state.phase)) return false
      const at = state.draft.length - state.occurrences.reduce((sum, item) => sum + item.length - 1, 0)
      const mark = String.fromCharCode(96)
      const runs = path.match(/`+/g) || []
      const fence = mark.repeat(Math.max(0, ...runs.map(run => run.length)) + 1)
      const text = (state.draft && !state.draft.endsWith('\n') ? '\n' : '') + fence + ' ' + path + ' ' + fence + '\n'
      return actx.bail(actx, 'slash/input-insert-text', { text, span: { start: at, end: at, draftRev: state.draftRev } }) === true
    }
    function HostFileDialog({ t, onClose, append }) {
      const id = React.useId(), dialog = React.useRef(), active = React.useRef(), lifetime = React.useRef(new AbortController())
      const [roots, setRoots] = React.useState(null), [rootId, setRootId] = React.useState(0), [all, setAll] = React.useState(false), [directoryPath, setDirectoryPath] = React.useState('')
      const [listing, setListing] = React.useState(null), [selected, setSelected] = React.useState(null), [search, setSearch] = React.useState('')
      const [loading, setLoading] = React.useState(true), [inserting, setInserting] = React.useState(false), [error, setError] = React.useState('')
      const request = async (action, body, controller) => {
        const response = await fetch('./frpc-remote/files/' + action, { credentials: 'same-origin', cache: 'no-store', method: body ? 'POST' : 'GET', headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.any([controller.signal, lifetime.current.signal, AbortSignal.timeout(20000)]) })
        let result
        try { result = await response.json() } catch (_) { throw new Error(t('fileFailure')) }
        if (!response.ok) throw new Error(result.error || t('fileFailure'))
        return result
      }
      const load = async (root, path, query = '') => {
        active.current?.abort(); const controller = new AbortController(); active.current = controller
        setLoading(true); setError(''); setSelected(null); setListing(null)
        try {
          const result = await request('list', { root, path, search: query }, controller)
          if (!controller.signal.aborted && !lifetime.current.signal.aborted) { setListing(result); setRootId(result.root); setDirectoryPath(result.path) }
        } catch (failure) { if (!controller.signal.aborted && !lifetime.current.signal.aborted) setError(failure.message || t('fileFailure')) }
        finally { if (!controller.signal.aborted && !lifetime.current.signal.aborted) setLoading(false) }
      }
      React.useEffect(() => {
        const controller = new AbortController(); lifetime.current = controller
        const element = dialog.current
        element.showModal()
        void request('roots', undefined, controller).then(result => {
          if (controller.signal.aborted) return
          setRoots(result.roots); setAll(result.all === true)
          const first = result.roots.find(root => root.available)
          if (first) { setRootId(first.id); void load(first.id, first.path) }
          else { setLoading(false); if (result.roots.length) setError(result.roots[0].message) }
        }).catch(failure => { if (!controller.signal.aborted) { setLoading(false); setError(failure.message || t('fileFailure')) } })
        return () => { controller.abort(); active.current?.abort(); element.close() }
      }, [])
      const insert = async () => {
        if (!selected || !listing) return
        const controller = new AbortController(); active.current = controller
        setInserting(true); setError('')
        try {
          const result = await request('select', { root: listing.root, path: selected }, controller)
          if (lifetime.current.signal.aborted) return
          if (!append(result.path)) throw new Error(t('fileInsertFailure'))
          onClose()
        } catch (failure) { if (!lifetime.current.signal.aborted) setError(failure.message || t('fileInsertFailure')) }
        finally { if (!lifetime.current.signal.aborted) setInserting(false) }
      }
      const button = (label, onClick, disabled) => h('button', { type: 'button', className: 'frpc-button', onClick, disabled }, label)
      return h('dialog', { ref: dialog, className: 'frpc-picker', 'aria-labelledby': id + '-title', 'aria-describedby': id + '-note', onCancel: event => { event.preventDefault(); onClose() } },
        h('div', { className: 'frpc-picker-body' },
          h('div', { className: 'frpc-head' }, h('h2', { id: id + '-title' }, t('hostFiles')), button(t('close'), onClose, false)),
          h('p', { className: 'frpc-help', id: id + '-note' }, t('fileNote')),
          roots?.length === 0 ? h('p', { className: 'frpc-picker-empty', role: 'status' }, t('noRoots')) : null,
          roots?.length ? h('div', { className: 'frpc-root-field' }, h('label', { className: 'frpc-label', htmlFor: id + '-root' }, t('root')),
            h('select', { id: id + '-root', className: 'frpc-control', value: rootId, disabled: inserting, onChange: event => { const root = roots.find(item => item.id === Number(event.target.value)); setRootId(root.id); setSearch(''); void load(root.id, root.path) } }, rootId === -1 ? h('option', { value: -1 }, t('customDirectory')) : null, roots.map(root => h('option', { key: root.id, value: root.id, disabled: !root.available }, root.path || root.configured)))) : null,
          roots?.some(root => root.available) ? h('form', { className: 'frpc-root-field', onSubmit: event => { event.preventDefault(); void load(all ? -1 : rootId, directoryPath) } }, h('label', { className: 'frpc-label', htmlFor: id + '-path' }, t('jumpDirectory')), h('div', { className: 'frpc-picker-filter frpc-picker-jump' }, button(t('up'), () => { setSearch(''); void load(listing.root, listing.parent) }, !listing?.parent || loading || inserting), h('input', { id: id + '-path', className: 'frpc-control', value: directoryPath, disabled: inserting, onChange: event => setDirectoryPath(event.target.value) }), h('button', { type: 'submit', className: 'frpc-button', disabled: loading || inserting || !directoryPath }, t('jump')))) : null,
          roots?.some(root => root.available) ? h('form', { className: 'frpc-root-field', onSubmit: event => { event.preventDefault(); if (listing) void load(listing.root, listing.path, search) } }, h('label', { className: 'frpc-label', htmlFor: id + '-search' }, t('filter')),
            h('div', { className: 'frpc-picker-filter' }, h('input', { id: id + '-search', className: 'frpc-control', value: search, maxLength: 200, onChange: event => setSearch(event.target.value), disabled: inserting }), h('button', { className: 'frpc-button', type: 'submit', disabled: !listing || loading || inserting }, t('filterAction')))) : null,
          loading ? h('p', { className: 'frpc-picker-empty', role: 'status' }, t('fileLoading')) : null,
          listing ? h('ul', { className: 'frpc-file-list', 'aria-label': t('hostFiles') }, listing.entries.map(entry => h('li', { key: entry.path }, h('button', { type: 'button', className: 'frpc-file-row', disabled: inserting, 'aria-pressed': entry.type === 'file' ? selected === entry.path : undefined, onClick: () => { if (entry.type === 'directory') { setSearch(''); void load(listing.root, entry.path) } else setSelected(entry.path) } }, h('span', { className: 'frpc-file-name' }, entry.name), h('span', { className: 'frpc-file-kind' }, entry.type === 'directory' ? t('directory') : entry.size < 1024 ? entry.size + ' B' : entry.size < 1048576 ? (entry.size / 1024).toFixed(1) + ' KB' : (entry.size / 1048576).toFixed(1) + ' MB')))), !listing.entries.length ? h('li', { className: 'frpc-picker-empty' }, t('fileEmpty')) : null) : null,
          listing?.truncated ? h('p', { className: 'frpc-help', role: 'status' }, t('fileTruncated')) : null,
          listing ? h('p', { className: 'frpc-help' }, t('fileSkipped')) : null,
          error ? h('p', { className: 'frpc-error', role: 'alert' }, error) : null,
          listing ? h('div', { className: 'frpc-picker-selection' }, h('span', { className: 'frpc-label' }, t('selectedFile')), h('p', { className: 'frpc-picker-path', role: 'status' }, selected || t('noSelected'))) : null,
          h('div', { className: 'frpc-picker-footer' }, button(t('cancel'), onClose, false), h('button', { type: 'button', className: 'frpc-button frpc-button-primary', disabled: !selected || loading || inserting, onClick: insert }, t('insertPath')))))
    }
    function HostFilesControl({ t, input, append }) {
      const state = React.useSyncExternalStore(input.state.subscribe.bind(input.state), input.state.getSnapshot.bind(input.state))
      // 把打开时的会话与回调一起固定；宿主复用控件实例时也不会落到新会话。
      const [target, setTarget] = React.useState(null), wasOpen = React.useRef(false)
      const open = target?.input === input
      React.useEffect(() => { if (target && target.input !== input) setTarget(null) }, [input, target])
      React.useEffect(() => { if (wasOpen.current && !open) input.focus(); wasOpen.current = open }, [open])
      return h(React.Fragment, null, h('button', { type: 'button', className: 'frpc-host-trigger', disabled: !['plain', 'claimed'].includes(state.phase), onClick: () => setTarget({ input, append }) }, t('hostFiles')),
        open ? h(HostFileDialog, { t, append: target.append, onClose: () => setTarget(null) }) : null)
    }

    async function writeSettings(form, ops, revision, signal, pause = ms => new Promise(resolve => setTimeout(resolve, ms))) {
      const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right)
      const matches = snapshot => snapshot.status === 'ready' && ops.every(op => op.path[0] !== 'token' && equal(snapshot.value?.[op.path[0]], op.value))
      const before = form.getSnapshot()
      const changes = ops.filter(op => op.path[0] === 'token' || !equal(before.value?.[op.path[0]], op.value))
      if (!changes.length) return 'saved'
      let rejected = false
      try { if (await form.mutate(changes, revision) === true) return 'saved'; rejected = true }
      catch (_) { /* 隧道应用新配置可能中断回包；通过恢复后的宿主快照核对，不自动重放写入。 */ }
      for (let attempt = 0; attempt <= 40; attempt++) {
        if (signal?.aborted) return 'cancelled'
        const snapshot = form.getSnapshot()
        // secret 不回显，无法通过读取快照证明密钥写入；只有成功回包才能确认它。
        if (matches(snapshot)) return 'saved'
        if (rejected && snapshot.status === 'ready' && snapshot.revision !== revision) return 'conflict'
        if (attempt < 40) await pause(200)
      }
      return 'unconfirmed'
    }
    function sameSettings(left, right) { return JSON.stringify(left) === JSON.stringify(right) }
    function canRebaseSettings(state, baseline, draft, clearToken) { return state.status === 'ready' && !draft.token && !clearToken && sameSettings(state.value, baseline) }
    function errorsFor(draft) {
      const errors = {}
      if ((draft.allowedDirectories || []).length > 20) errors.allowedDirectories = 'rootsTooMany'
      else if (!draft.allowAllDirectories && (draft.allowedDirectories || []).some(path => !/^(?:[a-z]:[\\/]|\/|\\\\[^\\]+\\[^\\]+)/i.test(path) || /[\u0000-\u001f\u007f]/.test(path))) errors.allowedDirectories = 'invalidRoot'
      const integer = (key, min, max, message) => { if (!Number.isInteger(draft[key]) || draft[key] < min || draft[key] > max) errors[key] = message }
      integer('serverPort', 1, 65535, 'invalidPort'); integer('remotePort', 0, 65535, 'invalidPort')
      integer('restartDelayMs', 500, 60000, 'invalidDelay'); integer('maxRestarts', 0, 20, 'invalidRestarts')
      if (!draft.enabled) return errors
      for (const key of ['serverAddr', 'proxyName', 'publicUrl']) if (!draft[key]?.trim()) errors[key] = 'required'
      if (/\s|[\u0000-\u001f\u007f]/.test(draft.serverAddr)) errors.serverAddr = 'invalidServer'
      let url
      try { url = new URL(draft.publicUrl) } catch (_) { errors.publicUrl = 'invalidUrl' }
      if (url) {
        if (!/^https?:$/.test(url.protocol) || url.pathname !== '/' || /[\s\\?#@]/.test(draft.publicUrl)) errors.publicUrl = 'invalidUrl'
        else if (url.protocol === 'http:' && !draft.allowInsecureHttp) errors.publicUrl = 'insecure'
        if (draft.proxyType === 'http' && (url.hostname.startsWith('[') || /^\d+(\.\d+){3}$/.test(url.hostname))) errors.publicUrl = 'invalidDomain'
      }
      if (draft.proxyType === 'tcp') integer('remotePort', 1, 65535, 'invalidPort')
      return errors
    }
    function Page({ form, t }) {
      const state = React.useSyncExternalStore(form.subscribe.bind(form), form.getSnapshot.bind(form))
      const id = React.useId()
      const [draft, setDraft] = React.useState(null), [revision, setRevision] = React.useState()
      const [notice, setNotice] = React.useState(''), [error, setError] = React.useState(''), [errors, setErrors] = React.useState({})
      const [saving, setSaving] = React.useState(false), [clearToken, setClearToken] = React.useState(false)
      const [rootsText, setRootsText] = React.useState('')
      const baseline = React.useRef()
      const [status, setStatus] = React.useState(null), [statusError, setStatusError] = React.useState(false), [action, setAction] = React.useState(null)
      const actionController = React.useRef()
      const saveController = React.useRef()
      React.useEffect(() => {
        if (state.status !== 'ready') return
        if (!draft) { baseline.current = state.value; setDraft({ ...state.value, allowedDirectories: state.value.allowedDirectories || [], autoDownload: state.value.autoDownload ?? true, allowAllDirectories: state.value.allowAllDirectories ?? false, token: '' }); setRootsText((state.value.allowedDirectories || []).join('\n')); setRevision(state.revision) }
        // 重新挂载命名空间会增加 revision；内容未变且没有待写密钥时可安全同步。
        else if (canRebaseSettings(state, baseline.current, draft, clearToken)) setRevision(state.revision)
      }, [state, draft, clearToken])
      React.useEffect(() => {
        const controller = new AbortController(); let timer
        const poll = async () => {
          try {
            const response = await fetch('./frpc-remote/status', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) })
            if (!response.ok) throw new Error('status')
            const value = await response.json()
            if (!controller.signal.aborted) { setStatus(value); setStatusError(false) }
          } catch (_) { if (!controller.signal.aborted) setStatusError(true) }
          if (!controller.signal.aborted) timer = setTimeout(poll, 1500)
        }
        void poll()
        return () => { controller.abort(); clearTimeout(timer); actionController.current?.abort(); saveController.current?.abort() }
      }, [])
      if (!draft) return h('p', { role: 'status' }, t(state.status === 'unavailable' ? 'unavailable' : 'loading'))
      const runtime = status?.runtime || { state: 'unchecked' }
      const busy = Boolean(action) || ['checking', 'downloading', 'verifying'].includes(runtime.state)
      const change = (key, value) => { setDraft(old => ({ ...old, [key]: value })); setNotice(''); setError(''); setErrors(old => ({ ...old, [key]: undefined })) }
      const field = (key, type = 'text', hint) => h('div', { className: 'frpc-field', key },
        h('label', { className: 'frpc-label', htmlFor: id + key }, t(key)),
        h('input', { className: 'frpc-control', id: id + key, name: key, type, value: draft[key] ?? '', disabled: saving, autoComplete: type === 'password' ? 'new-password' : 'off', 'aria-invalid': errors[key] ? true : undefined, 'aria-describedby': hint || errors[key] ? id + key + '-help' : undefined,
          onBlur: () => setErrors(old => ({ ...old, [key]: errorsFor(draft)[key] })), onChange: event => change(key, type === 'number' ? (event.target.value === '' ? '' : Number(event.target.value)) : event.target.value) }),
        hint || errors[key] ? h('div', { id: id + key + '-help', className: errors[key] ? 'frpc-error' : 'frpc-help', role: errors[key] ? 'alert' : undefined }, t(errors[key] || hint)) : null)
      const check = key => h('label', { className: 'frpc-check', key }, h('input', { type: 'checkbox', name: key, checked: Boolean(draft[key]), disabled: saving, onChange: event => change(key, event.target.checked) }), t(key))
      const runAction = async operation => {
        setAction(operation); setNotice(''); setError(''); actionController.current = new AbortController()
        try {
          const response = await fetch(`./frpc-remote/runtime/${operation}`, { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: JSON.stringify(operation === 'check' ? { frpcPath: draft.frpcPath || 'auto' } : {}), signal: actionController.current.signal })
          const result = await response.json()
          if (result.runtime) setStatus(old => ({ ...old, runtime: result.runtime }))
          if (!response.ok) throw new Error(result.error || t('actionFailure'))
          if (operation === 'install') { change('frpcPath', 'auto'); setNotice(t('installed')) }
          else setNotice(t('checked'))
        } catch (failure) { if (!actionController.current.signal.aborted) setError(failure.message || t('actionFailure')) }
        finally { setAction(null) }
      }
      const save = async event => {
        event.preventDefault(); const invalid = errorsFor(draft); setErrors(invalid)
        if (Object.keys(invalid).length) return
        setSaving(true); setError(''); setNotice('')
        const ops = Object.entries(draft).filter(([key]) => key !== 'token').map(([key, value]) => ({ op: 'set', path: [key], value }))
        if (clearToken || draft.token) ops.push({ op: 'set', path: ['token'], value: clearToken ? '' : draft.token })
        saveController.current = new AbortController()
        try {
          const result = await writeSettings(form, ops, revision, saveController.current.signal)
          if (result === 'cancelled' || saveController.current.signal.aborted) return
          if (result === 'saved') { setRevision(form.getSnapshot().revision); setDraft(null); setClearToken(false); setNotice(t('saved')) }
          else setError(t(result === 'conflict' ? 'conflict' : 'failure'))
        } catch (_) { if (!saveController.current.signal.aborted) setError(t('failure')) }
        finally { setSaving(false) }
      }
      const progress = runtime.total ? Math.min(100, Math.floor(runtime.received / runtime.total * 100)) : undefined
      const button = (text, onClick, disabled = false) => h('button', { className: 'frpc-button', type: 'button', onClick, disabled }, text)
      return h('div', { className: 'frpc-page' }, h('form', { className: 'frpc-form', onSubmit: save, 'aria-label': t('nav'), noValidate: true },
        h('header', { className: 'frpc-head' }, h('h2', null, t('title')), h('output', { className: 'frpc-status', 'data-state': status?.state, 'aria-label': t('status'), 'aria-live': 'polite' }, t(status?.state || 'starting'))),
        h('p', { className: 'frpc-intro' }, t('intro')), h('div', { className: 'frpc-enable' }, check('enabled'), h('p', { className: 'frpc-help' }, t('enabledHint'))),
        h('section', { className: 'frpc-section', 'aria-label': t('program') }, h('h3', null, t('program')), field('frpcPath', 'text', 'pathHint'),
          h('div', { className: 'frpc-program-actions' }, button(t(action === 'check' ? 'checking' : 'check'), () => runAction('check'), busy || saving), button(t(action === 'install' ? 'installing' : 'install'), () => runAction('install'), busy || saving)),
          h('div', { className: 'frpc-runtime', 'data-state': runtime.state, 'aria-label': t('runtimeTitle') }, h('div', { className: 'frpc-runtime-title' }, h('output', { className: 'frpc-status', 'data-state': runtime.state, 'aria-live': 'polite' }, t(runtime.state)), runtime.version ? h('span', null, runtime.version) : null),
            runtime.path ? h('p', { className: 'frpc-path' }, runtime.path) : null, runtime.source ? h('p', { className: 'frpc-help' }, t(`source_${runtime.source}`)) : null,
            runtime.state === 'downloading' ? h('progress', { className: 'frpc-progress', max: 100, value: progress, 'aria-label': t('downloading') }) : null,
            runtime.state === 'downloading' ? h('span', { className: 'frpc-help' }, progress === undefined ? `${((runtime.received || 0) / 1048576).toFixed(1)} MB` : `${progress}%`) : null,
            runtime.message ? h('p', { className: runtime.state === 'error' ? 'frpc-error' : 'frpc-help' }, runtime.message) : null),
          h('div', null, check('autoDownload'), h('p', { className: 'frpc-help' }, t('autoDownloadHint')))),
        h('section', { className: 'frpc-section', 'aria-label': t('server') }, h('h3', null, t('server')), h('div', { className: 'frpc-grid' }, field('serverAddr'), field('serverPort', 'number')), field('token', 'password', 'tokenHint'),
          h('div', { className: 'frpc-actions' }, h('label', { className: 'frpc-check' }, h('input', { type: 'checkbox', checked: clearToken, disabled: saving, onChange: event => setClearToken(event.target.checked) }), t('clearToken')), h('span', { className: 'frpc-help' }, t(status?.tokenConfigured ? 'secretSet' : 'secretEmpty')))),
        h('section', { className: 'frpc-section', 'aria-label': t('entry') }, h('h3', null, t('entry')), h('div', { className: 'frpc-grid' }, field('proxyName'), h('div', { className: 'frpc-field' }, h('label', { className: 'frpc-label', htmlFor: id + 'proxyType' }, t('proxyType')), h('select', { className: 'frpc-control', id: id + 'proxyType', value: draft.proxyType, disabled: saving, onChange: event => change('proxyType', event.target.value) }, h('option', { value: 'tcp' }, 'TCP'), h('option', { value: 'http' }, 'HTTP')))),
          h('p', { className: 'frpc-help' }, t('nameHint')), draft.proxyType === 'tcp' ? field('remotePort', 'number') : null, field('publicUrl', 'url', 'publicHint')),
        h('details', { className: 'frpc-details' }, h('summary', null, t('advanced')), h('div', { className: 'frpc-details-content' }, h('div', { className: 'frpc-grid' }, field('trustedCaFile'), field('tlsServerName')), check('allowInsecureHttp'), h('div', { className: 'frpc-grid' }, field('restartDelayMs', 'number'), field('maxRestarts', 'number')))),
        h('section', { className: 'frpc-section', 'aria-label': t('hostFilesSection') }, h('h3', null, t('hostFilesSection')), h('div', { className: 'frpc-root-field' }, h('label', { className: 'frpc-label', htmlFor: id + 'browseScope' }, t('browseScope')), h('select', { id: id + 'browseScope', className: 'frpc-control', value: draft.allowAllDirectories ? 'all' : 'selected', disabled: saving, onChange: event => change('allowAllDirectories', event.target.value === 'all') }, h('option', { value: 'selected' }, t('selectedDirectories')), h('option', { value: 'all' }, t('allDirectories')))), draft.allowAllDirectories ? h('p', { className: 'frpc-help' }, t('allDirectoriesHint')) : h('div', { className: 'frpc-root-field' }, h('label', { className: 'frpc-label', htmlFor: id + 'allowedDirectories' }, t('allowedDirectories')), h('textarea', { id: id + 'allowedDirectories', className: 'frpc-control', value: rootsText, disabled: saving, spellCheck: false, 'aria-describedby': id + 'roots-help', onChange: event => { const value = event.target.value; setRootsText(value); change('allowedDirectories', value.split(/\r?\n/).map(line => line.trim()).filter(Boolean)) } }), h('p', { id: id + 'roots-help', className: errors.allowedDirectories ? 'frpc-error' : 'frpc-help' }, t(errors.allowedDirectories || 'rootsHint')))),
        h('footer', { className: 'frpc-footer' }, h('div', { className: 'frpc-actions' }, h('button', { className: 'frpc-button frpc-button-primary', type: 'submit', disabled: saving || busy || !state.writable }, t(saving ? 'saving' : 'save'))),
          error ? h('p', { className: 'frpc-error', role: 'alert' }, error) : null, error ? button(t('reloadConfig'), () => { if (window.confirm(t('discardDraft'))) { setDraft(null); setError(''); setNotice(''); setClearToken(false) } }, saving || state.status !== 'ready') : null, notice ? h('p', { className: 'frpc-notice', role: 'status' }, notice) : null,
          statusError ? h('p', { className: 'frpc-help', role: 'status' }, t('statusFailure')) : null, status?.message ? h('p', { className: 'frpc-connection-message' }, status.message) : null,
          status?.accessUrl ? h('div', { className: 'frpc-actions' }, h('a', { className: 'frpc-button', href: status.accessUrl, target: '_blank', rel: 'noreferrer' }, t('open')), button(t('copy'), async () => { try { await navigator.clipboard.writeText(status.accessUrl); setNotice(t('copied')) } catch (_) { setError(t('copyFailure')) } })) : null)))
    }
    return {
      inject: ['slots', 'locale', 'configForms'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'frpc: locales')
        ctx.effect(() => { const style = document.createElement('style'); style.textContent = css + filesCss; style.dataset.plugin = 'dsh-frpc-remote'; document.head.append(style); return () => style.remove() }, 'frpc: styles')
        const t = ctx.locale.bind(NS), form = ctx.configForms.get('frpc-remote')
        ctx.inject(['sessions', 'conversation'], scope => {
          scope.slots.inject('conversation.input.left', () => scope.slots.register({ name: 'conversation.input.left', id: 'frpc-host-files', order: 40, locale: NS, inject: sessionId => {
            const actx = scope.sessions.scope(sessionId)
            if (!actx) throw new Error('Host file picker requires an active conversation')
            const input = scope.conversation.input.for(actx)
            return { input, append: path => appendHostPath(actx, input, path) }
          } }, HostFilesControl))
        })
        ctx.effect(() => ctx.configForms.whileServed(['frpc-remote'], () => ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: 'frpc-remote', order: 35, label: () => t('nav'), locale: NS, inject: () => ({ form }) }, Page))), 'frpc: settings navigation')
      },
    }
  },
})
