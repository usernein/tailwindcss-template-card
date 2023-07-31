import { render } from 'preact'

// support shadowroot.adoptedStyleSheets in all browsers
import 'construct-style-sheets-polyfill'
import { TailwindTemplateRenderer } from './TailwindTemplateRenderer'
import { fulfillWithDefaults } from '@store/ConfigReducer'
import { ConfigState } from '@types'
import { CardEvents, registerCardEventHandler } from '@utils/events'
// import { HaCardConfigWrapper } from '@components/HaCardConfigWrapper'
import { ConfigProvider } from '@store/ConfigProvider'
import { HaCardConfig } from '@components/HaCardConfig'
import React from 'preact/compat'

export class TailwindTemplateCardConfig extends TailwindTemplateRenderer {
  constructor () {
    super()

    this._force_daisyui = true
    this._ignore_broken_config = true
    this._rerender_after_set_config = false
    this._rerender_after_set_hass = false
    this._dispatch_config_setup_event = true

    registerCardEventHandler(CardEvents.CONFIG_CHANGED, (e: Event) => {
      console.log('config changed', e)
      const detail = (e as CustomEvent).detail
      const config = detail.config as Partial<ConfigState>
      this.configChanged(fulfillWithDefaults(config))
    })

    console.log('card element created')
    this._render()
  }

  configChanged (newConfig: ConfigState) {
    const event = new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: newConfig }
    })

    this.dispatchEvent(event)
  }

  _render () {
    const MemoizedCardConfig = React.memo(HaCardConfig)
    render(
      <ConfigProvider>
        <MemoizedCardConfig />
      </ConfigProvider>,
      this.shadow
    )
  }
}
