import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'

// 测试时暴露 factory 内的实际实现，不维护另一份保存逻辑或改变发布代码。
async function writer() {
  let module
  const source = (await readFile(new URL('../client.js', import.meta.url), 'utf8')).replace("      inject: ['slots', 'locale', 'configForms'],", "      testWriter: writeSettings, testCanRebase: canRebaseSettings, inject: ['slots', 'locale', 'configForms'],")
  runInNewContext(source, { window: { __ModuleLoader__: { load: value => { module = value } } } })
  const exported = module.factory(() => ({})); exported.testWriter.canRebase = exported.testCanRebase
  return exported.testWriter
}
const op = (key, value) => ({ op: 'set', path: [key], value })
test('saving unchanged settings skips the RPC and does not restart the tunnel', async () => {
  const write = await writer()
  const form = { getSnapshot: () => ({ status: 'ready', revision: 2, value: { enabled: true } }), mutate() { assert.fail('unchanged settings must not be rewritten') } }
  assert.equal(await write(form, [op('enabled', true)], 2), 'saved')
})
test('successful writes filter unchanged fields and pass the captured revision', async () => {
  const write = await writer()
  const form = { getSnapshot: () => ({ status: 'ready', revision: 2, value: { enabled: true, proxyName: 'old' } }), async mutate(ops, revision) { assert.equal(revision, 2); assert.equal(ops.length, 1); assert.equal(ops[0].path[0], 'proxyName'); return true } }
  assert.equal(await write(form, [op('enabled', true), op('proxyName', 'new')], 2), 'saved')
})
test('a lost response is confirmed against the reconnected snapshot without replaying the write', async () => {
  const write = await writer(); let calls = 0, tick = 0
  const form = { getSnapshot: () => ({ status: 'ready', revision: tick ? 3 : 2, value: { proxyName: tick ? 'new' : 'old' } }), async mutate() { calls++; throw new Error('connection reset') } }
  assert.equal(await write(form, [op('proxyName', 'new')], 2, undefined, async () => { tick++ }), 'saved')
  assert.equal(calls, 1)
})
test('actual revision conflicts preserve the draft and do not silently overwrite other settings', async () => {
  const write = await writer(); let calls = 0
  const form = { getSnapshot: () => ({ status: 'ready', revision: 3, value: { proxyName: 'other-window' } }), async mutate() { calls++; return false } }
  assert.equal(await write(form, [op('proxyName', 'my-draft')], 2), 'conflict'); assert.equal(calls, 1)
})
test('a lost secret write remains unconfirmed, and closing the page cancels verification', async () => {
  const write = await writer()
  const form = { getSnapshot: () => ({ status: 'ready', revision: 3, value: {} }), async mutate() { throw new Error('connection reset') } }
  assert.equal(await write(form, [op('token', 'secret')], 2, undefined, async () => {}), 'unconfirmed')
  const controller = new AbortController(); controller.abort()
  assert.equal(await write(form, [op('token', 'secret')], 2, controller.signal, async () => {}), 'cancelled')
})
test('namespace remount revisions refresh only against the unchanged baseline without pending secrets', async () => {
  const { canRebase } = await writer()
  const baseline = { proxyName: 'saved' }, state = { status: 'ready', revision: 6, value: { proxyName: 'saved' } }
  assert.equal(canRebase(state, baseline, { proxyName: 'unsaved draft', token: '' }, false), true)
  assert.equal(canRebase({ ...state, value: { proxyName: 'another change' } }, baseline, { token: '' }, false), false)
  assert.equal(canRebase(state, baseline, { token: 'new-secret' }, false), false)
  assert.equal(canRebase(state, baseline, { token: '' }, true), false)
  assert.equal(canRebase({ ...state, status: 'unavailable' }, baseline, { token: '' }, false), false)
})
