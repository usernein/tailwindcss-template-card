import { render } from 'preact'
import { HaCardConfig } from '@components/HaCardConfig'

// support shadowroot.adoptedStyleSheets in all browsers
import 'construct-style-sheets-polyfill'
import { TailwindTemplateRenderer } from './TailwindTemplateRenderer'
import { fulfillWithDefaults } from '@store/ConfigReducer'
import { ConfigProvider } from '@store/ConfigProvider'
import { ConfigState } from '@types'

export class TailwindTemplateCardConfig extends TailwindTemplateRenderer {
  constructor () {
    super()

    this._force_daisyui = true
    this._ignore_broken_config = true

    window.addEventListener('tailwindcss-template-card-config-edited', ((
      e: CustomEvent
    ) => {
      const config = e.detail.config as Partial<ConfigState>
      this.configChanged(fulfillWithDefaults(config))
    }) as EventListener)
  }

  configChanged (newConfig: any) {
    const event = new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: { ...this._config, ...newConfig } }
    })

    this.dispatchEvent(event)
  }

  _render () {
    render(
      <ConfigProvider>
        <HaCardConfig />
      </ConfigProvider>,
      this.shadow
    )
  }
}
