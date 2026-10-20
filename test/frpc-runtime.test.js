import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { zipSync } from 'fflate'
import tar from 'tar-stream'
import { FRP_VERSION, FrpcRuntime, releaseFor, sha256, extractBinary } from '../src/frpc-runtime.js'

const binary = Buffer.from('frpc-fixture-binary')
async function fixture(t, overrides = {}) {
  const home = await mkdtemp(join(tmpdir(), 'frpc-runtime-test-'))
  t.after(() => rm(home, { recursive: true, force: true }))
  const release = releaseFor(process.platform, process.arch)
  // Windows ZIP is deliberately used on every test host to exercise one deterministic archive.
  release.name = 'fixture.zip'; release.entry = 'frp-test/frpc'
  const archive = zipSync({ [release.entry]: binary, '../../unwanted': Buffer.from('do not extract') })
  release.sha256 = sha256(archive)
  const calls = { fetch: 0, probe: 0 }
  const options = { home, env: {}, release,
    fetch: async (url, options) => { calls.fetch++; assert.equal(options.headers, undefined); assert.equal(url, release.url); return new Response(archive, { headers: { 'content-length': String(archive.length) } }) },
    probe: async file => { calls.probe++; assert.deepEqual(await readFile(file), binary); return FRP_VERSION }, ...overrides }
  const runtime = new FrpcRuntime(options)
  t.after(() => runtime.dispose())
  return { home, release, archive, runtime, calls, options }
}

test('platform manifests pin official HTTPS releases and 64-character SHA-256 digests', () => {
  for (const os of ['win32', 'linux', 'darwin']) for (const arch of ['x64', 'arm64']) {
    const release = releaseFor(os, arch)
    assert.match(release.url, /^https:\/\/github.com\/fatedier\/frp\/releases\/download\/v0\.71\.1\//)
    assert.match(release.sha256, /^[a-f0-9]{64}$/)
  }
  assert.throws(() => releaseFor('unsupported', 'x64'), /手动/)
})
test('automatic detection downloads only when enabled by the caller, verifies and reuses the cache', async t => {
  const { runtime, calls } = await fixture(t)
  assert.equal((await runtime.check('auto')).state, 'missing')
  await assert.rejects(runtime.ensure('auto', false), /未找到/)
  assert.equal(calls.fetch, 0)
  const file = await runtime.ensure('frpc', true)
  assert.equal(runtime.status.state, 'ready'); assert.deepEqual(await readFile(file), binary)
  assert.equal(await runtime.ensure('auto', true), file)
  assert.equal(calls.fetch, 1)
})
test('explicit paths with spaces are detected and do not trigger downloads', async t => {
  const { home, runtime, calls } = await fixture(t)
  const file = join(home, 'custom directory', 'frpc.exe')
  await mkdir(join(home, 'custom directory')); await writeFile(file, binary, { mode: 0o755 })
  assert.equal(await runtime.ensure(file), file)
  assert.equal(runtime.status.source, 'custom'); assert.equal(calls.fetch, 0)
  await assert.rejects(runtime.ensure(join(home, 'missing', 'frpc.exe')), /指定路径不存在/)
  assert.equal(calls.fetch, 0)
})
test('PATH detection uses the actual executable and never relies on shell expansion', async t => {
  const f = await fixture(t)
  const directory = join(f.home, 'path bin'); await mkdir(directory)
  const file = join(directory, process.platform === 'win32' ? 'frpc.exe' : 'frpc')
  await writeFile(file, binary, { mode: 0o755 }); f.runtime.env = { PATH: directory }
  assert.equal(await f.runtime.ensure('auto'), file)
  assert.equal(f.runtime.status.source, 'path'); assert.equal(f.calls.fetch, 0)
})
test('a checksum mismatch never probes or installs downloaded bytes', async t => {
  const f = await fixture(t, { fetch: async () => new Response('corrupt download') })
  await assert.rejects(f.runtime.install(), /SHA-256/)
  assert.equal(f.calls.probe, 0)
  await assert.rejects(readFile(f.runtime.executable), { code: 'ENOENT' })
  assert.equal(f.runtime.status.state, 'error')
})
test('modified cached executables are rejected before execution', async t => {
  const f = await fixture(t); await f.runtime.install()
  await writeFile(f.runtime.executable, 'changed')
  const probes = f.calls.probe
  assert.equal((await f.runtime.check('auto')).state, 'missing')
  assert.equal(f.calls.probe, probes)
})
test('simultaneous install clicks share a single verified download', async t => {
  const f = await fixture(t)
  const [first, second] = await Promise.all([f.runtime.install(), f.runtime.install()])
  assert.equal(first, second); assert.equal(f.calls.fetch, 1)
})
test('plugin disposal aborts a pending download without installing a binary', async t => {
  let requested
  const started = new Promise(resolve => { requested = resolve })
  const f = await fixture(t, { fetch: async (_, { signal }) => { requested(); return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })) } })
  const pending = f.runtime.install()
  await started; f.runtime.dispose(); await assert.rejects(pending, /卸载|更新/)
  await assert.rejects(readFile(f.runtime.executable), { code: 'ENOENT' })
})
test('a failed download can be retried and excessive responses are rejected', async t => {
  const f = await fixture(t, { fetch: async () => new Response('unavailable', { status: 503 }) })
  await assert.rejects(f.runtime.install(), /503/)
  f.runtime.fetch = async () => new Response(f.archive, { headers: { 'content-length': String(65 * 1024 * 1024) } })
  await assert.rejects(f.runtime.install(), /大小限制/)
  f.runtime.fetch = async () => new Response(f.archive)
  await f.runtime.install(); assert.equal(f.runtime.status.state, 'ready')
})
test('tar.gz extraction selects only the exact regular binary and rejects symbolic links', async () => {
  const build = async type => {
    const pack = tar.pack(), chunks = []
    pack.on('data', bytes => chunks.push(bytes))
    const finished = new Promise(resolve => pack.on('end', resolve))
    pack.entry({ name: 'frp-test/frpc', type, linkname: type === 'symlink' ? '/etc/passwd' : undefined }, type === 'file' ? binary : Buffer.alloc(0))
    pack.finalize(); await finished; return gzipSync(Buffer.concat(chunks))
  }
  const release = { name: 'fixture.tar.gz', entry: 'frp-test/frpc' }
  assert.deepEqual(await extractBinary(await build('file'), release), binary)
  await assert.rejects(extractBinary(await build('symlink'), release), /无效/)
})
