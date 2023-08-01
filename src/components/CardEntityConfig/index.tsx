import { EntityCombobox } from '@components/EntityCombobox'
import { ConfigContext } from '@store/ConfigContext'
import { useContext, useMemo } from 'preact/compat'

export function CardEntityConfig () {
  const { config, updateConfig } = useContext(ConfigContext)
  const entity_id = useMemo(() => config.entity, [config.entity])

  return (
    <div className='label w-full flex-col items-start'>
      <span className='label-text-alt text-inherit'>Entity</span>
      <EntityCombobox
        defaultValue={entity_id}
        onChange={v => {
          updateConfig({ entity: v })
        }}
        hass={window.hass}
      />
    </div>
  )
}
