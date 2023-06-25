import { useContext } from 'preact/hooks'
import { ConfigContext } from '@store/ConfigContext'
import { ConfigToggle } from '@components/ConfigToggle'
import { ConfigState } from '@store/ConfigReducer'

export function TweakToggle ({
  label,
  tweak
}: {
  label: string
  tweak: keyof ConfigState
}) {
  const { config, updateConfig } = useContext(ConfigContext)

  return (
    <ConfigToggle
      checked={config[tweak] as boolean}
      onChange={checked => updateConfig({ [tweak]: checked })}
    >
      {label}
    </ConfigToggle>
  )
}
