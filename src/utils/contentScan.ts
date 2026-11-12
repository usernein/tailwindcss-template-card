/**
 * Reads the card's own markup to work out what its actions and bindings could
 * usefully target.
 *
 * Everything here comes from the content the user has already written — no
 * entity registry lookup — so the suggestions are exactly as accurate as the
 * markup is, and stay right even before Home Assistant has supplied `hass`.
 */

/** Attribute values worth offering as a selector. */
const ATTRIBUTE =
  /\b(data-[a-z][a-z0-9-]*|id)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi

/**
 * Domains an entity id can start with. A bare `word.word` pattern also matches
 * `this.dataset`, `hass.states` and `now().year`, so the domain has to be
 * checked rather than assumed.
 */
const DOMAINS = new Set([
  'alarm_control_panel', 'automation', 'binary_sensor', 'button', 'calendar',
  'camera', 'climate', 'cover', 'device_tracker', 'event', 'fan', 'group',
  'humidifier', 'image', 'input_boolean', 'input_button', 'input_datetime',
  'input_number', 'input_select', 'input_text', 'lawn_mower', 'light', 'lock',
  'media_player', 'number', 'person', 'remote', 'scene', 'script', 'select',
  'sensor', 'siren', 'sun', 'switch', 'text', 'time', 'timer', 'todo',
  'update', 'vacuum', 'valve', 'water_heater', 'weather', 'zone'
])

const ENTITY_ID = /\b([a-z_]+)\.([a-z0-9_]+)\b/g

export type SelectorSuggestion = {
  /** The selector to offer, e.g. `[data-toggle]` or `#header`. */
  selector: string
  /** The attribute it came from, e.g. `data-toggle`. */
  attribute: string
  /** Entity ids used as that attribute's value, in the order they appear. */
  entities: string[]
  /** How many elements in the markup carry the attribute. */
  count: number
}

/** Entity ids mentioned anywhere in the content, deduplicated and sorted. */
export const scanEntities = (content: string): string[] => {
  const found = new Set<string>()
  for (const [id, domain] of (content ?? '').matchAll(ENTITY_ID)) {
    if (DOMAINS.has(domain)) found.add(id)
  }
  return [...found].sort()
}

/**
 * Selectors the markup already supports, most-used first.
 *
 * `id` yields `#name` and every `data-*` attribute yields `[data-name]`, which
 * is the form that matches every element carrying it — the form an action
 * almost always wants.
 */
export const scanSelectors = (content: string): SelectorSuggestion[] => {
  const byAttribute = new Map<string, SelectorSuggestion>()

  for (const match of (content ?? '').matchAll(ATTRIBUTE)) {
    const attribute = match[1].toLowerCase()
    const value = (match[2] ?? match[3] ?? '').trim()

    if (attribute === 'id') {
      if (!value || /\s/.test(value)) continue
      const selector = `#${value}`
      const existing = byAttribute.get(selector)
      if (existing) existing.count += 1
      else byAttribute.set(selector, { selector, attribute: 'id', entities: [], count: 1 })
      continue
    }

    const selector = `[${attribute}]`
    const existing =
      byAttribute.get(selector) ??
      { selector, attribute, entities: [], count: 0 }
    existing.count += 1
    if (
      value &&
      DOMAINS.has(value.split('.')[0]) &&
      !existing.entities.includes(value)
    ) {
      existing.entities.push(value)
    }
    byAttribute.set(selector, existing)
  }

  return [...byAttribute.values()].sort(
    (a, b) => b.count - a.count || a.selector.localeCompare(b.selector)
  )
}

/**
 * Whether a rule's selector already targets a suggestion.
 *
 * Deliberately a substring test rather than a DOM match: the content is a
 * Jinja template, not parseable HTML, and `[data-toggle].tile` should still
 * count as covering `[data-toggle]`.
 */
export const covers = (selector: string, suggestion: SelectorSuggestion) =>
  Boolean(selector) &&
  (suggestion.attribute === 'id'
    ? selector.includes(suggestion.selector)
    : selector.includes(suggestion.attribute))
