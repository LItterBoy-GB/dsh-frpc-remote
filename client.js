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
    const css = `.dsh-frpc{max-width:720px;display:grid;gap:20px;font:inherit;color:inherit}.dsh-frpc h2{margin:0;font-size:20px}.dsh-frpc p{margin:0;line-height:1.6;opacity:.8}.dsh-frpc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.dsh-frpc label{display:grid;gap:7px;font-size:14px;min-width:0}.dsh-frpc input:not([type=checkbox]),.dsh-frpc select{box-sizing:border-box;width:100%;min-height:40px;border:1px solid color-mix(in srgb,currentColor 25%,transparent);border-radius:7px;padding:8px 10px;background:transparent;color:inherit;font:inherit}.dsh-frpc input:focus-visible,.dsh-frpc select:focus-visible,.dsh-frpc button:focus-visible,.dsh-frpc summary:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}.dsh-frpc .dsh-frpc-check{display:flex;align-items:center;gap:9px;min-height:40px}.dsh-frpc small{line-height:1.5;opacity:.75}.dsh-frpc button,.dsh-frpc a{font:inherit;padding:9px 14px;min-height:40px;border-radius:7px;border:1px solid color-mix(in srgb,currentColor 30%,transparent);background:transparent;color:inherit;cursor:pointer;text-decoration:none}.dsh-frpc button:disabled{opacity:.5;cursor:default}.dsh-frpc button[type=submit]{background:#2563eb;color:white;border-color:#2563eb}.dsh-frpc-status{border:1px solid color-mix(in srgb,currentColor 20%,transparent);border-radius:10px;padding:16px;display:grid;gap:12px}.dsh-frpc-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.dsh-frpc [role=alert]{color:#d45454}.dsh-frpc details>div{margin-top:16px;display:grid;gap:16px}.dsh-frpc summary{cursor:pointer;padding:8px 0}.dsh-frpc output{font-weight:600}.dsh-frpc pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:0;font-size:12px}@media(max-width:600px){.dsh-frpc-grid{grid-template-columns:1fr}}`

    function Page({ form, t }) {
      const state = React.useSyncExternalStore(form.subscribe.bind(form), form.getSnapshot.bind(form))
      const [draft, setDraft] = React.useState(null)
      const [revision, setRevision] = React.useState()
      const [notice, setNotice] = React.useState('')
      const [error, setError] = React.useState('')
      const [saving, setSaving] = React.useState(false)
      const [clearToken, setClearToken] = React.useState(false)
      const [status, setStatus] = React.useState(null)
      const [statusError, setStatusError] = React.useState(false)
      React.useEffect(() => {
        if (state.status === 'ready' && !draft) {
          setDraft({ ...state.value, token: '' })
          setRevision(state.revision)
        }
      }, [state, draft])
      React.useEffect(() => {
        const controller = new AbortController()
        let timer
        const poll = async () => {
          try {
            const response = await fetch('./frpc-remote/status', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
            if (!response.ok) throw new Error('status')
            const value = await response.json()
            if (!controller.signal.aborted) { setStatus(value); setStatusError(false) }
          } catch (_) { if (!controller.signal.aborted) setStatusError(true) }
          if (!controller.signal.aborted) timer = setTimeout(poll, 3000)
        }
        void poll()
        return () => { controller.abort(); clearTimeout(timer) }
      }, [])
      if (!draft) return h('p', { role: 'status' }, t(state.status === 'unavailable' ? 'unavailable' : 'loading'))
      const change = (key, value) => { setDraft((old) => ({ ...old, [key]: value })); setNotice(''); setError('') }
      const field = (key, type = 'text', hint) => h('label', { key }, t(key), h('input', { name: key, type,
        value: draft[key] ?? '', disabled: saving, autoComplete: type === 'password' ? 'new-password' : 'off',
        min: type === 'number' ? 0 : undefined, onChange: (event) => change(key, type === 'number' ? (event.target.value === '' ? '' : Number(event.target.value)) : event.target.value) }),
        hint ? h('small', null, t(hint)) : null)
      const check = (key) => h('label', { className: 'dsh-frpc-check', key }, h('input', { type: 'checkbox', checked: Boolean(draft[key]), disabled: saving, onChange: (event) => change(key, event.target.checked) }), t(key))
      const validate = () => {
        if (!Number.isInteger(draft.serverPort) || draft.serverPort < 1 || draft.serverPort > 65535) return 'invalidPort'
        if (!Number.isInteger(draft.restartDelayMs) || draft.restartDelayMs < 500 || draft.restartDelayMs > 60000 || !Number.isInteger(draft.maxRestarts) || draft.maxRestarts < 0 || draft.maxRestarts > 20) return 'invalidAdvanced'
        if (!draft.enabled) return ''
        if (['frpcPath', 'serverAddr', 'proxyName', 'publicUrl'].some((key) => !draft[key]?.trim())) return 'invalidRequired'
        let url
        try { url = new URL(draft.publicUrl) } catch (_) { return 'invalidUrl' }
        if (!/^https?:$/.test(url.protocol) || url.pathname !== '/' || /[\s\\?#@]/.test(draft.publicUrl)) return 'invalidUrl'
        if (url.protocol === 'http:' && !draft.allowInsecureHttp) return 'insecure'
        if (draft.proxyType === 'tcp' && (!Number.isInteger(draft.remotePort) || draft.remotePort < 1 || draft.remotePort > 65535)) return 'invalidPort'
        return ''
      }
      const save = async (event) => {
        event.preventDefault()
        const invalid = validate()
        if (invalid) { setError(t(invalid)); return }
        setSaving(true); setError(''); setNotice('')
        const ops = Object.entries(draft).filter(([key]) => key !== 'token').map(([key, value]) => ({ op: 'set', path: [key], value }))
        if (clearToken || draft.token) ops.push({ op: 'set', path: ['token'], value: clearToken ? '' : draft.token })
        try {
          const accepted = await form.mutate(ops, revision)
          if (!accepted) throw new Error('rejected')
          setDraft(null); setClearToken(false); setNotice(t('saved'))
        } catch (_) { setError(t('failure')) }
        finally { setSaving(false) }
      }
      return h('form', { className: 'dsh-frpc', onSubmit: save, 'aria-label': t('nav') },
        h('h2', null, t('title')), h('p', null, t('description')), check('enabled'),
        field('frpcPath'), h('div', { className: 'dsh-frpc-grid' }, field('serverAddr'), field('serverPort', 'number')),
        field('token', 'password', 'tokenHint'), h('label', { className: 'dsh-frpc-check' }, h('input', { type: 'checkbox', checked: clearToken, disabled: saving, onChange: (event) => setClearToken(event.target.checked) }), t('clearToken')),
        h('div', { className: 'dsh-frpc-grid' }, field('proxyName', 'text', 'nameHint'), h('label', null, t('proxyType'), h('select', { value: draft.proxyType, disabled: saving, onChange: (event) => change('proxyType', event.target.value) }, h('option', { value: 'tcp' }, 'TCP'), h('option', { value: 'http' }, 'HTTP')))),
        draft.proxyType === 'tcp' ? field('remotePort', 'number') : null, field('publicUrl', 'url', 'publicHint'),
        h('details', null, h('summary', null, t('advanced')), h('div', null, field('trustedCaFile'), field('tlsServerName'), check('allowInsecureHttp'), h('div', { className: 'dsh-frpc-grid' }, field('restartDelayMs', 'number'), field('maxRestarts', 'number')))),
        h('div', { className: 'dsh-frpc-actions' }, h('button', { type: 'submit', disabled: saving || !state.writable }, t(saving ? 'saving' : 'save'))),
        error ? h('p', { role: 'alert' }, error) : null, notice ? h('p', { role: 'status' }, notice) : null,
        h('section', { className: 'dsh-frpc-status', 'aria-label': t('status') }, h('div', null, `${t('status')}: `, h('output', { 'aria-live': 'polite' }, t(status?.state || 'starting'))),
          statusError ? h('p', { role: 'status' }, t('statusFailure')) : null, status?.message ? h('pre', null, status.message) : null,
          status?.accessUrl ? h('div', { className: 'dsh-frpc-actions' }, h('a', { href: status.accessUrl, target: '_blank', rel: 'noreferrer' }, t('open')), h('button', { type: 'button', onClick: async () => {
            try { await navigator.clipboard.writeText(status.accessUrl); setNotice(t('copied')) } catch (_) { setError(t('failure')) }
          } }, t('copy'))) : null))
    }
    return {
      inject: ['slots', 'locale', 'configForms'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'frpc: locales')
        ctx.effect(() => {
          const style = document.createElement('style'); style.textContent = css; style.dataset.plugin = 'dsh-frpc-remote'; document.head.append(style)
          return () => style.remove()
        }, 'frpc: styles')
        const t = ctx.locale.bind(NS)
        const form = ctx.configForms.get('frpc-remote')
        ctx.effect(() => ctx.configForms.whileServed(['frpc-remote'], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section', id: 'frpc-remote', order: 35, label: () => t('nav'), locale: NS, inject: () => ({ form }),
        }, Page))), 'frpc: settings navigation')
      },
    }
  },
})
