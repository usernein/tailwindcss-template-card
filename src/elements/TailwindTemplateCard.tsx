import { HomeAssistant } from 'custom-card-helpers'
import { render } from 'preact'
import { HaCard } from '../components/HaCard'
import config from '../../twind.config'
import { twind, cssom, observe } from '@twind/core'
// support shadowroot.adoptedStyleSheets in all browsers
import 'construct-style-sheets-polyfill'

console.info(
  `%c  TailwindCSS Template Card  \n%c  Version ${CARD_VERSION}  `,
  'color: cyan; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
)

export class TailwindTemplateCard extends HTMLElement {
  _hass: HomeAssistant | undefined
  _oldHass: HomeAssistant | undefined
  _config: any
  _entitiesToWatch: string[] = []
  shadow: ShadowRoot

  constructor () {
    super()

    this.shadow = this.attachShadow({ mode: 'open' })

    const sheet = cssom(new CSSStyleSheet())

    const tw = twind(config, sheet)
    this.shadow.adoptedStyleSheets = [sheet.target]
    observe(tw, this.shadow)
  }

  static getStubConfig () {
    return {
      ignore_line_breaks: true,
      always_update: false,
      content: `<div class="w-32 h-32 bg-blue-900 rounded-3xl flex justify-center items-center animate-pulse hover:scale-150 transition-all">Hello, World!</div>`,
      entities: ['sun.sun']
    }
  }

  setConfig (config: any) {
    if (!config.content) {
      throw new Error('The field content is required')
    }
    this._config = config

    this.updateEntitiesToWatch()
    this.renderIfNeeded()
  }

  public set hass (hass: HomeAssistant) {
    this._oldHass = this._hass
    this._hass = hass

    window.hass = hass

    this.updateEntitiesToWatch()
    this.renderIfNeeded()
  }

  updateEntitiesToWatch () {
    this._entitiesToWatch = []

    if (this._config.entities && Array.isArray(this._config.entities)) {
      this._config.entities.forEach((entity: string) => {
        this._entitiesToWatch.push(entity)
      })
    }

    this.watchMentionedEntities()
  }

  watchMentionedEntities () {
    if (!this._hass) return

    Object.keys(this._hass.states).forEach((entity_id: string) => {
      if (!this._hass) return

      if (this._config.content.includes(entity_id)) {
        this._entitiesToWatch.push(entity_id)
      }
    })
  }

  renderIfNeeded (forceUpdate?: boolean) {
    if (forceUpdate || this.needsRender()) {
      this.processAndRender()
    }
  }

  needsRender () {
    if (
      !this._hass ||
      !this._oldHass ||
      !this._entitiesToWatch ||
      this._config.always_update
    )
      return true

    for (const entity_id of this._entitiesToWatch) {
      if (
        this._oldHass.states[entity_id] !== this._hass.states[entity_id] ||
        this._oldHass.states[entity_id].attributes !==
          this._hass.states[entity_id].attributes
      )
        return true
    }

    return false
  }

  getCardSize () {
    return 1
  }

  processAndRender () {
    if (!this._hass) return

    let content = this._config.content

    if (
      undefined !== this._config.ignore_line_breaks &&
      !this._config.ignore_line_breaks
    ) {
      content = content.replace(/\r?\n|\r/g, '</br>')
    }

    if (this._config.do_not_parse) {
      this._render(content)
      return
    }

    this._hass.connection.subscribeMessage(
      (msg: { result: string }) => this._render(msg.result),
      {
        type: 'render_template',
        template: content
      }
    )
  }

  _render (htmlContent: string) {
    this.ensureIsReadyForRender()

    render(<HaCard htmlContent={htmlContent} />, this.shadow)
  }

  ensureIsReadyForRender () {
    if (!this._hass) {
      throw new Error('this._hass is invalid')
    }
    if (!this._config) {
      throw new Error('this.config is invalid')
    }
    if (!this._config.content) {
      throw new Error('this.config.content is invalid')
    }
    if (!this.shadow) {
      throw new Error('this.shadow is invalid')
    }
  }

  _deRender () {
    this.shadow.innerHTML = ''

    render('', this.shadow)
  }
}
