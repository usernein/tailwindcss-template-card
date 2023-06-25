import { useContext } from 'preact/hooks'
import { ConfigContext } from '@store/ConfigContext'
import { ConfigInput } from '@components/ConfigInput'
import { ConfigState } from '@store/ConfigReducer'

export function TweakPluginInput ({
  label,
  plugin,
  option,
  placeholder
}: {
  label: string
  plugin: keyof ConfigState['plugins']
  option: keyof ConfigState['plugins'][typeof plugin]
  placeholder: string
}) {
  const { config, updateConfig } = useContext(ConfigContext)

  return (
    <ConfigInput
      value={config.plugins.daisyui.url ?? ''}
      placeholder={placeholder}
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
    >
      {label}
    </ConfigInput>
  )
}
