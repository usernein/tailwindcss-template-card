import { useContext } from 'preact/compat'
import { TweakToggle } from '../../elements/TweakToggle'
import { ConfigContext } from '../../store/ConfigContext'

export const SettingsTweaks = () => {
  const { config, updateConfig } = useContext(ConfigContext)
  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='form-control w-full'>
        <div className='label label-text text-md font-medium'>Settings</div>
        <div className='ring-1 ring-accent rounded-xl gap-1 flex flex-col p-2'>
          <TweakToggle label='Ignore line breaks' tweak='ignore_line_breaks' />
          <TweakToggle label='Always update' tweak='always_update' />
          <TweakToggle label='Parse Jinja templates' tweak='parse_jinja' />
          <TweakToggle
            label='Use textarea editor'
            tweak='use_textarea_editor'
          />
        </div>
      </div>

      <div className='form-control w-full'>
        <div className='label label-text text-md font-medium'>Theme</div>
        <select
          value={config.plugins.daisyui.theme}
          onChange={(e: Event) =>
            updateConfig({
              plugins: {
                daisyui: {
                  ...config.plugins.daisyui,
                  theme: (e.target as HTMLSelectElement).value
                }
              }
            })
          }
          className='select select-accent p-2 rounded-xl w-full'
        >
          <option selected>auto</option>
          {Object.values(DAISYUI_THEMES).map(({ theme, scheme }) => (
            <option key={theme} value={theme}>
              {scheme} - {theme}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
