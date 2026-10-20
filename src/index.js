import { Config, publicAuthorities } from './config.js'
import { Tunnel } from './tunnel.js'
export { Config }
export const name = 'frpc-remote'

export function apply(ctx, reference) {
  const config = reference.get()
  const original = JSON.stringify(config)
  ctx.provide('frpcRemoteAccess', { authorities: publicAuthorities(config) })
  ctx.inject(['settings'], (settings) => {
    settings.effect(() => settings.settings.configure({ auto: false }, ctx.fiber), 'frpc: dedicated settings page')
  })

  // 配置表单更新 volatile 引用后，重建提供方，让依赖它的 Connection
  // 通过正常注入生命周期刷新可信域名；不修改 Connection 的内部字段。
  let restarting = false
  ctx.on('app-boot/config-reload', () => {
    if (restarting || JSON.stringify(reference.get()) === original) return
    restarting = true
    void ctx.fiber.restart().catch((error) => ctx.logger.error(error))
  })

  ctx.inject(['webServer', 'connection'], (host) => {
    const carrier = host.webServer
    if (!['127.0.0.1', '::1'].includes(carrier.host)) throw new Error('frpc 插件要求 dsh Web 服务只监听回环地址')
    const tunnel = new Tunnel(config, { host: carrier.host, port: carrier.port, protocol: carrier.protocol })
    host.effect(() => () => tunnel.stop(), 'frpc: managed child and temporary configuration')
    host.effect(() => carrier.register({ kind: 'exact', path: '/frpc-remote/status', handler(req, res) {
      const rejection = host.connection.requestRejection(req)
      res.setHeader('cache-control', 'no-store')
      if (rejection !== undefined) { res.writeHead(rejection); res.end(); return }
      if (req.method !== 'GET') { res.writeHead(405, { Allow: 'GET' }); res.end(); return }
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ ...tunnel.status, localPort: carrier.port, tokenConfigured: Boolean(config.token),
        publicUrl: config.enabled ? config.publicUrl : undefined,
        accessUrl: config.enabled ? host.connection.authenticatedUrl(config.publicUrl) : undefined }))
    } }), 'frpc: authenticated status route')
    // 不阻塞 Loader 启动：即使 frpc 不存在，设置页仍可打开并修正路径。
    let cancelled = false
    host.effect(() => () => { cancelled = true }, 'frpc: startup cancellation')
    void (host.get('loader')?.await() ?? Promise.resolve()).then(() => {
      if (!cancelled) return tunnel.start()
    }).catch(() => { /* Loader 的启动错误由宿主报告，不启动隧道。 */ })
  })
}
