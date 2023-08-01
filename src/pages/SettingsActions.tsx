import { useContext, useMemo, useState } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { ActionConfig } from '@components/ActionConfig'
import { Action } from '@types'

export const SettingsActions = () => {
  const { config, updateConfig } = useContext(ConfigContext)
  const actions = useMemo(() => config.actions, [config.actions])

  const [maximizedAction, setMaximizedAction] = useState(
    null as keyof typeof actions | null
  )

  const maximize = (actionKey: keyof typeof actions) => {
    setMaximizedAction(actionKey)
  }

  return (
    <div className='collapse collapse-arrow bg-base-200'>
      <input type='checkbox' className='peer' />
      <div className='collapse-title text-md font-medium'>Actions</div>
      <div className='collapse-content flex flex-col w-full max-w-full overflow-hidden'>
        <div className='scrollbar-thin scrollbar-track-base-200 scrollbar-thumb-white/5 overflow-x-scroll w-full'>
          <div className='gap-2 p-2 grid grid-rows-3 grid-flow-col-dense w-full max-h-64 empty:hidden '>
            {actions.map((action: Action, index: keyof typeof actions) => (
              <ActionConfig
                key={index}
                action={action}
                isMinimized={maximizedAction !== index}
                maximize={() => maximize(index)}
                onChange={value => {
                  updateConfig({
                    actions: actions.map((v, i) => (i === index ? value : v))
                  })
                }}
              />
            ))}
          </div>
        </div>
        <div className='w-full flex justify-end'>
          <button
            class={'btn btn-accent btn-sm'}
            onClick={() =>
              updateConfig({
                actions: [...actions, { type: '', selector: '', call: '' }]
              })
            }
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
