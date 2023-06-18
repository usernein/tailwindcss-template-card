import { HomeAssistant } from 'custom-card-helpers'
import { render } from 'preact'
import config from '../../twind.config'
import { twind, cssom, observe } from '@twind/core'
import { HaCardConfig } from '../components/HaCardConfig'

// support shadowroot.adoptedStyleSheets in all browsers
import 'construct-style-sheets-polyfill'
import axios from 'axios'
import { ConfigState } from '../store/ConfigReducer'

export class TailwindTemplateRenderer extends HTMLElement {
  _hass: HomeAssistant | undefined
  _oldHass: HomeAssistant | undefined
  _config: Partial<ConfigState> = {}
  shadow: ShadowRoot
  _force_daisyui: boolean = false
  _ignore_broken_config = false

  constructor () {
    super()

    this.shadow = this.attachShadow({ mode: 'open' })
  }

  setConfig (config: Partial<ConfigState>) {
    const inSetup = this._config === undefined
    const pluginsConfigHasChanged =  (this._config.plugins !== config.plugins)

    if (inSetup || pluginsConfigHasChanged) {
      this.injectStylesheets(config)
    }

    this._config = config

    const event = new CustomEvent('tailwindcss-template-card-config-received', {
      bubbles: true,
      composed: true,
      detail: { config }
    })
    window.dispatchEvent(event)

    this._render()
  }

  injectStylesheets ({ plugins }: Partial<ConfigState>) {
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

    if (!plugins || this._force_daisyui || plugins.daisyui.enabled) {
      const daisySheet = cssom(new CSSStyleSheet())
      const daisyCDN = plugins?.daisyui.url || DAISYUI_CDN_URL
      axios.get(daisyCDN).then(res => {
        daisySheet.target.replaceSync(res.data)
      })
      adoptedStyleSheets.push(daisySheet.target)
    }

    adoptedStyleSheets.push(sheet.target)

    console.debug({ class: this.constructor.name, adoptedStyleSheets })

    this.shadow.adoptedStyleSheets = adoptedStyleSheets
    observe(tw, this.shadow)
  }

  public set hass (hass: HomeAssistant) {
    this._oldHass = this._hass
    this._hass = hass

    window.hass = hass

    this._render()
  }

  _render () {
    render(<HaCardConfig />, this.shadow)
  }

  _deRender () {
    this.shadow.innerHTML = ''

    render('', this.shadow)
  }
}
