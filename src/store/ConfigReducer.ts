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
    [key: string]: { enabled: boolean; url: string, theme: string }
  }
}

export const ConfigReducer = (
  state: ConfigState,
  action: ConfigReducerAction
) => {
  switch (action.action_type) {
    case ConfigActionTypes.SET_CONFIG:
      console.debug(action)
      const newConfig = { ...state, ...action.payload }

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

export const initialConfigState: ConfigState = {
  ignore_line_breaks: true,
  always_update: false,
  content: `<div class="w-32 h-32 bg-blue-900 rounded-3xl flex justify-center items-center animate-pulse hover:scale-150 transition-all">Hello, World!</div>`,
  entities: ['sun.sun'],
  parse_jinja: true,
  plugins: {
    daisyui: {
      enabled: true,
      url: DAISYUI_CDN_URL,
      theme: 'auto',
    }
  }
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
    updateConfig(e.detail.config, false)
  }) as EventListener)

  return {
    config: state,
    updateConfig
  }
}
