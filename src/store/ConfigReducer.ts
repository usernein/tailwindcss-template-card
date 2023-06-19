import { useReducer } from 'preact/hooks'

export enum ConfigActionTypes {
  SET_CONFIG
}

export type ConfigReducerAction = {
  action_type: ConfigActionTypes
  dispatch_event: boolean
  payload: any
}

export type ConfigState = {
  ignore_line_breaks: boolean
  always_update: boolean
  content: string
  entities: string[]
  parse_jinja: boolean
  plugins: {
    [key: string]: { enabled: boolean; url?: string; theme?: string }
  }
  use_textarea_editor: boolean
}

export const ConfigReducer = (
  state: ConfigState,
  action: ConfigReducerAction
) => {
  switch (action.action_type) {
    case ConfigActionTypes.SET_CONFIG:
      const newConfig = { ...state, ...action.payload } as ConfigState

      if (action.dispatch_event) {
        const event = new CustomEvent(
          'tailwindcss-template-card-config-edited',
          {
            bubbles: true,
            composed: true,
            detail: { config: newConfig }
          }
        )
        window.dispatchEvent(event)
      }

      return newConfig
    default:
      return state
  }
}

export const defaultConfigState: ConfigState = {
  content: '',
  ignore_line_breaks: true,
  always_update: false,
  parse_jinja: true,
  use_textarea_editor: false,
  entities: [],
  plugins: {
    daisyui: {
      enabled: true,
      url: DAISYUI_CDN_URL,
      theme: 'auto'
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
