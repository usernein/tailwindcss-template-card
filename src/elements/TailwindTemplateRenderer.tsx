import { HomeAssistant } from 'custom-card-helpers'
import { render } from 'preact'
import config from '../../twind.config'
import { twind, cssom, observe } from '@twind/core'

// support shadowroot.adoptedStyleSheets in all browsers
import 'construct-style-sheets-polyfill'
import axios from 'axios'
import { ConfigState, fulfillWithDefaults } from '../store/ConfigReducer'

export abstract class TailwindTemplateRenderer extends HTMLElement {
  _hass: HomeAssistant | undefined
  _oldHass: HomeAssistant | undefined
  _config: ConfigState = {} as ConfigState
  _oldConfig: ConfigState = {} as ConfigState
  shadow: ShadowRoot
  _force_daisyui: boolean = false
  _ignore_broken_config = false

  constructor () {
    super()

    this.shadow = this.attachShadow({ mode: 'open' })
  }

  setConfig (config: Partial<ConfigState>) {
    this._oldConfig = this._config
    this._config = fulfillWithDefaults(config)

    const event = new CustomEvent('tailwindcss-template-card-config-received', {
      bubbles: true,
      composed: true,
      detail: { config }
    })
    window.dispatchEvent(event)

    this.injectStylesheetsIfNeeded()
    this._render(true)
  }

  injectStylesheetsIfNeeded () {
    const inSetup = Object.keys(this._oldConfig).length === 0
    const pluginsConfigHasChanged =  (this._config.plugins !== this._oldConfig.plugins)

    if (inSetup || pluginsConfigHasChanged) {
      this.injectStylesheets(this._config)
    }
  }

  injectStylesheets ({ plugins }: ConfigState) {
    const adoptedStyleSheets = [] as CSSStyleSheet[]

    const sheet = cssom(new CSSStyleSheet())
    const tw = twind(config, sheet)

    const styles = document.querySelector('head')?.querySelectorAll('style')

    if (styles) {
      styles.forEach(elem => {
        const om = cssom(new CSSStyleSheet())
        om.target.replaceSync(elem.innerHTML)
        adoptedStyleSheets.push(om.target)
      })
    }

    if (!plugins || this._force_daisyui || plugins.daisyui?.enabled) {
      const daisySheet = cssom(new CSSStyleSheet())
      const daisyCDN = plugins?.daisyui?.url || DAISYUI_CDN_URL
      axios.get(daisyCDN).then(res => {
        daisySheet.target.replaceSync(res.data)
      })
      adoptedStyleSheets.push(daisySheet.target)
    }

    adoptedStyleSheets.push(sheet.target)

    this.shadow.adoptedStyleSheets = adoptedStyleSheets
    observe(tw, this.shadow)
  }

  public set hass (hass: HomeAssistant) {
    this._oldHass = this._hass
    this._hass = hass

    window.hass = hass

    this._render()
  }

  abstract _render(forceRender?: boolean): void

  _deRender () {
    this.shadow.innerHTML = ''

    render('', this.shadow)
  }
}
