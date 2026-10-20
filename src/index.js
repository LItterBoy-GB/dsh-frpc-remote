import { Config, publicAuthorities } from './config.js'
import { Tunnel } from './tunnel.js'
import { FrpcRuntime } from './frpc-runtime.js'
import { HostFiles } from './host-files.js'
export { Config }
export const name = 'frpc-remote'

export function apply(ctx, reference) {
  const config = reference.get()
  const networkConfig = value => JSON.stringify(Object.fromEntries(Object.entries(value).filter(([key]) => !['allowedDirectories', 'allowAllDirectories'].includes(key))))
  const original = networkConfig(config)
  ctx.provide('frpcRemoteAccess', { authorities: publicAuthorities(config) })
  ctx.inject(['settings'], (settings) => {
    settings.effect(() => settings.settings.configure({ auto: false }, ctx.fiber), 'frpc: dedicated settings page')
  })

  // 配置表单更新 volatile 引用后，重建提供方，让依赖它的 Connection
  // 通过正常注入生命周期刷新可信域名；不修改 Connection 的内部字段。
  let restarting = false, restartTimer
  ctx.effect(() => () => clearTimeout(restartTimer), 'frpc: delayed configuration apply')
  ctx.on('app-boot/config-reload', () => {
    if (restarting) return
    clearTimeout(restartTimer)
    if (networkConfig(reference.get()) === original) return
    // 先让原生 settings RPC 返回保存结果，再断开承载该请求的 frpc 隧道。
    restartTimer = setTimeout(() => {
      restarting = true
      void ctx.fiber.restart().catch((error) => ctx.logger.error(error))
    }, 1000)
  })

  ctx.inject(['webServer', 'connection'], (host) => {
    const carrier = host.webServer
    if (!['127.0.0.1', '::1'].includes(carrier.host)) throw new Error('frpc 插件要求 dsh Web 服务只监听回环地址')
    const runtime = new FrpcRuntime({ home: host.get('profileContext')?.home })
    let files, filesKey
    const currentFiles = () => {
      const current = reference.get(), key = JSON.stringify([current.allowedDirectories, current.allowAllDirectories])
      if (!files || key !== filesKey) { files = new HostFiles(current.allowedDirectories, current.allowAllDirectories); filesKey = key }
      return files
    }
    for (const action of ['roots', 'list', 'select']) {
      host.effect(() => carrier.register({ kind: 'exact', path: `/frpc-remote/files/${action}`, async handler(req, res) {
        res.setHeader('cache-control', 'no-store')
        const rejection = host.connection.requestRejection(req)
        if (rejection !== undefined) { res.writeHead(rejection); res.end(); return }
        const method = action === 'roots' ? 'GET' : 'POST'
        if (req.method !== method) { res.writeHead(405, { Allow: method }); res.end(); return }
        res.setHeader('content-type', 'application/json; charset=utf-8')
        const controller = new AbortController()
        const cancel = () => controller.abort()
        res.once('close', cancel)
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15000)])
        try {
          const body = action === 'roots' ? undefined : await readJson(req)
          const files = currentFiles()
          const result = action === 'roots' ? { roots: await files.rootsSnapshot(), all: files.allowAll } : await files[action](body, signal)
          if (!signal.aborted) res.end(JSON.stringify(result))
          else if (!res.destroyed) { res.writeHead(408); res.end(JSON.stringify({ error: '文件浏览已取消或超时' })) }
        } catch (error) {
          if (!res.destroyed) { res.writeHead(error.status || 400); res.end(JSON.stringify({ error: error.message })) }
        } finally { res.off('close', cancel) }
      } }), `frpc: authenticated files ${action}`)
    }
    host.effect(() => () => runtime.dispose(), 'frpc: cancel runtime operations')
    const tunnel = new Tunnel(config, { host: carrier.host, port: carrier.port, protocol: carrier.protocol }, undefined, undefined,
      () => runtime.ensure(config.frpcPath, config.autoDownload))
    host.effect(() => () => tunnel.stop(), 'frpc: managed child and temporary configuration')
    host.effect(() => carrier.register({ kind: 'exact', path: '/frpc-remote/status', handler(req, res) {
      const rejection = host.connection.requestRejection(req)
      res.setHeader('cache-control', 'no-store')
      if (rejection !== undefined) { res.writeHead(rejection); res.end(); return }
      if (req.method !== 'GET') { res.writeHead(405, { Allow: 'GET' }); res.end(); return }
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ ...tunnel.status, runtime: runtime.status, localPort: carrier.port, tokenConfigured: Boolean(config.token),
        publicUrl: config.enabled ? config.publicUrl : undefined,
        accessUrl: config.enabled ? host.connection.authenticatedUrl(config.publicUrl) : undefined }))
    } }), 'frpc: authenticated status route')
    for (const action of ['check', 'install']) {
      host.effect(() => carrier.register({ kind: 'exact', path: `/frpc-remote/runtime/${action}`, async handler(req, res) {
        res.setHeader('cache-control', 'no-store')
        const rejection = host.connection.requestRejection(req)
        if (rejection !== undefined) { res.writeHead(rejection); res.end(); return }
        if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); res.end(); return }
        res.setHeader('content-type', 'application/json; charset=utf-8')
        try {
          const body = await readJson(req)
          if (action === 'check') {
            if (typeof body.frpcPath !== 'string' || body.frpcPath.length > 4096) throw new Error('frpcPath 必须是有效路径字符串')
            await runtime.check(body.frpcPath)
          } else {
            await runtime.install()
            if (config.enabled && (!config.frpcPath.trim() || ['auto', 'frpc', 'frpc.exe'].includes(config.frpcPath.toLowerCase()))) void tunnel.start()
          }
          res.end(JSON.stringify({ runtime: runtime.status }))
        } catch (error) {
          res.writeHead(error.status || 400)
          res.end(JSON.stringify({ error: error.message, runtime: runtime.status }))
        }
      } }), `frpc: authenticated runtime ${action}`)
    }
    // 不阻塞 Loader 启动：即使 frpc 不存在，设置页仍可打开并修正路径。
    let cancelled = false
    host.effect(() => () => { cancelled = true }, 'frpc: startup cancellation')
    void (host.get('loader')?.await() ?? Promise.resolve()).then(() => {
      if (!cancelled) return config.enabled ? tunnel.start() : runtime.check(config.frpcPath)
    }).catch(() => { /* Loader 的启动错误由宿主报告，不启动隧道。 */ })
  })
}

// 小型、限长的 JSON 请求；超限后丢弃后续字节，避免把整个请求积存在内存中。
function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0, failed = false
    req.on('data', chunk => {
      if (failed) return
      size += chunk.length
      if (size > 8192) { failed = true; reject(Object.assign(new Error('请求内容过大'), { status: 413 })); return }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (failed) return
      try {
        const value = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('请求必须为 JSON 对象')
        resolve(value)
      } catch (_) { reject(new Error('请求必须为 JSON 对象')) }
    })
    req.on('error', reject)
  })
}
