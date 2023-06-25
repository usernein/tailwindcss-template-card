import { useContext } from 'preact/compat'
import { TweakToggle } from '@components/TweakToggle'
import { ConfigContext } from '@store/ConfigContext'
import { CodeEditorOptions } from '@components/CodeEditorOptions'

export const SettingsTweaks = ({ inHiddenMode }: { inHiddenMode?: boolean }) => {
  const { config, updateConfig } = useContext(ConfigContext)
  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='collapse collapse-open bg-base-200'>
        <div className='collapse-title text-md font-medium text-base-content'>General</div>
        <div className='collapse-content flex gap-1 flex-col'>
          <TweakToggle label='Ignore line breaks' tweak='ignore_line_breaks' />
          <TweakToggle label='Always update' tweak='always_update' />
          <TweakToggle label='Parse Jinja templates' tweak='parse_jinja' />
          <CodeEditorOptions inHiddenMode={inHiddenMode}/>
        </div>
      </div>

      <div className='collapse collapse-open bg-base-200'>
        <div className='collapse-title text-md font-medium text-base-content'>DaisyUI theme</div>
        <div className='collapse-content'>
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
            className='select w-full text-base-content'
          >
            <option selected>inherit</option>
            {Object.values(DAISYUI_THEMES).map(({ theme, scheme }) => (
              <option key={theme} value={theme}>
                {scheme} - {theme}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
