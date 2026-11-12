import { TweakPluginToggle } from '@components/TweakPluginToggle'
import { ConfigContext } from '@store/ConfigContext'
import { FOLLOW_HA_THEME } from '@store/configDefaults'
import { useContext } from 'preact/compat'

export const SettingsPlugins = () => {
  const { config, updateConfig } = useContext(ConfigContext)

  return (
    <div className='w-full flex flex-col gap-3 text-base-content'>
      <div className='collapse collapse-open overflow-visible bg-base-200'>
        <div className='collapse-title text-md font-medium'>Plugins</div>
        <div className='collapse-content'>
          <TweakPluginToggle label='DaisyUI' plugin='daisyui' />
        </div>
      </div>

      <div className='collapse collapse-open bg-base-200'>
        <div className='collapse-title text-md font-medium'>
          Plugins settings
        </div>
        <div className='collapse-content'>
          <label className='label flex flex-col justify-start items-start'>
            <span className='label-text-alt flex text-base-content'>
              DaisyUI theme
            </span>
            <select
              value={config.plugins.daisyui.theme ?? FOLLOW_HA_THEME}
              onChange={(e: Event) =>
                updateConfig({
                  plugins: {
                    ...config.plugins,
                    daisyui: {
                      ...config.plugins.daisyui,
                      theme: (e.target as HTMLSelectElement).value
                    }
                  }
                })
              }
              className='select w-full text-base-content'
            >
              <option value={FOLLOW_HA_THEME}>
                Follow Home Assistant (light or dark)
              </option>
              {Object.values(DAISYUI_THEMES).map(({ theme, scheme }) => (
                <option key={theme} value={`${scheme} - ${theme}`}>
                  {scheme} - {theme}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}
