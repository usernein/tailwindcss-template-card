import { render } from 'preact'
import { HaCard } from '../components/HaCard'

// support shadowroot.adoptedStyleSheets in all browsers
import 'construct-style-sheets-polyfill'
import { TailwindTemplateRenderer } from './TailwindTemplateRenderer'
import { initialConfigState } from '../store/ConfigReducer'

console.info(
  `%c  TailwindCSS Template Card  \n%c  Version ${CARD_VERSION}  \n%c  Star it at http://github.com/usernein/tailwindcss-template-card!`,
  'color: #2d2c35; font-weight: bold; background: #f5f6f9',
  'color: #aef3fc; font-weight: bold; background: #2d2c35',
  'color: #aef3fc; font-weight: bold; background: #2d2c35'
)

export class TailwindTemplateCard extends TailwindTemplateRenderer {
  _entitiesToWatch: string[] = []
  _htmlContent: string = ''

  constructor () {
    super()
  }

  static getConfigElement () {
    return document.createElement('tailwindcss-template-card-config')
  }

  static getStubConfig () {
    return initialConfigState
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
    if (!this._hass || !this._config || this._config.content === undefined)
      return

    Object.keys(this._hass.states).forEach((entity_id: string) => {
      if (!this._hass || !this._config || this._config.content === undefined)
        return

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
    if (!this._hass || !this._config || this._config.content == undefined)
      return

    let content = this._config.content

    if (
      undefined !== this._config.ignore_line_breaks &&
      !this._config.ignore_line_breaks
    ) {
      content = content.replace(/\r?\n|\r/g, '</br>')
    }

    if (!this._config.parse_jinja) {
      this._htmlContent = content
      this._renderHtmlContent()
      return
    }

    this._hass.connection.subscribeMessage(
      (msg: { result: string }) => {
        this._htmlContent = msg.result
        this._renderHtmlContent()
      },
      {
        type: 'render_template',
        template: content
      }
    )
  }

  _render () {
    this.updateEntitiesToWatch()
    this.renderIfNeeded()
  }

  _renderHtmlContent () {
    this.ensureIsReadyForRender()

    render(
      <HaCard htmlContent={this._htmlContent} config={this._config} />,
      this.shadow
    )
  }

  ensureIsReadyForRender () {
    if (!this._hass) {
      throw new Error('this._hass is invalid')
    }
    if (this._config === undefined) {
      throw new Error('this.config is invalid')
    }
    if (this._config.content === undefined) {
      throw new Error('this.config.content is invalid')
    }
    if (!this.shadow) {
      throw new Error('this.shadow is invalid')
    }
  }
}
