// Relative, type-only imports so the unit tests can load this in Node.
import type { Action } from '../types/index.ts'
import { type SelectorSuggestion, covers } from './contentScan.ts'

/**
 * Prefilled actions for the attribute names that carry a settled meaning in
 * this card's markup. Anything else still gets a suggestion — selector and
 * event filled in, the call left for the user — because the silent failure
 * being avoided here is markup that looks interactive and has no action at all.
 */
const CONVENTIONS: Record<string, { type: string; call: (attribute: string) => string }> = {
  'data-toggle': {
    type: 'click',
    call: a =>
      `hass.callService('homeassistant', 'toggle', { entity_id: this.dataset.${camel(a)} })`
  },
  'data-more': {
    type: 'hold',
    call: a => `moreInfo(this.dataset.${camel(a)})`
  },
  'data-media': {
    type: 'click',
    call: a =>
      `hass.callService('media_player', this.dataset.${camel(a)}, { entity_id: this.dataset.player })`
  },
  'data-climate': {
    type: 'click',
    call: a =>
      [
        "const entity_id = this.dataset.entity",
        "const current = hass.states[entity_id].attributes.temperature ?? 18",
        `const next = this.dataset.${camel(a)} === 'up' ? current + 0.5 : current - 0.5`,
        "hass.callService('climate', 'set_temperature', {",
        '  entity_id,',
        '  temperature: Math.min(25, Math.max(5, next))',
        '})'
      ].join('\n')
  }
}

/** `data-media-play` → `mediaPlay`, matching `HTMLElement.dataset`. */
const camel = (attribute: string) =>
  attribute
    .replace(/^data-/, '')
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

export type ActionSuggestion = {
  /** Stable key for the list. */
  key: string
  /** What the button offers, e.g. `[data-toggle]`. */
  label: string
  /** Entities the markup points that attribute at, if any. */
  detail: string
  action: Action
}

/**
 * Whether some code already reads this attribute.
 *
 * `data-player` and `data-entity` are arguments to an action, not triggers for
 * one — `data-media`'s call reads `this.dataset.player`. Offering to bind an
 * action to them would be noise, and the code that consumes them says so.
 */
const isReadBy = (call: string, attribute: string) =>
  Boolean(call) &&
  (call.includes(`dataset.${camel(attribute)}`) || call.includes(attribute))

/**
 * Selectors present in the markup that no existing action covers.
 *
 * This is the editor equivalent of the check that found the fan button doing
 * nothing: markup carrying `data-toggle` with no action to answer it.
 */
export const suggestActions = (
  selectors: SelectorSuggestion[],
  actions: Action[]
): ActionSuggestion[] => {
  const candidates = selectors
    .filter(s => s.attribute !== 'id')
    .filter(s => !actions.some(action => covers(action.selector, s)))
    .filter(s => !actions.some(action => isReadBy(action.call, s.attribute)))
    .map(s => {
      const convention = CONVENTIONS[s.attribute]
      return {
        key: s.selector,
        label: s.selector,
        detail: s.entities.slice(0, 3).join(', '),
        action: {
          selector: s.selector,
          type: convention?.type ?? 'click',
          call: convention?.call(s.attribute) ?? ''
        }
      }
    })

  // An attribute another suggestion's code already reads is an argument to it.
  return candidates.filter(
    candidate =>
      !candidates.some(
        other =>
          other.key !== candidate.key &&
          isReadBy(other.action.call, attributeOf(candidate.key))
      )
  )
}

/** `[data-player]` → `data-player`. */
const attributeOf = (selector: string) => selector.replace(/^\[|\]$/g, '')
