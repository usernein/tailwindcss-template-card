import {
  CodeEditorOptionsEnum,
  ConfigActionTypes,
  ConfigReducerAction,
  ConfigState
} from '@types'
import { useReducer } from 'preact/hooks'

export const ConfigReducer = (
  state: ConfigState,
  action: ConfigReducerAction
) => {
  if (action.action_type == ConfigActionTypes.SET_CONFIG) {
    const newConfig = { ...state, ...action.payload } as ConfigState

    if (action.dispatch_event) {
      const event = new CustomEvent('tailwindcss-template-card-config-edited', {
        bubbles: true,
        composed: true,
        detail: { config: newConfig }
      })
      window.dispatchEvent(event)
    }

    return newConfig
  } else {
    return state
  }
}

export const defaultConfigState: ConfigState = {
  entity: '',
  content: '',
  ignore_line_breaks: true,
  always_update: false,
  parse_jinja: true,
  code_editor: CodeEditorOptionsEnum.ACE,
  entities: [],
  bindings: [],
  actions: [],
  debounceChangePeriod: 500,
  plugins: {
    daisyui: {
      enabled: true,
      url: DAISYUI_CDN_URL,
      theme: 'dark'
    }
  }
}

export const fulfillWithDefaults = (config: Partial<ConfigState>) => {
  return { ...defaultConfigState, ...config } as ConfigState
}

export const initialConfigState: ConfigState = {
  ...defaultConfigState,
  content: `<div class="text-red-600">Default content</div>`,
  entities: ['sun.sun']
}

export const useConfigReducer = () => {
  const [state, dispatch] = useReducer(ConfigReducer, initialConfigState)

  const updateConfig = (
    config: Partial<ConfigState>,
    dispatch_event: boolean = true
  ) => {
    dispatch({
      action_type: ConfigActionTypes.SET_CONFIG,
      dispatch_event,
      payload: config
    })
  }

  window.addEventListener('tailwindcss-template-card-config-received', ((
    e: CustomEvent
  ) => {
    const config = e.detail.config as Partial<ConfigState>
    const filledConfig = fulfillWithDefaults(config)
    updateConfig(filledConfig, false)
  }) as EventListener)

  return {
    config: state,
    updateConfig
  }
}
