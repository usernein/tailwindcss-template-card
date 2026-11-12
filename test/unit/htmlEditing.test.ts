import { test } from 'node:test'
import assert from 'node:assert/strict'
import { closeTagEdit, expandTagEdit, indentOf } from '../../src/components/HaCodeEditor/htmlEditing.ts'

test('closes an opening tag, caret between the pair', () => {
  assert.deepEqual(closeTagEdit('<div'), { insert: '></div>', caret: 1 })
  assert.deepEqual(closeTagEdit('<div class="a b"'), { insert: '></div>', caret: 1 })
})

test('pushes following content onto its own line at the indent', () => {
  assert.deepEqual(closeTagEdit('<div', '<span>', '  '), { insert: '></div>\n  ', caret: 1 })
  assert.deepEqual(closeTagEdit('<div', '\n<span>'), { insert: '></div>', caret: 1 })
})

test('leaves void, self-closing and in-attribute > alone', () => {
  assert.equal(closeTagEdit('<img'), null)
  assert.equal(closeTagEdit('<BR'), null)
  assert.equal(closeTagEdit('<br /'), null)
  assert.equal(closeTagEdit('<div class="a'), null)
  assert.equal(closeTagEdit("<div title='a"), null)
  assert.equal(closeTagEdit('hello'), null)
  assert.equal(closeTagEdit('</div'), null)
})

test('Enter between tags opens them out', () => {
  assert.deepEqual(expandTagEdit('<div>', '</div>', ''), { insert: '\n  \n', caret: 3 })
  assert.deepEqual(expandTagEdit('<div>', '</div>', '  '), { insert: '\n    \n  ', caret: 5 })
  assert.equal(expandTagEdit('<div>', 'x', ''), null)
  assert.equal(expandTagEdit('text', '</div>', ''), null)
})

test('indentOf reads leading whitespace', () => {
  assert.equal(indentOf('    <div>'), '    ')
  assert.equal(indentOf('\t<div>'), '\t')
  assert.equal(indentOf('<div>'), '')
})
