import { useContext, useMemo, useState } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { BindingConfig } from '@components/BindingConfig'
import { Binding } from '@types'

export const SettingsActions = () => {
  const { config, updateConfig } = useContext(ConfigContext)
  const bindings = useMemo(() => config.bindings, [config.bindings])

  const [maximizedBind, setMaximizedBind] = useState(
    null as keyof typeof bindings | null
  )

  const maximize = (bindKey: keyof typeof bindings) => {
    setMaximizedBind(bindKey)
  }

  return (
    <div className='collapse collapse-arrow bg-base-200'>
      <input type='checkbox' />
      <div className='collapse-title text-md font-medium'>Actions</div>
      <div className='collapse-content'>
        <p>In development</p>
      </div>
    </div>
  )
}
