import { test } from 'node:test'
import assert from 'node:assert/strict'
import { covers, scanEntities, scanSelectors } from '../../src/utils/contentScan.ts'
import { suggestActions } from '../../src/utils/actionSuggestions.ts'

const MARKUP = `
<div id="clock"></div>
<button data-toggle="fan.cooling_fan" data-more="fan.cooling_fan">Fan</button>
<button data-toggle="light.desk">Desk</button>
<button data-media="media_play_pause" data-player="media_player.study">Play</button>
`

test('scanEntities only accepts real domains', () => {
  assert.deepEqual(scanEntities("{{ states('sensor.temp') }} this.dataset hass.states now().year"), ['sensor.temp'])
})

test('scanSelectors orders by use and collects entities', () => {
  const selectors = scanSelectors(MARKUP)
  assert.equal(selectors[0].selector, '[data-toggle]')
  assert.equal(selectors[0].count, 2)
  assert.deepEqual(selectors[0].entities, ['fan.cooling_fan', 'light.desk'])
  assert.ok(selectors.some(s => s.selector === '#clock' && s.attribute === 'id'))
})

test('covers matches by attribute, or by id', () => {
  const [toggle] = scanSelectors('<b data-toggle="x"></b>')
  const [clock] = scanSelectors('<b id="clock"></b>')
  assert.ok(covers('[data-toggle].tile', toggle))
  assert.ok(!covers('', toggle))
  assert.ok(covers('#clock', clock))
  assert.ok(!covers('.clock', clock))
})

test('suggests actions for unhandled attributes, prefilled by convention', () => {
  const suggestions = suggestActions(scanSelectors(MARKUP), [])
  const labels = suggestions.map(s => s.label)
  assert.ok(labels.includes('[data-toggle]'))
  assert.ok(labels.includes('[data-more]'))
  assert.ok(labels.includes('[data-media]'))
  // data-media's code reads data-player, so data-player is an argument.
  assert.ok(!labels.includes('[data-player]'))
  // Ids are not offered as triggers.
  assert.ok(!labels.includes('#clock'))

  const more = suggestions.find(s => s.label === '[data-more]')
  assert.deepEqual(more?.action, { selector: '[data-more]', type: 'hold', call: 'moreInfo(this.dataset.more)' })
})

test('a handled attribute is no longer suggested', () => {
  const suggestions = suggestActions(scanSelectors(MARKUP), [
    { selector: '[data-toggle]', type: 'click', call: 'x' }
  ])
  assert.ok(!suggestions.some(s => s.label === '[data-toggle]'))
})
