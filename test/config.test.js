import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Config, publicAuthorities, renderToml } from '../src/config.js'

export function config(patch = {}) {
  const result = Config['~standard'].validate({ enabled: true, serverAddr: 'frp.example.com', publicUrl: 'https://dsh.example.com/', remotePort: 18080, ...patch })
  if (result.issues) throw new Error(result.issues[0].message)
  return result.value.get()
}
test('disabled installation does not require a server or executable', () => {
  const { value } = Config['~standard'].validate({})
  assert.equal(value.get().enabled, false)
  assert.deepEqual(publicAuthorities(value.get()), [])
})
test('enabled settings reject malformed URLs, cleartext and missing TCP ports before commit', () => {
  for (const patch of [{ publicUrl: 'https://evil.com/?token=x' }, { publicUrl: 'https://a.com/path/' }, { publicUrl: 'https://user@a.com/' }, { publicUrl: 'http://a.com/' }, { remotePort: 0 }, { serverAddr: '' }, { serverPort: 65536 }, { maxRestarts: -1 }]) {
    assert.ok(Config['~standard'].validate({ ...config(), ...patch }).issues, JSON.stringify(patch))
  }
})
test('trust entries preserve browser default ports and explicit nondefault ports', () => {
  assert.deepEqual(publicAuthorities(config()), ['dsh.example.com'])
  assert.deepEqual(publicAuthorities(config({ publicUrl: 'https://dsh.example.com:8443/' })), ['dsh.example.com:8443'])
})
test('generated TOML uses the actual ephemeral local port and never contains the token', () => {
  const output = renderToml(config({ token: 'top-secret', serverAddr: 'frp.example.com', proxyName: 'dsh"\\demo' }), { host: '127.0.0.1', port: 41235 })
  assert.match(output, /localPort = 41235/)
  assert.match(output, /transport.tls.enable = true/)
  assert.match(output, /DSH_FRPC_AUTH_TOKEN/)
  assert.ok(!output.includes('top-secret'))
  assert.match(output, /name = "dsh\\"\\\\demo"/)
})
test('HTTP proxy uses a domain instead of a TCP remotePort', () => {
  const output = renderToml(config({ proxyType: 'http' }), { host: '127.0.0.1', port: 34567 })
  assert.match(output, /customDomains = \["dsh.example.com"\]/)
  assert.ok(!output.includes('remotePort'))
})
