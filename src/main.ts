if (import.meta.env.DEV) {
  await import('preact/debug')
}
import { TailwindTemplateCard } from './elements/TailwindTemplateCard.tsx'
import { TailwindTemplateCardConfig } from './elements/TailwindTemplateCardConfig.tsx'
import { CARD_TYPE, CONFIG_TYPE, LEGACY_CARD_TYPE } from './constants.ts'

// Guarded: a resource registered twice (or cached alongside a newer copy)
// would otherwise throw on the second definition.
if (!customElements.get(CARD_TYPE)) {
  customElements.define(CARD_TYPE, TailwindTemplateCard)
}
if (!customElements.get(CONFIG_TYPE)) {
  customElements.define(CONFIG_TYPE, TailwindTemplateCardConfig)
}

/**
 * Keep the upstream card type working.
 *
 * Dashboards written against `usernein/tailwindcss-template-card` — and every
 * community example — use `custom:tailwindcss-template-card`. Registering an
 * alias means those configs keep rendering after switching to this fork.
 * A custom element constructor can only be registered under one name, hence
 * the subclass. Guarded so it never fights the original card if both happen to
 * be installed.
 */
if (!customElements.get(LEGACY_CARD_TYPE)) {
  class LegacyTailwindTemplateCard extends TailwindTemplateCard {}
  customElements.define(LEGACY_CARD_TYPE, LegacyTailwindTemplateCard)
}

// Only the current type is offered in the card picker. Home Assistant doesn't
// create this array; whichever card loads first does.
window.customCards = window.customCards ?? []
if (!window.customCards.some(card => card.type === CARD_TYPE)) {
  window.customCards.push({
    type: CARD_TYPE,
    name: 'Tailwind Template Card',
    description: 'Write HTML with Tailwind CSS classes and Jinja templates',
    preview: true
  })
}
