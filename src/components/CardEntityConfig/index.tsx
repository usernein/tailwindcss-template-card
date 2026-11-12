import { HomeAssistant } from 'custom-card-helpers'
import { useContext, useEffect, useRef } from 'preact/hooks'
import { EntityCombobox } from '@components/EntityCombobox'
import { ConfigContext } from '@store/ConfigContext'
import { HassContext } from '@store/HassContext'
import { useElementDefined } from '@utils/useElementDefined'

const ELEMENT_NAME = 'ha-entity-picker'

type HaEntityPickerElement = HTMLElement & {
  hass?: HomeAssistant
  value?: string
  allowCustomEntity?: boolean
}

/**
 * Home Assistant's own entity picker, with friendly names, icons and search,
 * driven the same way as `ha-code-editor`: created imperatively and given its
 * properties directly, since it reads `hass` as a property, not an attribute.
 */
function HaEntityPicker ({
  hass,
  value,
  onChange
}: {
  hass: HomeAssistant
  value: string
  onChange: (value: string) => void
}) {
  const ref = useRef<HaEntityPickerElement | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const picker = ref.current
    if (!picker) return
    const handle = (e: Event) =>
      onChangeRef.current((e as CustomEvent<{ value?: string }>).detail?.value ?? '')
    picker.allowCustomEntity = true
    picker.addEventListener('value-changed', handle)
    return () => picker.removeEventListener('value-changed', handle)
  }, [])

  useEffect(() => {
    if (ref.current) ref.current.hass = hass
  }, [hass])

  useEffect(() => {
    if (ref.current) ref.current.value = value
  }, [value])

  // @ts-expect-error <ha-entity-picker> is not native
  return <ha-entity-picker ref={ref} class='block w-full' />
}

export function CardEntityConfig () {
  const { config, updateConfig } = useContext(ConfigContext)
  const hass = useContext(HassContext)
  const available = useElementDefined(ELEMENT_NAME)

  const onChange = (entity: string) => updateConfig({ entity })

  return (
    <div className='label w-full flex-col items-start'>
      <span className='label-text-alt text-inherit'>Entity</span>
      {hass && available ? (
        <HaEntityPicker hass={hass} value={config.entity} onChange={onChange} />
      ) : (
        hass && (
          <EntityCombobox
            defaultValue={config.entity}
            onChange={onChange}
            hass={hass}
          />
        )
      )}
    </div>
  )
}
