import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  FOLLOW_HA_THEME,
  defaultConfigState,
  fulfillWithDefaults,
  validateConfig,
  withoutDefaults
} from '../../src/store/configDefaults.ts'

test('fulfillWithDefaults merges plugins a level deep', () => {
  const empty = fulfillWithDefaults({ content: 'x', plugins: {} as never })
  assert.deepEqual(empty.plugins.daisyui, defaultConfigState.plugins.daisyui)

  const partial = fulfillWithDefaults({
    plugins: { daisyui: { enabled: false } } as never
  })
  assert.equal(partial.plugins.daisyui.enabled, false)
  assert.equal(partial.plugins.daisyui.theme, FOLLOW_HA_THEME)
})

test('withoutDefaults keeps only what differs, plus foreign keys', () => {
  const config = fulfillWithDefaults({
    content: '<p>x</p>',
    bare: true,
    plugins: {
      daisyui: { enabled: true, theme: 'dark - dark', url: 'https://cdn' },
      tailwindElements: { enabled: false }
    } as never
  })
  const written = withoutDefaults({ ...config, type: 'custom:tailwind-template-card' } as never)
  assert.deepEqual(written, {
    content: '<p>x</p>',
    bare: true,
    type: 'custom:tailwind-template-card',
    plugins: { daisyui: { theme: 'dark - dark' } }
  })
})

test('withoutDefaults always keeps the content', () => {
  assert.deepEqual(withoutDefaults(fulfillWithDefaults({})), { content: '' })
})

test('validateConfig rejects what the card cannot render', () => {
  assert.throws(() => validateConfig(null), /mapping/)
  assert.throws(() => validateConfig([]), /mapping/)
  assert.throws(() => validateConfig({ content: 3 }), /content/)
  assert.throws(() => validateConfig({ bindings: {} }), /bindings/)
  assert.throws(() => validateConfig({ actions: ['x'] }), /actions/)
  assert.throws(() => validateConfig({ plugins: 'daisyui' }), /plugins/)
  assert.doesNotThrow(() => validateConfig({}))
  assert.doesNotThrow(() => validateConfig({ content: '', bindings: [], actions: [{}] }))
})
