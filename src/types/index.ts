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

export enum ConfigActionTypes {
  SET_CONFIG
}

export type ConfigReducerAction = {
  action_type: ConfigActionTypes
  dispatch_event: boolean
  payload: Partial<ConfigState> | object
}

export enum CodeEditorOptionsEnum {
  ACE = 'Ace',
  TEXTAREA = 'Textarea',
  CODEMIRROR_DEV = 'CodeMirror_dev'
}

type PluginOptions = { enabled: boolean; url?: string; theme?: string }

type DaisyUIOptions = { overrideCardBackground: boolean }

export type ConfigState = {
  entity: string
  ignore_line_breaks: boolean
  always_update: boolean
  content: string
  entities: string[]
  parse_jinja: boolean
  plugins: {
    daisyui: PluginOptions & DaisyUIOptions,
    tailwindElements: PluginOptions
  }
  code_editor: CodeEditorOptionsEnum
  bindings: Binding[]
  actions: Action[]
  debounceChangePeriod: number
}

export type ConfigStateValue = ConfigState[keyof ConfigState]
