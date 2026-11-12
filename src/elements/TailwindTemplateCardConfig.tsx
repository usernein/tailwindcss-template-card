import { render } from 'preact'
import { HomeAssistant } from 'custom-card-helpers'

import { TailwindTemplateRenderer } from './TailwindTemplateRenderer'
import { fulfillWithDefaults, withoutDefaults } from '@store/configDefaults'
import { ConfigState } from '@types'
import { ConfigChannel } from '@store/ConfigChannel'
import { ConfigProvider } from '@store/ConfigProvider'
import { HassContext } from '@store/HassContext'
import { HaCardConfig } from '@components/HaCardConfig'
import React from 'preact/compat'

/** Hoisted: building this inside `_render` created a new component type on
 *  every call, which defeats memoisation and forces a full remount. */
const MemoizedCardConfig = React.memo(HaCardConfig)

/**
 * The card's visual editor.
 *
 * Mounted from construction until disconnect, and again on reconnect. Configs
 * reach the mounted tree, and edits leave it, through this element's own
 * `ConfigChannel` — never through anything shared with other elements.
 */
export class TailwindTemplateCardConfig extends TailwindTemplateRenderer {
  /** Whether the Preact tree is currently mounted into the shadow root. */
  private _mounted = false

  private readonly _channel = new ConfigChannel(config => {
    // A detached editor must not keep answering for the live one.
    if (this.isConnected) this.configChanged(fulfillWithDefaults(config))
  })

  constructor () {
    super()

    // Mounted here, not in connectedCallback: Home Assistant may call
    // setConfig before the element is attached.
    this._render()
    this._mounted = true
  }

  /** The channel replays the current config to the remounted tree. */
  connectedCallback () {
    if (!this._mounted) {
      this._render()
      this._mounted = true
    }
  }

  /*
   * Unmount on disconnect so the tree's effects actually run their cleanup.
   * Removing the custom element does not by itself tell Preact to unmount.
   */
  disconnectedCallback () {
    render(null, this.shadow)
    this._mounted = false
  }

  configReceived () {
    this._channel.receive(this._config)
  }

  /** Re-render so the entity picker and theme see the current `hass`. */
  public set hass (hass: HomeAssistant) {
    this._oldHass = this._hass
    this._hass = hass
    // Never re-mount a tree that disconnectedCallback just tore down.
    if (this._mounted) this._render()
  }

  public get hass (): HomeAssistant | undefined {
    return this._hass
  }

  /** Writes back only what differs from the defaults, keeping YAML readable. */
  configChanged (newConfig: ConfigState) {
    const event = new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: withoutDefaults(newConfig) }
    })

    this.dispatchEvent(event)
  }

  _render () {
    render(
      <HassContext.Provider value={this._hass}>
        <ConfigProvider channel={this._channel}>
          <MemoizedCardConfig />
        </ConfigProvider>
      </HassContext.Provider>,
      this.shadow
    )
  }
}
