import { useContext } from 'preact/hooks'
import { ConfigContext } from '@store/ConfigContext'
import { FloatingInput } from '@components/FloatingInput'
import { ConfigState } from '@types'
import { useDebouncer } from '@utils/DebounceHandler'
import { useConfigMemo } from '@store/useConfigMemo'

export function TweakPluginInput ({
  label,
  plugin,
  option
}: {
  label: string
  plugin: keyof ConfigState['plugins']
  option: keyof ConfigState['plugins'][typeof plugin]
}) {
  const { updateConfig } = useContext(ConfigContext)
  const { debounceChangePeriod, plugins } = useConfigMemo('debounceChangePeriod', 'plugins')
  const debounce = useDebouncer(debounceChangePeriod)

  return (
    <FloatingInput
      value={plugins.daisyui.url ?? ''}
      label={label}
      className='w-full'
      onChange={value => {
        debounce(() => {
          updateConfig({
            plugins: {
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
