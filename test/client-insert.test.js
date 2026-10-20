import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'

async function composer(state, bailResult = true) {
  let registration, loaded, request
  const actx = { bail(scope, event, payload) { assert.equal(scope, actx); assert.equal(event, 'slash/input-insert-text'); request = payload; return bailResult } }
  const input = { state: { getSnapshot: () => state } }
  const ctx = {
    effect() {}, locale: { bind: () => key => key }, configForms: { get() {} },
    sessions: { scope: id => { assert.equal(id, 'target-session'); return actx } }, conversation: { input: { for: scope => { assert.equal(scope, actx); return input } } },
    slots: { inject(name, callback) { callback() }, register(options) { registration = options } },
    inject(deps, callback) { callback(ctx) },
  }
  const source = await readFile(new URL('../client.js', import.meta.url), 'utf8')
  runInNewContext(source, { window: { __ModuleLoader__: { load: value => { loaded = value } } } })
  loaded.factory(() => ({})).apply(ctx)
  return { append: registration.inject('target-session').append, request: () => request }
}
test('insertion targets the original session, appends with revision protection and preserves chip coordinates', async () => {
  const state = { phase: 'plain', draft: '保留文字 @existing 后续', draftRev: 7, occurrences: [{ length: 9 }] }
  const { append, request } = await composer(state)
  assert.equal(append('H:\\资料\\有 空格.txt'), true)
  assert.equal(request().span.start, state.draft.length - 8)
  assert.equal(request().span.start, request().span.end)
  assert.equal(request().span.draftRev, 7)
  assert.equal(request().text, '\n` H:\\资料\\有 空格.txt `\n')
  assert.equal(state.draft, '保留文字 @existing 后续')
})
test('frozen inputs and failed revision guards refuse insertion without replacing the draft', async () => {
  for (const phase of ['adjudicating', 'submitting']) {
    const { append, request } = await composer({ phase, draft: '', draftRev: 2, occurrences: [] })
    assert.equal(append('/file.txt'), false); assert.equal(request(), undefined)
  }
  const fixture = await composer({ phase: 'plain', draft: '', draftRev: 2, occurrences: [] }, undefined)
  // Explicit false models the input rejecting a stale span.
  const rejected = await composer({ phase: 'plain', draft: '', draftRev: 2, occurrences: [] }, false)
  assert.equal(rejected.append('/file.txt'), false)
  assert.equal(fixture.append('/with`tick.txt'), true)
  assert.equal(fixture.request().text, '`` /with`tick.txt ``\n')
})
