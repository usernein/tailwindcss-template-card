import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ConfigChannel } from '../../src/store/ConfigChannel.ts'
import { fulfillWithDefaults } from '../../src/store/configDefaults.ts'

const config = (content: string) => fulfillWithDefaults({ content })

test('a config received before anyone subscribes is replayed on subscribe', () => {
  const channel = new ConfigChannel(() => {})
  channel.receive(config('early'))
  const seen: string[] = []
  channel.subscribe(c => seen.push(c.content))
  assert.deepEqual(seen, ['early'])
})

test('subscribers see each later config, and stop once unsubscribed', () => {
  const channel = new ConfigChannel(() => {})
  const seen: string[] = []
  const unsubscribe = channel.subscribe(c => seen.push(c.content))
  channel.receive(config('a'))
  unsubscribe()
  channel.receive(config('b'))
  assert.deepEqual(seen, ['a'])
  assert.equal(channel.size, 0)
})

test('channels are independent: one card never reaches another editor', () => {
  const mine = new ConfigChannel(() => {})
  const theirs = new ConfigChannel(() => {})
  const seen: string[] = []
  mine.subscribe(c => seen.push(c.content))
  theirs.receive(config('someone else'))
  assert.deepEqual(seen, [])
})

test('edits go out through onChange', () => {
  const sent: string[] = []
  const channel = new ConfigChannel(c => sent.push(c.content))
  channel.onChange(config('edited'))
  assert.deepEqual(sent, ['edited'])
})
