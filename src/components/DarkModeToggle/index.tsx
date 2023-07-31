import { ConfigContext } from '@store/ConfigContext'
import { useContext } from 'preact/compat'
import { FiMoon, FiSun } from 'react-icons/fi'

export function DarkModeToggle () {
  const { config, updateConfig } = useContext(ConfigContext)

  const setTheme = (scheme: 'dark' | 'light') => {
    const themeName = scheme === 'dark' ? 'dark - dark' : 'light - light'
    updateConfig({
      plugins: {
        ...config.plugins,
        daisyui: { ...config.plugins.daisyui, theme: themeName }
      }
    })
  }
  return (
    <div className='flex-grow flex justify-end text-base-content text-xl'>
      <div className='hidden dark:block hover:scale-110 active:scale-90 transition-all' onClick={() => setTheme('light')}>
        <FiSun />
      </div>
      <div className='block dark:hidden hover:scale-110 active:scale-95 transition-all' onClick={() => setTheme('dark')}>
        <FiMoon />
      </div>
    </div>
  )
}
