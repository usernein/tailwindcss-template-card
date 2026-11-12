import { HomeAssistant } from 'custom-card-helpers'
import { createContext } from 'preact'

/**
 * The live `hass` object for the config editor.
 *
 * The entity picker used to read `window.hass` once at render, so it kept
 * offering whatever entities existed when the editor first opened.
 */
export const HassContext = createContext<HomeAssistant | undefined>(undefined)

/** `hass.themes.darkMode` is newer than the custom-card-helpers typings. */
export const hassDarkMode = (hass: HomeAssistant | undefined) =>
  Boolean((hass?.themes as { darkMode?: boolean } | undefined)?.darkMode)
