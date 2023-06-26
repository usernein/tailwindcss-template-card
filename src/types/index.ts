import { HomeAssistant } from "custom-card-helpers";

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

export type BindAction = {
  call: boolean
  selector: string
  type: string
}

export enum ConfigActionTypes {
  SET_CONFIG
}

export type ConfigReducerAction = {
  action_type: ConfigActionTypes
  dispatch_event: boolean
  payload: any
}

export enum CodeEditorOptionsEnum {
  ACE = 'Ace',
  TEXTAREA = 'Textarea',
  CODEMIRROR_DEV = 'CodeMirror_dev'
}

export type ConfigState = {
  entity: string
  ignore_line_breaks: boolean
  always_update: boolean
  content: string
  entities: string[]
  parse_jinja: boolean
  plugins: {
    [key: string]: { enabled: boolean; url?: string; theme?: string }
  }
  code_editor: CodeEditorOptionsEnum
  bindings: Binding[]
  actions: BindAction[]
  debounceChangePeriod: number
}

export type ConfigStateValue = ConfigState[keyof ConfigState]