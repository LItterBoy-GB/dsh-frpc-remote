import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { access, readFile } from 'node:fs/promises'
import { Config } from '../src/config.js'
import { Tunnel, redact } from '../src/tunnel.js'
const fixture = fileURLToPath(new URL('./fixture-frpc.js', import.meta.url))
function config(patch = {}) {
  return Config['~standard'].validate({ enabled: true, serverAddr: '127.0.0.1', publicUrl: 'https://dsh.example.com/', remotePort: 18080, restartDelayMs: 500, ...patch }).value.get()
}
const spawnPlainFixture = (_, args, options) => spawn(process.execPath, [fixture, ...args], options)
async function until(check, ms = 5000) {
  const limit = Date.now() + ms
  while (!check()) { if (Date.now() > limit) throw new Error('timed out'); await new Promise((r) => setTimeout(r, 20)) }
}
test('real child verify, split-line readiness, stop and private-file cleanup', async () => {
  const tunnel = new Tunnel(config({ token: 'secret' }), { host: '127.0.0.1', port: 45123 }, undefined, spawnPlainFixture)
  try {
    await tunnel.start()
    await until(() => tunnel.status.state === 'connected')
    assert.ok(!String(await readFile(tunnel.file)).includes('secret'))
    const child = tunnel.child
    await tunnel.stop()
    assert.equal(tunnel.status.state, 'disabled')
    assert.ok(child.exitCode !== null || child.signalCode !== null)
    await assert.rejects(access(tunnel.directory))
  } finally { await tunnel.stop() }
})
test('verification error is visible but its token is redacted', async () => {
  const tunnel = new Tunnel(config({ token: 'verify-fail' }), { host: '127.0.0.1', port: 45000 }, undefined, spawnPlainFixture)
  try {
    await tunnel.start()
    assert.equal(tunnel.status.state, 'error')
    assert.match(tunnel.status.message, /redacted/)
    assert.ok(!tunnel.status.message.includes('verify-fail'))
  } finally { await tunnel.stop() }
})
test('unexpected child exits retry only to the configured limit', async () => {
  const tunnel = new Tunnel(config({ token: 'exit-fast', maxRestarts: 1 }), { host: '127.0.0.1', port: 45000 }, undefined, spawnPlainFixture)
  try {
    await tunnel.start()
    await until(() => tunnel.status.state === 'error')
    assert.equal(tunnel.status.restarts, 1)
    assert.equal(tunnel.child, undefined)
  } finally { await tunnel.stop() }
})
test('disposing during startup leaves no child or temporary directory', async () => {
  const tunnel = new Tunnel(config(), { host: '127.0.0.1', port: 45000 }, undefined, spawnPlainFixture)
  const start = tunnel.start()
  await tunnel.stop(); await start
  assert.equal(tunnel.child, undefined)
  if (tunnel.directory) await assert.rejects(access(tunnel.directory))
})
test('diagnostics remove raw credentials and token-bearing URLs', () => {
  assert.equal(redact('secret https://x/?token=abc secret', 'secret'), '[redacted] https://x/?token=[redacted] [redacted]')
})
