import { useContext, useMemo, useState } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { BindingConfig } from '@components/BindingConfig'

export const SettingsBindings = () => {
  const { config, updateConfig } = useContext(ConfigContext)
  const bindings = useMemo(() => config.bindings, [config.bindings])

  const [maximizedBind, setMaximizedBind] = useState(null as null | number)

  const maximize = (bindKey: number) => {
    setMaximizedBind(bindKey)
  }

  return (
    <div className='min-w-full flex flex-col gap-3'>
      <div className='collapse collapse-arrow bg-base-200'>
        <input type='checkbox' />
        <div className='collapse-title text-md font-medium'>Bindings</div>
        <div className='collapse-content flex flex-row flex-wrap gap-2 max-h-min transition-[height] duration-300 delay-1000'>
          <div className='w-fit overflow-x-scroll flex flex-col gap-2 flex-wrap max-h-96 '>
          {bindings.map((binding, index) => (
            <BindingConfig key={index} binding={binding} isMinimized={maximizedBind !== index} maximize={() => maximize(index)} />
          ))}
          </div>
          <div className="w-full flex justify-end p-2">
            <button class={'btn btn-accent btn-sm btn-'} onClick={() => updateConfig({ bindings: [...bindings, {type: "", selector: "", bind: ""}] })}>Add</button>
          </div>
        </div>
      </div>
      <div className='collapse collapse-arrow bg-base-200'>
        <input type='checkbox' />
        <div className='collapse-title text-md font-medium'>Actions</div>
        <div className='collapse-content'>
          <p>hello</p>
        </div>
      </div>
    </div>
  )
}