import { useContext } from 'preact/hooks'
import { ConfigContext } from '@store/ConfigContext'
import { ConfigState } from '@store/ConfigReducer'
import { FloatingInput } from '@components/FloatingInput'

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

  return (
    <FloatingInput
      value={config.plugins.daisyui.url ?? ''}
      label={label}
      onChange={value => {
        updateConfig({
          plugins: {
            [plugin]: {
              ...config.plugins[plugin],
              [option]: value
            }
          }
        })
      }}
    />
  )
}
