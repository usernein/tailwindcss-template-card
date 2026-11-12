import { HomeAssistant } from 'custom-card-helpers'

declare global {
  interface Window {
    hass: HomeAssistant
    customCards: CustomCard[]
  }
}

export interface CustomCard {
  type: string
  name: string
  description: string
  preview: boolean
}

/** Payload pushed by Home Assistant's `render_template` websocket command. */
export type TemplateEvent = {
  result?: string
  error?: string
  level?: string
  listeners?: {
    all: boolean
    domains: string[]
    entities: string[]
    time: boolean
  }
}

export type Binding = {
  bind: string
  selector: string
  type: string
}

export type Action = {
  call: string
  selector: string
  type: string
}

type PluginOptions = {
  enabled: boolean
  /** @deprecated daisyUI is compiled into the card; no CDN fetch is made. */
  url?: string
  /** `auto` follows Home Assistant; otherwise `<scheme> - <daisyUI theme>`. */
  theme?: string
}

type DaisyUIOptions = {
  overrideCardBackground: boolean
  /** daisyUI theme list, e.g. `light --default, dark --prefersdark`. */
  themes?: string
}

export type ConfigState = {
  entity: string
  ignore_line_breaks: boolean
  always_update: boolean
  /**
   * Strip Home Assistant's `ha-card` chrome — background, border, shadow and
   * radius — so the card's own markup provides the entire surface.
   */
  bare: boolean
  content: string
  entities: string[]
  parse_jinja: boolean
  plugins: {
    daisyui: PluginOptions & DaisyUIOptions
    /** @deprecated Never implemented; accepted so old configs still load. */
    tailwindElements?: PluginOptions
  }
  /** @deprecated Ignored; Home Assistant's editor is always used. */
  code_editor?: string
  bindings: Binding[]
  actions: Action[]
  debounceChangePeriod: number
}

export type ConfigStateValue = ConfigState[keyof ConfigState]
