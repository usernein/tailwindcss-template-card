import { HomeAssistant } from 'custom-card-helpers'
import { fulfillWithDefaults, validateConfig } from '@store/configDefaults'

import generatedCss from '@/src/index.css?inline'
import { ConfigState } from '@types'
import { TailwindEngine, extractCandidates } from '@/src/styles/TailwindEngine'

/**
 * The card's own build-time stylesheet, constructed once and adopted by every
 * instance. Building it per card parsed the same sheet again for each card on
 * the dashboard.
 */
let generatedSheet: CSSStyleSheet | null = null
const sharedGeneratedSheet = () => {
  if (!generatedSheet) {
    generatedSheet = new CSSStyleSheet()
    generatedSheet.replaceSync(generatedCss)
  }
  return generatedSheet
}

export abstract class TailwindTemplateRenderer extends HTMLElement {
  _hass: HomeAssistant | undefined
  _oldHass: HomeAssistant | undefined
  _config: ConfigState = {} as ConfigState
  shadow: ShadowRoot

  constructor () {
    super()

    this.shadow = this.attachShadow({ mode: 'open' })
    this.shadow.adoptedStyleSheets = [sharedGeneratedSheet()]
  }

  setConfig (config: Partial<ConfigState>) {
    validateConfig(config)
    this._config = fulfillWithDefaults(config)
    this.configReceived()
  }

  /**
   * Called with each config Home Assistant sets: the card repaints, the editor
   * hands it to the tree it mounted. Nothing is broadcast — a config is only
   * ever this element's business.
   */
  abstract configReceived (): void

  /** Entry stylesheet implied by the current plugin configuration. */
  get entryCss (): string {
    const daisyui = this._config?.plugins?.daisyui

    return TailwindEngine.buildEntryCss({
      daisyui: Boolean(daisyui?.enabled),
      daisyuiThemes: daisyui?.themes
    })
  }

  /**
   * Makes sure the given utility classes are compiled, and that this card
   * adopts the sheet holding them. Awaited before the DOM is rendered so
   * content never paints unstyled.
   *
   * Upstream also copied every `<style>` element out of the document head into
   * each card's shadow root. That duplicated Home Assistant's entire
   * stylesheet per card and let its rules fight the user's utility classes,
   * which is what made backgrounds and borders unstyleable. The shadow root is
   * already isolated, so nothing needs to be copied in.
   */
  async applyStyles (candidates: string[]) {
    try {
      const sheet = await TailwindEngine.sheetFor(this.entryCss, candidates)
      const generated = sharedGeneratedSheet()
      const [first, second] = this.shadow.adoptedStyleSheets
      if (first !== generated || second !== sheet) {
        this.shadow.adoptedStyleSheets = [generated, sheet]
      }
    } catch (e) {
      console.error('[tailwind-template-card] failed to compile Tailwind styles', e)
    }
  }

  /** Utility classes in the HTML the card is about to render. */
  candidatesFromHtml (html: string): string[] {
    return extractCandidates(html)
  }

  /**
   * Utility classes actually present in the rendered DOM.
   *
   * Bindings can introduce classes that appear nowhere in the source HTML
   * (`type: class`, or markup injected via `type: html`), so the compiled
   * stylesheet is topped up from the live DOM once bindings have run.
   */
  candidatesFromDom (): string[] {
    const found = new Set<string>()

    this.shadow.querySelectorAll('[class]').forEach(element => {
      element.classList.forEach(name => found.add(name))
    })

    return [...found]
  }

  public set hass (hass: HomeAssistant) {
    this._oldHass = this._hass
    this._hass = hass

    // Kept for content written against upstream, whose inline handlers
    // (`onclick="hass.callService(…)"`) resolve `hass` as a global.
    window.hass = hass

    this._render()
  }

  public get hass (): HomeAssistant | undefined {
    return this._hass
  }

  abstract _render(forceRender?: boolean): void
}
