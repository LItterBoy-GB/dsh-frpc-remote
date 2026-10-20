import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm, symlink, realpath, rename } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { HostFiles, validateRoots } from '../src/host-files.js'
import { Config } from '../src/config.js'

async function fixture(t) {
  const temporary = await mkdtemp(join(tmpdir(), 'dsh-host-files-'))
  t.after(() => rm(temporary, { recursive: true, force: true }))
  const root = join(temporary, '允许目录'), other = root + '-other'
  await mkdir(root); await mkdir(other); await mkdir(join(root, '子目录'))
  await writeFile(join(root, '有 空格.txt'), 'not returned as content')
  await writeFile(join(other, 'private.txt'), 'outside')
  return { root: await realpath(root), other: await realpath(other), temporary, files: new HostFiles([root]) }
}
test('default configuration grants no host directory access and rejects malformed allowlists even when disabled', async () => {
  const config = Config['~standard'].validate({}).value.get()
  assert.deepEqual(config.allowedDirectories, []); assert.equal(config.allowAllDirectories, false)
  assert.deepEqual(await new HostFiles().rootsSnapshot(), [])
  await assert.rejects(new HostFiles().list({ root: 0, path: tmpdir() }), { status: 403 })
  for (const roots of [['relative'], [tmpdir() + '\u0000'], Array(21).fill(tmpdir())]) {
    assert.throws(() => validateRoots(roots))
    assert.ok(Config['~standard'].validate({ allowedDirectories: roots }).issues)
  }
  if (process.platform === 'win32') for (const root of ['\\relative', 'C:relative', '\\\\?\\C:\\', '\\\\.\\PhysicalDrive0']) assert.throws(() => validateRoots([root]))
})
test('lists directories first and selects an absolute file path without returning file contents', async t => {
  const { root, files } = await fixture(t)
  const result = await files.list({ root: 0, path: root })
  assert.equal(result.parent, null); assert.equal(result.entries[0].type, 'directory')
  assert.deepEqual(result.entries.map(entry => entry.name), ['子目录', '有 空格.txt'])
  assert.deepEqual(await files.select({ root: 0, path: join(root, '有 空格.txt') }), { path: join(root, '有 空格.txt') })
  assert.ok(!JSON.stringify(result).includes('not returned as content'))
  assert.equal((await files.list({ root: 0, path: join(root, '子目录') })).parent, root)
})
test('rejects parent traversal, sibling prefix collisions, unregistered roots and relative paths', async t => {
  const { root, other, files } = await fixture(t)
  for (const path of [dirname(root), other, join(root, '..', '允许目录-other')]) await assert.rejects(files.list({ root: 0, path }), { status: 403 })
  await assert.rejects(files.select({ root: 0, path: join(other, 'private.txt') }), { status: 403 })
  await assert.rejects(files.list({ root: 1, path: root }), { status: 403 })
  await assert.rejects(files.list({ root: -1, path: root }), { status: 400 })
  await assert.rejects(files.list({ root: 0, path: '../' }), { status: 400 })
  await assert.rejects(files.list({ root: '0', path: root }), { status: 400 })
})
test('directory junctions or symbolic links cannot expose an outside target', async t => {
  const { root, other, files } = await fixture(t)
  const link = join(root, 'escape')
  await symlink(other, link, process.platform === 'win32' ? 'junction' : 'dir')
  assert.ok(!(await files.list({ root: 0, path: root })).entries.some(entry => entry.name === 'escape'))
  await assert.rejects(files.list({ root: 0, path: link }), { status: 403 })
  await assert.rejects(files.select({ root: 0, path: join(link, 'private.txt') }), { status: 403 })
})
test('retargeting a configured junction invalidates its root until configuration reload', async t => {
  const { root, other, temporary } = await fixture(t)
  const link = join(temporary, 'configured-link')
  await symlink(root, link, process.platform === 'win32' ? 'junction' : 'dir')
  const files = new HostFiles([link]); await files.rootsSnapshot()
  await rm(link); await symlink(other, link, process.platform === 'win32' ? 'junction' : 'dir')
  await assert.rejects(files.list({ root: 0, path: root }), { status: 403 })
})
test('allows switching among several configured roots while retaining their own parent boundary', async t => {
  const { root, other } = await fixture(t), files = new HostFiles([root, other])
  assert.equal((await files.rootsSnapshot()).length, 2)
  assert.equal((await files.list({ root: 1, path: other })).parent, null)
  await assert.rejects(files.list({ root: 0, path: other }), { status: 403 })
})
test('explicit all-directory mode supports direct absolute navigation without a configured allowlist', async t => {
  const { root, other } = await fixture(t), files = new HostFiles([], true)
  assert.equal((await files.list({ root: -1, path: root })).entries.length, 2)
  assert.deepEqual(await files.select({ root: -1, path: join(other, 'private.txt') }), { path: join(other, 'private.txt') })
  await assert.rejects(files.list({ root: -1, path: 'relative' }), { status: 400 })
})
test('filtering, disappearing files, invalid file types and unavailable roots report bounded results', async t => {
  const { root, files } = await fixture(t)
  assert.equal((await files.list({ root: 0, path: root, search: '空格' })).entries.length, 1)
  await assert.rejects(files.select({ root: 0, path: join(root, '子目录') }), { status: 400 })
  await assert.rejects(files.list({ root: 0, path: join(root, '有 空格.txt') }), { status: 400 })
  await rename(join(root, '有 空格.txt'), join(root, 'renamed.txt'))
  await assert.rejects(files.select({ root: 0, path: join(root, '有 空格.txt') }), { status: 404 })
  await assert.rejects(files.list({ root: 0, path: root, search: 'x'.repeat(201) }), { status: 400 })
  assert.equal((await new HostFiles([join(root, 'missing')]).rootsSnapshot())[0].available, false)
})
test('list limits and cancellation prevent unbounded response and stale result delivery', async t => {
  const { root, files } = await fixture(t)
  await Promise.all(Array.from({ length: 501 }, (_, index) => writeFile(join(root, 'file' + index), 'x')))
  const result = await files.list({ root: 0, path: root })
  assert.equal(result.entries.length, 500); assert.equal(result.truncated, true)
  const controller = new AbortController(); controller.abort()
  await assert.rejects(files.list({ root: 0, path: root }, controller.signal), { status: 408 })
  files.active = 4
  await assert.rejects(files.list({ root: 0, path: root }), { status: 429 })
})
