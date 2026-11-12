import { useContext } from 'preact/hooks'
import { ConfigContext } from '@store/ConfigContext'
import { ConfigCheckbox } from '@components/ConfigCheckbox'

export function TweakPluginToggle ({
  label,
  plugin
}: {
  label: string
  plugin: 'daisyui'
}) {
  const { config, updateConfig } = useContext(ConfigContext)

  return (
    <ConfigCheckbox
      checked={config.plugins[plugin].enabled}
      onChange={checked => {
        updateConfig({
          plugins: {
            ...config.plugins,
            [plugin]: { ...config.plugins[plugin], enabled: checked }
          }
        })
      }}
    >
      {label}
    </ConfigCheckbox>
  )
}
