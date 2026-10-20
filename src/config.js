import Schema from '@deepseek-ai/schemastery'
import { validateRoots } from './host-files.js'

export const fields = Schema.object({
  enabled: Schema.boolean().default(false).description('启用远程访问'),
  frpcPath: Schema.string().default('auto').description('frpc 路径；auto 或留空自动检测'),
  autoDownload: Schema.boolean().default(true).description('找不到 frpc 时自动下载并校验官方版本'),
  allowedDirectories: Schema.array(Schema.string()).default([]).description('允许在对话中浏览的主机目录；空列表禁止浏览'),
  allowAllDirectories: Schema.boolean().default(false).description('允许浏览主机所有目录；仍受系统权限限制'),
  serverAddr: Schema.string().default('').description('frps 服务器地址'),
  serverPort: Schema.natural().min(1).max(65535).default(7000).description('frps 端口'),
  token: Schema.string().role('secret').default('').description('frps Token；留空保留已存值'),
  proxyName: Schema.string().default('dsh-remote').description('代理名称；同一 frps 上必须唯一'),
  proxyType: Schema.union(['tcp', 'http']).default('tcp').description('代理类型'),
  remotePort: Schema.natural().max(65535).default(0).description('TCP 映射端口'),
  publicUrl: Schema.string().default('').description('浏览器访问地址，例如 https://dsh.example.com/'),
  trustedCaFile: Schema.string().default('').description('frps TLS CA 文件，可选'),
  tlsServerName: Schema.string().default('').description('frps TLS 证书名称，可选'),
  allowInsecureHttp: Schema.boolean().default(false).description('允许明文 HTTP（仅用于可信网络）'),
  restartDelayMs: Schema.natural().min(500).max(60000).default(3000).description('frpc 异常退出后的重启间隔（毫秒）'),
  maxRestarts: Schema.natural().max(20).default(3).description('frpc 异常退出最大重启次数'),
})

export function validate(config) {
  validateRoots(config.allowedDirectories ?? [])
  if (!config.enabled) return config
  for (const key of ['serverAddr', 'proxyName', 'publicUrl']) {
    if (!config[key]?.trim()) throw new Error(`${key} 不能为空`)
  }
  if (/\s|[\u0000-\u001f\u007f]/u.test(config.serverAddr)) throw new Error('serverAddr 只能填写主机名或 IP')
  if (!/^https?:\/\//i.test(config.publicUrl) || /[\s\\?#@]/u.test(config.publicUrl)) {
    throw new Error('publicUrl 必须是无用户名、查询参数和片段的 HTTP(S) 根地址')
  }
  const url = new URL(config.publicUrl)
  if (url.pathname !== '/') throw new Error('publicUrl 请使用独立域名或端口的根地址 /')
  if (url.protocol === 'http:' && !config.allowInsecureHttp) throw new Error('请使用 HTTPS，或明确勾选允许明文 HTTP')
  if (config.proxyType === 'tcp' && config.remotePort < 1) throw new Error('TCP 模式必须填写 remotePort')
  if (config.proxyType === 'http' && (url.hostname.startsWith('[') || /^\d+(\.\d+){3}$/.test(url.hostname))) {
    throw new Error('HTTP 虚拟主机模式需要域名')
  }
  return config
}

// 在 schema 校验期间拒绝不完整的启用配置，避免先落盘再报错。
export const Config = fields.volatile()
const standard = Config['~standard']
// 保留 object schema 供内置表单/密钥脱敏使用，跨字段约束走 Cordis
// 原生 Standard Schema 校验入口，不把 transform 函数发送到客户端。
Object.defineProperty(Config, '~standard', { value: { ...standard, validate(value) {
  const result = standard.validate(value)
  if (result.issues) return result
  try { validate(result.value.get()); return result }
  catch (error) { return { issues: [{ message: error.message }] } }
} } })

export function publicAuthorities(config) {
  if (!config.enabled) return []
  const url = new URL(config.publicUrl)
  // 浏览器省略默认端口；frpc 后端通常为 HTTP，不能擅自补 :443，
  // 否则 DSH 会把合法的 HTTPS 入口 Host 判为不可信。
  return [url.host]
}

export function renderToml(config, local) {
  const q = (value) => JSON.stringify(value)
  const lines = [
    `serverAddr = ${q(config.serverAddr)}`, `serverPort = ${config.serverPort}`,
    'loginFailExit = false', 'auth.method = "token"',
    'auth.token = "{{ .Envs.DSH_FRPC_AUTH_TOKEN }}"', 'transport.tls.enable = true',
    'log.to = "console"', 'log.level = "info"', 'log.disablePrintColor = true',
  ]
  if (config.trustedCaFile) lines.push(`transport.tls.trustedCaFile = ${q(config.trustedCaFile)}`)
  if (config.tlsServerName) lines.push(`transport.tls.serverName = ${q(config.tlsServerName)}`)
  lines.push('', '[[proxies]]', `name = ${q(config.proxyName)}`, `type = ${q(config.proxyType)}`,
    `localIP = ${q(local.host)}`, `localPort = ${local.port}`)
  if (config.proxyType === 'tcp') lines.push(`remotePort = ${config.remotePort}`)
  else lines.push(`customDomains = [${q(new URL(config.publicUrl).hostname)}]`)
  return `${lines.join('\n')}\n`
}
