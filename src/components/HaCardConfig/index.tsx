import { ConfigContext } from '../../store/ConfigContext'
import { ConfigProvider } from '../../store/ConfigProvider'
import { ConfigCheckbox } from '../ConfigCheckbox'
import { ConfigInput } from '../ConfigInput'
import { ConfigToggle } from '../ConfigToggle'

export function HaCardConfig () {
  return (
    <ConfigProvider>
      <ConfigContext.Consumer>
        {({ config, updateConfig }) => (
          <div
            data-theme={config.plugins?.daisyui?.theme || "auto"}
            className='w-full flex flex-col justify-center items-center rounded-xl bg-base-100'
          >
            <div className='form-control w-[90%] gap-3 justify-evenly'>
              <div className='form-control w-full p-0'>
                <label className='label label-text transform text-sm pt-0'>
                  HTML Content
                </label>
                <textarea
                  value={config.content}
                  onInput={e =>
                    updateConfig({
                      content: (e.target as HTMLTextAreaElement).value
                    })
                  }
                  class='textarea textarea-accent h-48 font-mono rounded-xl w-full'
                  placeholder={`<div class=''></div>`}
                  spellcheck={false}
                ></textarea>
              </div>

              <div className='form-control w-full p-0 gap-1'>
                <div className='label label-text text-sm'>Settings</div>
                <div className='ring-1 ring-accent rounded-xl gap-1 flex flex-col p-2'>
                  <ConfigToggle
                    checked={config.ignore_line_breaks}
                    onChange={checked =>
                      updateConfig({ ignore_line_breaks: checked })
                    }
                  >
                    Ignore line breaks
                  </ConfigToggle>
                  <ConfigToggle
                    checked={config.always_update}
                    onChange={checked =>
                      updateConfig({ always_update: checked })
                    }
                  >
                    Always update
                  </ConfigToggle>
                  <ConfigToggle
                    checked={config.parse_jinja}
                    onChange={checked => updateConfig({ parse_jinja: checked })}
                  >
                    Parse Jinja templates
                  </ConfigToggle>
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
                  {Object.values(DAISYUI_THEMES).map(({theme, scheme}) => (
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
                    <ConfigCheckbox
                      checked={config.plugins.daisyui.enabled}
                      onChange={checked => {
                        updateConfig({
                          plugins: {
                            daisyui: {
                              ...config.plugins.daisyui,
                              enabled: checked
                            }
                          }
                        })
                      }}
                    >
                      DaisyUI
                    </ConfigCheckbox>
                    <ConfigCheckbox
                      checked={false}
                      onChange={checked => console.log(checked)}
                      disabled
                    >
                      Tailwind-Elements
                    </ConfigCheckbox>
                  </div>
                </div>
              </div>

              <div className='form-control w-full p-0'>
                <div className='label label-text text-sm'>Plugins settings</div>
                <div className='ring-1 ring-accent rounded-xl gap-1 flex flex-col p-2'>
                  <ConfigInput
                    value={config.plugins.daisyui.url}
                    placeholder={DAISYUI_CDN_URL}
                    onChange={value =>
                      updateConfig({
                        plugins: {
                          daisyui: {
                            ...config.plugins.daisyui,
                            url: value
                          }
                        }
                      })
                    }
                  >
                    DaisyUI CSS URL
                  </ConfigInput>
                </div>
              </div>
            </div>
          </div>
        )}
      </ConfigContext.Consumer>
    </ConfigProvider>
  )
}
