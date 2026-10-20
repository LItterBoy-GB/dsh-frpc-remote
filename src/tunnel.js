import { spawn } from 'node:child_process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { renderToml, validate } from './config.js'

export function redact(message, secret) {
  let text = String(message)
  if (secret) text = text.split(secret).join('[redacted]')
  return text.replace(/([?&]token=)[^\s&"']+/gi, '$1[redacted]').slice(-1000)
}

/** Own exactly one frpc child (including verify), its retries and temporary file. */
export class Tunnel {
  constructor(config, local, onStatus = () => {}, spawnProcess = spawn, resolveExecutable = async () => config.frpcPath) {
    this.config = validate(config)
    this.local = local
    this.onStatus = onStatus
    this.status = { state: config.enabled ? 'starting' : 'disabled', restarts: 0 }
    this.closed = false
    this.spawnProcess = spawnProcess
    this.resolveExecutable = resolveExecutable
  }
  publish(patch) {
    this.status = { ...this.status, ...patch }
    this.onStatus(this.status)
  }
  start() {
    if (!this.config.enabled || this.closed || this.child) return Promise.resolve()
    if (!this.starting) this.starting = this.startInternal().finally(() => { this.starting = undefined })
    return this.starting
  }
  async startInternal() {
    this.publish({ state: 'starting', message: undefined, restarts: 0 })
    try {
      if (this.config.proxyType === 'http' && this.local.protocol === 'https:') throw new Error('HTTP 代理模式需要本机 DSH 使用 HTTP；本机 HTTPS 请使用 TCP 模式')
      this.executable = await this.resolveExecutable()
      if (this.closed) return
      if (this.directory) await rm(this.directory, { recursive: true, force: true })
      this.directory = await mkdtemp(join(tmpdir(), 'dsh-frpc-'))
      if (this.closed) return
      this.file = join(this.directory, 'frpc.toml')
      await writeFile(this.file, renderToml(this.config, this.local), { mode: 0o600 })
      if (this.closed) return
      await this.verify()
      if (!this.closed) this.launch()
    } catch (error) {
      if (!this.closed) this.publish({ state: 'error', message: redact(error.message, this.config.token) })
    } finally {
      if (this.closed && this.directory) await rm(this.directory, { recursive: true, force: true })
    }
  }
  options() {
    return { shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, DSH_FRPC_AUTH_TOKEN: this.config.token || '' } }
  }
  verify() {
    return new Promise((resolve, reject) => {
      const child = this.spawnProcess(this.executable, ['verify', '-c', this.file], this.options())
      this.child = child
      let output = ''
      const collect = (chunk) => { output = (output + chunk.toString()).slice(-8192) }
      child.stdout.on('data', collect)
      child.stderr.on('data', collect)
      const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('frpc verify 超时')) }, 10000)
      child.once('error', (error) => { clearTimeout(timer); reject(error) })
      child.once('close', (code) => {
        clearTimeout(timer)
        if (this.child === child) this.child = undefined
        if (code === 0) resolve()
        else reject(new Error(`frpc verify 失败 (${code}): ${output}`))
      })
    })
  }
  launch() {
    if (this.closed) return
    const child = this.spawnProcess(this.executable, ['-c', this.file], this.options())
    this.child = child
    this.publish({ state: 'connecting', message: undefined })
    let pending = ''
    const collect = (chunk) => {
      pending = (pending + chunk.toString()).slice(-16384)
      const lines = pending.split(/\r?\n/)
      pending = lines.pop() ?? ''
      for (const line of lines) {
        if (/start proxy success/i.test(line)) this.publish({ state: 'connected', message: undefined })
        else if (/login to server failed|connect to server error|start error|reconnect|closed the connection|session closed/i.test(line)) {
          this.publish({ state: 'connecting', message: redact(line, this.config.token) })
        }
      }
    }
    child.stdout.on('data', collect)
    child.stderr.on('data', collect)
    child.once('error', (error) => this.publish({ state: 'error', message: redact(error.message, this.config.token) }))
    child.once('close', (code) => {
      if (this.child === child) this.child = undefined
      if (this.closed) return
      if (this.status.restarts >= this.config.maxRestarts) {
        this.publish({ state: 'error', message: `frpc 已退出 (${code})，达到重启上限` })
        return
      }
      this.publish({ state: 'retrying', restarts: this.status.restarts + 1, message: `frpc 已退出 (${code})` })
      this.timer = setTimeout(() => this.launch(), this.config.restartDelayMs)
    })
  }
  async stop() {
    this.closed = true
    clearTimeout(this.timer)
    const child = this.child
    if (child && child.exitCode === null && child.signalCode === null) {
      await new Promise((resolve) => {
        const timer = setTimeout(() => child.kill('SIGKILL'), 2500)
        child.once('close', () => { clearTimeout(timer); resolve() })
        child.kill('SIGTERM')
      })
    }
    if (this.directory) await rm(this.directory, { recursive: true, force: true })
    this.publish({ state: 'disabled' })
  }
}
