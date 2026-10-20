import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'

const roots = [2, 3, 7].map((id, index) => ({ id, path: ['C:\\', 'D:\\', 'H:\\'][index], available: true }))
const settle = async () => { await new Promise(resolve => setImmediate(resolve)) }

async function picker(list = async body => ({ ...body, parent: null, entries: [] })) {
  let module, cursor = 0, effect, tree
  const hooks = [], calls = [], dialog = { showModal() {}, close() {} }
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat().filter(Boolean) }),
    useId: () => 'files',
    useRef(value) { const index = cursor++; return hooks[index] ||= { current: index === 0 ? dialog : value } },
    useState(value) { const index = cursor++; if (!(index in hooks)) hooks[index] = value; return [hooks[index], next => { hooks[index] = next }] },
    useEffect(callback) { effect ||= callback },
  }
  const source = (await readFile(new URL('../client.js', import.meta.url), 'utf8')).replace("      inject: ['slots', 'locale', 'configForms'],", "      testPicker: HostFileDialog, inject: ['slots', 'locale', 'configForms'],")
  runInNewContext(source, { AbortController, AbortSignal, window: { __ModuleLoader__: { load: value => { module = value } } }, async fetch(url, options) {
    const body = options.body && JSON.parse(options.body)
    if (body) calls.push({ body, signal: options.signal })
    return { ok: true, json: async () => body ? list(body) : { roots, all: true } }
  } })
  const component = module.factory(() => React).testPicker
  const render = () => { cursor = 0; tree = component({ t: key => key, append() {}, onClose() {} }); return tree }
  const nodes = node => [node, ...node.children.filter(child => typeof child === 'object').flatMap(nodes)]
  const find = predicate => nodes(tree).find(predicate)
  render(); const cleanup = effect(); await settle(); render()
  return { render, find, calls, cleanup, click(label) { find(node => node.type === 'button' && node.children.includes(label)).props.onClick() } }
}

test('touch drive buttons navigate to sparse H drive ID and display the requested path', async t => {
  const ui = await picker(); t.after(ui.cleanup)
  assert.equal(ui.find(node => node.type === 'select'), undefined)
  ui.click('H:\\'); ui.render()
  assert.equal(ui.find(node => node.type === 'input' && node.props.id === 'files-path').props.value, 'H:\\')
  await settle(); ui.render()
  assert.equal(ui.calls.at(-1).body.root, 7)
  assert.equal(ui.calls.at(-1).body.path, 'H:\\')
  assert.equal(ui.find(node => node.type === 'button' && node.children.includes('H:\\')).props['aria-pressed'], true)
})

test('phone path entry accepts a bare drive letter while retaining the original root policy', async t => {
  const ui = await picker(); t.after(ui.cleanup)
  ui.find(node => node.type === 'input' && node.props.id === 'files-path').props.onChange({ target: { value: 'h:' } })
  ui.render(); ui.find(node => node.type === 'form').props.onSubmit({ preventDefault() {} })
  await settle(); ui.render()
  assert.equal(ui.calls.at(-1).body.root, -1)
  assert.equal(ui.calls.at(-1).body.path, 'h:\\')
  assert.equal(ui.find(node => node.type === 'button' && node.children.includes('H:\\')).props['aria-pressed'], true)
})

test('rapid drive taps cannot let an old response replace the newly selected drive', async t => {
  let finishH
  const ui = await picker(body => body.root === 7 ? new Promise(resolve => { finishH = () => resolve({ ...body, parent: null, entries: [] }) }) : { ...body, parent: null, entries: [] })
  t.after(ui.cleanup)
  ui.click('H:\\'); await settle(); ui.render(); ui.click('D:\\'); await settle(); ui.render()
  finishH(); await settle(); ui.render()
  assert.equal(ui.calls.find(call => call.body.root === 7).signal.aborted, true)
  assert.equal(ui.find(node => node.type === 'input' && node.props.id === 'files-path').props.value, 'D:\\')
  assert.equal(ui.find(node => node.type === 'button' && node.children.includes('D:\\')).props['aria-pressed'], true)
})
