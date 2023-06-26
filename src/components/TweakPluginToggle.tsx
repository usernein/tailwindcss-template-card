import { useContext } from 'preact/hooks'
import { ConfigContext } from '@store/ConfigContext'
import { ConfigCheckbox } from '@components/ConfigCheckbox'
import { ConfigState } from '@types'

export function TweakPluginToggle ({
  label,
  plugin,
  disabled
}: {
  label: string
  plugin: keyof ConfigState['plugins']
  disabled?: boolean
}) {
  const { config, updateConfig } = useContext(ConfigContext)

  return (
    <ConfigCheckbox
      checked={config.plugins[plugin]?.enabled}
      onChange={checked => {
        updateConfig({
          plugins: {
            [plugin]: {
              ...config.plugins[plugin],
              enabled: checked
            }
          }
        })
      }}
      disabled={disabled}
    >
      {label}
    </ConfigCheckbox>
  )
}
