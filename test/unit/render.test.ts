import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyLineBreaks, classTokens, compileUserCode } from '../../src/utils/render.ts'
import { extractCandidates, splitAtProperties } from '../../src/styles/cssScan.ts'

test('applyLineBreaks handles every newline style', () => {
  assert.equal(applyLineBreaks('a\nb\r\nc\rd'), 'a<br>b<br>c<br>d')
})

test('classTokens splits and treats falsy as none', () => {
  assert.deepEqual(classTokens('text-red-500  font-bold '), ['text-red-500', 'font-bold'])
  assert.deepEqual(classTokens(''), [])
  assert.deepEqual(classTokens(false), [])
  assert.deepEqual(classTokens(undefined), [])
  assert.deepEqual(classTokens(null), [])
})

test('compileUserCode caches, and rethrows syntax errors', () => {
  const a = compileUserCode(['x'], 'return x * 2')
  assert.equal(a(3), 6)
  assert.equal(compileUserCode(['x'], 'return x * 2'), a)
  assert.throws(() => compileUserCode([], 'return ('), SyntaxError)
  assert.throws(() => compileUserCode([], 'return ('), SyntaxError)
})

test('extractCandidates reads class and className attributes', () => {
  const html = `<div class="flex  p-4"><span className='text-sm'></span><b class="flex"></b></div>`
  assert.deepEqual(extractCandidates(html), ['flex', 'p-4', 'text-sm'])
})

test('splitAtProperties hoists @property rules', () => {
  const css = '@property --tw-x { syntax: "*"; inherits: false; }\n.a { color: red }'
  const { properties, rest } = splitAtProperties(css)
  assert.equal(properties.length, 1)
  assert.match(properties[0], /^@property --tw-x/)
  assert.doesNotMatch(rest, /@property/)
  assert.match(rest, /\.a \{ color: red \}/)
})
