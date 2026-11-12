/*
 * Configuration defaults, merging and validation.
 *
 * Kept free of Preact and of path aliases (relative, type-only imports) so the
 * unit tests can load it straight into Node.
 */
import type { ConfigState } from '../types/index.ts'

/**
 * Theme value meaning "follow Home Assistant's light/dark mode". The other
 * values are `<scheme> - <daisyUI theme>`, or `inherit` for no theme at all.
 */
export const FOLLOW_HA_THEME = 'auto'

export const defaultConfigState: ConfigState = {
  entity: '',
  content: '',
  ignore_line_breaks: true,
  always_update: false,
  bare: false,
  parse_jinja: true,
  entities: [],
  bindings: [],
  actions: [],
  debounceChangePeriod: 100,
  plugins: {
    daisyui: {
      enabled: true,
      theme: FOLLOW_HA_THEME,
      themes: 'light --default, dark --prefersdark',
      overrideCardBackground: false
    }
  }
}

/** Content offered when the card is added from the card picker. */
export const STUB_CONTENT = `<div class="flex flex-row gap-2 justify-center">
  {% for color in ["primary", "secondary", "accent", "info", "warning", "error", "info"] %}
    <div class="w-12 h-12 bg-{{color}} rounded-lg cursor-pointer hover:translate-y-2 transition-all animate-bounce hover:animate-spin"></div>
  {% endfor %}
</div>`

export const initialConfigState: ConfigState = {
  ...defaultConfigState,
  content: STUB_CONTENT
}

/**
 * Fills in every option the config leaves out.
 *
 * `plugins` is merged a level deeper than the rest. A shallow merge let
 * `plugins: {}` replace the whole default and crash the render on
 * `plugins.daisyui.theme`, and setting any one daisyUI option silently dropped
 * the default theme.
 */
export const fulfillWithDefaults = (config: Partial<ConfigState>): ConfigState => {
  const plugins = (config.plugins ?? {}) as Partial<ConfigState['plugins']>
  return {
    ...defaultConfigState,
    ...config,
    plugins: {
      ...defaultConfigState.plugins,
      ...plugins,
      daisyui: { ...defaultConfigState.plugins.daisyui, ...plugins.daisyui }
    }
  }
}

const sameValue = (a: unknown, b: unknown) =>
  a === b || JSON.stringify(a) === JSON.stringify(b)

/**
 * The config as it should be written back to the dashboard: only what differs
 * from the defaults.
 *
 * The editor used to emit the fully filled-in config, so every card edited
 * visually ended up with a dozen default keys in its YAML — the editor's own
 * debounce period among them. Unknown keys (`type`, `grid_options`,
 * `visibility`, …) belong to Home Assistant and are always kept.
 */
export const withoutDefaults = (
  config: ConfigState
): Partial<ConfigState> & Record<string, unknown> => {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(config)) {
    if (key === 'plugins' || key === 'code_editor') continue
    if (key === 'content') {
      result[key] = value
      continue
    }
    const fallback = (defaultConfigState as Record<string, unknown>)[key]
    if (fallback !== undefined && sameValue(value, fallback)) continue
    result[key] = value
  }

  // `url` and `tailwindElements` are accepted on input but do nothing, so
  // they are not written back.
  const daisyui: Record<string, unknown> = { ...config.plugins?.daisyui }
  delete daisyui.url
  const changed = Object.fromEntries(
    Object.entries(daisyui).filter(
      ([key, value]) =>
        !sameValue(
          value,
          (defaultConfigState.plugins.daisyui as Record<string, unknown>)[key]
        )
    )
  )
  if (Object.keys(changed).length) result.plugins = { daisyui: changed }

  return result
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Rejects configs the card cannot render. Home Assistant shows the thrown
 * message in its error card, which beats a card that silently renders nothing.
 */
export const validateConfig = (config: unknown): void => {
  if (!isObject(config)) {
    throw new Error('Invalid configuration: expected a mapping of options.')
  }
  if (config.content !== undefined && typeof config.content !== 'string') {
    throw new Error('`content` must be a string of HTML.')
  }
  for (const key of ['entities', 'bindings', 'actions']) {
    if (config[key] !== undefined && !Array.isArray(config[key])) {
      throw new Error(`\`${key}\` must be a list.`)
    }
  }
  for (const key of ['bindings', 'actions']) {
    const rules = (config[key] ?? []) as unknown[]
    rules.forEach((rule, index) => {
      if (!isObject(rule)) {
        throw new Error(`\`${key}\` item ${index + 1} must be a mapping.`)
      }
    })
  }
  if (config.plugins !== undefined && !isObject(config.plugins)) {
    throw new Error('`plugins` must be a mapping.')
  }
}
