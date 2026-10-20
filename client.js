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
      restartDelayMs: '异常重启间隔（毫秒）', maxRestarts: '最大异常重启次数', save: '保存并应用', saving: '正在保存…', saved: '已保存，正在应用网络配置。',
      failure: '保存失败。配置可能已被其他窗口修改，请保留草稿并重新加载页面。', loading: '正在读取配置…', unavailable: '当前宿主未提供远程访问配置。',
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
      save: 'Save and apply', saving: 'Saving…', saved: 'Saved. Applying network configuration.', failure: 'Save failed. Another window may have changed this configuration. Keep your draft and reload.', loading: 'Loading configuration…', unavailable: 'Remote access configuration is unavailable on this host.',
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
    function errorsFor(draft) {
      const errors = {}
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
      const [status, setStatus] = React.useState(null), [statusError, setStatusError] = React.useState(false), [action, setAction] = React.useState(null)
      const actionController = React.useRef()
      React.useEffect(() => {
        if (state.status === 'ready' && !draft) { setDraft({ ...state.value, autoDownload: state.value.autoDownload ?? true, token: '' }); setRevision(state.revision) }
      }, [state, draft])
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
        return () => { controller.abort(); clearTimeout(timer); actionController.current?.abort() }
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
        try {
          if (!await form.mutate(ops, revision)) throw new Error('rejected')
          setDraft(null); setClearToken(false); setNotice(t('saved'))
        } catch (_) { setError(t('failure')) }
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
        h('footer', { className: 'frpc-footer' }, h('div', { className: 'frpc-actions' }, h('button', { className: 'frpc-button frpc-button-primary', type: 'submit', disabled: saving || busy || !state.writable }, t(saving ? 'saving' : 'save'))),
          error ? h('p', { className: 'frpc-error', role: 'alert' }, error) : null, notice ? h('p', { className: 'frpc-notice', role: 'status' }, notice) : null,
          statusError ? h('p', { className: 'frpc-help', role: 'status' }, t('statusFailure')) : null, status?.message ? h('p', { className: 'frpc-connection-message' }, status.message) : null,
          status?.accessUrl ? h('div', { className: 'frpc-actions' }, h('a', { className: 'frpc-button', href: status.accessUrl, target: '_blank', rel: 'noreferrer' }, t('open')), button(t('copy'), async () => { try { await navigator.clipboard.writeText(status.accessUrl); setNotice(t('copied')) } catch (_) { setError(t('copyFailure')) } })) : null)))
    }
    return {
      inject: ['slots', 'locale', 'configForms'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'frpc: locales')
        ctx.effect(() => { const style = document.createElement('style'); style.textContent = css; style.dataset.plugin = 'dsh-frpc-remote'; document.head.append(style); return () => style.remove() }, 'frpc: styles')
        const t = ctx.locale.bind(NS), form = ctx.configForms.get('frpc-remote')
        ctx.effect(() => ctx.configForms.whileServed(['frpc-remote'], () => ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: 'frpc-remote', order: 35, label: () => t('nav'), locale: NS, inject: () => ({ form }) }, Page))), 'frpc: settings navigation')
      },
    }
  },
})
