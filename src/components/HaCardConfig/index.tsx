import { ConfigContext } from '../../store/ConfigContext'
import { CodeEditor } from '../CodeEditor'
import { TextareaEditor } from '../TextareaEditor'
import { TweakToggle } from '../../elements/TweakToggle'
import { TweakPluginToggle } from '../TweakPluginToggle'
import { TweakPluginInput } from '../TweakPluginInput'
import { useContext } from 'preact/hooks'

export function HaCardConfig () {
  const { config, updateConfig } = useContext(ConfigContext)

  return (
    <div
      data-theme={config.plugins.daisyui.theme ?? 'auto'}
      className='w-full flex flex-col justify-center items-center rounded-xl bg-base-100'
    >
      <div className='form-control w-[90%] gap-3 justify-evenly'>
        <div className='form-control w-full p-0'>
          <label className='label label-text transform text-sm pt-0'>
            HTML Content
          </label>
          {config.use_textarea_editor ? (
            <TextareaEditor
              value={config.content}
              onChange={e =>
                updateConfig({
                  content: e
                })
              }
              debounceChangePeriod={500}
            />
          ) : (
            <CodeEditor
              value={config.content}
              onChange={e => updateConfig({ content: e })}
            />
          )}
        </div>

        <div className='form-control w-full p-0 gap-1'>
          <div className='label label-text text-sm'>Settings</div>
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

        <div className='form-control w-full p-0'>
          <div className='label label-text text-sm'>Theme</div>
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

        <div className='form-control w-full p-0'>
          <div className='label label-text text-sm'>Plugins</div>
          <div className='flex flex-col p-2 ring-1 ring-accent rounded-xl'>
            <div className='w-full flex flex-row flex-wrap justify-between'>
              <TweakPluginToggle label='DaisyUI' plugin='daisyui' />
              <TweakPluginToggle
                label='Tailwind-Elements'
                plugin='tailwindElements'
                disabled
              />
            </div>
          </div>
        </div>

        <div className='form-control w-full p-0'>
          <div className='label label-text text-sm'>Plugins settings</div>
          <div className='ring-1 ring-accent rounded-xl gap-1 flex flex-col p-2'>
            <TweakPluginInput
              label='DaisyUI CSS URL'
              plugin='daisyui'
              option='url'
              placeholder={DAISYUI_CDN_URL}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
