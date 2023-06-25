import { useContext, useMemo } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { BindingConfig } from '@components/BindingConfig'

export const SettingsBindings = () => {
  const { config, updateConfig } = useContext(ConfigContext)
  const bindings = useMemo(() => config.bindings, [config.bindings])
  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='collapse collapse-arrow bg-base-300/30'>
        <input type='checkbox' checked={true} />
        <div className='collapse-title text-md font-medium'>Bindings</div>
        <div className='collapse-content'>
          {bindings.map((binding, index) => (
            <BindingConfig key={index} binding={binding} />
          ))}
          <BindingConfig binding={{ bind: '', selector: '', type: '' }} />
        </div>
      </div>
      <div className='collapse collapse-arrow bg-base-300/30'>
        <input type='checkbox' />
        <div className='collapse-title text-md font-medium'>Actions</div>
        <div className='collapse-content'>
          <p>hello</p>
        </div>
      </div>
    </div>
  )
}
