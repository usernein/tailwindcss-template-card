import { HomeAssistant } from "custom-card-helpers";

declare global {
  interface Window {
    hass: HomeAssistant
    customCards: CustomCard[]
  }
  type Binding = {
    bind: string
    selector: string
    type: string
  }

  type BindAction = {
    call: boolean
    selector: string
    type: string
  }

  enum ConfigActionTypes {
    SET_CONFIG
  }

  type ConfigReducerAction = {
    action_type: ConfigActionTypes
    dispatch_event: boolean
    payload: any
  }

  enum CodeEditorOptionsEnum {
    ACE = 'Ace',
    TEXTAREA = 'Textarea',
    CODEMIRROR_DEV = 'CodeMirror_dev'
  }

  type ConfigState = {
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
  }
}
