import { useContext, useMemo } from 'preact/hooks'
import { ConfigContext } from '@store/ConfigContext'
import { FloatingInput } from '@components/FloatingInput'
import { ConfigState } from '@types'
import { useDebouncer } from '@utils/DebounceHandler'

export function TweakPluginInput ({
  label,
  plugin,
  option
}: {
  label: string
  plugin: keyof ConfigState['plugins']
  option: keyof ConfigState['plugins'][typeof plugin]
}) {
  const { config, updateConfig } = useContext(ConfigContext)
  const { debounceChangePeriod, plugins } = useMemo(
    () => config,
    [config.debounceChangePeriod, config.plugins]
  )
  const debounce = useDebouncer(debounceChangePeriod)

  return (
    <FloatingInput
      value={plugins.daisyui.url ?? ''}
      label={label}
      className='w-full h-16'
      onChange={value => {
        debounce(() => {
          updateConfig({
            plugins: {
              ...plugins,
              [plugin]: {
                ...plugins[plugin],
                [option]: value
              }
            }
          })
        })
      }}
    />
  )
}
