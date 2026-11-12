import { ConfigContext } from '@store/ConfigContext'
import { HassContext, hassDarkMode } from '@store/HassContext'
import { resolveTheme } from '@components/HaCard'
import { useContext } from 'preact/compat'
import { FiMoon, FiSun } from 'react-icons/fi'

/**
 * Pins the card to light or dark; the Plugins tab can set it back to
 * following Home Assistant.
 *
 * The icon follows the card's resolved theme. It used Tailwind's `dark:`
 * variant, which in v4 tracks the operating system, not the card.
 */
export function DarkModeToggle () {
  const { config, updateConfig } = useContext(ConfigContext)
  const hass = useContext(HassContext)
  const { scheme } = resolveTheme(
    config.plugins.daisyui.theme,
    hassDarkMode(hass)
  )
  const isDark = scheme === 'dark'

  const setTheme = (next: 'dark' | 'light') => {
    const themeName = next === 'dark' ? 'dark - dark' : 'light - light'
    updateConfig({
      plugins: {
        ...config.plugins,
        daisyui: { ...config.plugins.daisyui, theme: themeName }
      }
    })
  }

  return (
    <div className='flex-grow flex justify-end text-base-content text-xl'>
      <button
        type='button'
        aria-label={isDark ? 'Use the light theme' : 'Use the dark theme'}
        className='hover:scale-110 active:scale-90 transition-all'
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
      >
        {isDark ? <FiSun /> : <FiMoon />}
      </button>
    </div>
  )
}
