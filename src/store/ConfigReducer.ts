import {
  CodeEditorOptionsEnum,
  ConfigActionTypes,
  ConfigReducerAction,
  ConfigState
} from '@types'
import {
  CardEvents,
  dispatchCardEvent,
  registerCardEventHandler
} from '@utils/events'
import { useEffect, useReducer } from 'preact/hooks'

export const ConfigReducer = (
  state: ConfigState,
  action: ConfigReducerAction
) => {
  if (action.action_type == ConfigActionTypes.SET_CONFIG) {
    const newConfig = { ...state, ...action.payload } as ConfigState

    if (action.dispatch_event) {
      dispatchCardEvent(CardEvents.CONFIG_CHANGED, { config: newConfig })
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
  debounceChangePeriod: 100,
  plugins: {
    daisyui: {
      enabled: true,
      url: DAISYUI_CDN_URL,
      theme: 'dark - dark',
      overrideCardBackground: false
    },
    tailwindElements: {
      enabled: false
    }
  }
}

export const fulfillWithDefaults = (config: Partial<ConfigState>) => {
  return { ...defaultConfigState, ...config } as ConfigState
}

export const initialConfigState: ConfigState = {
  ...defaultConfigState,
  content: `<div class="flex flex-row gap-2 justify-center">
  {% for color in ["primary", "secondary", "accent", "info", "warning", "error", "info"] %}
    <div class="w-12 h-12 bg-{{color}} rounded-lg cursor-pointer hover:translate-y-2 transition-all animate-bounce hover:animate-spin"></div>
  {% endfor %}
</div>`
}

export const useConfigReducer = () => {
  useEffect(() => {
    console.log('useConfigReducer updated')
  })
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

  registerCardEventHandler(CardEvents.CONFIG_RECEIVED, (e: Event) => {
    const config = (e as CustomEvent).detail.config as ConfigState
    const filledConfig = fulfillWithDefaults(config)
    updateConfig(filledConfig, false)
  })

  return {
    config: state,
    updateConfig
  }
}
