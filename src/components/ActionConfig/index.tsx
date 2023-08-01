import clsx from 'clsx'
import { Action } from '@types'
import { InputCodeEditor } from '@components/InputCodeEditor'

export function ActionConfig ({
  action,
  isMinimized = false,
  maximize,
  onChange
}: {
  action: Action
  isMinimized?: boolean
  maximize?: () => void
  onChange: (value: Action) => void
}) {
  const openHandler: EventListener = e => {
    e.preventDefault()
    e.stopImmediatePropagation()

    if (maximize) maximize()
  }

  return (
    <div
      class={clsx(
        'flex flex-col gap-2 justify-start bg-base-100 p-2 rounded-[var(--rounded-box)] origin-top transition-[height] duration-300 w-80 cursor-pointer overflow-hidden',
        isMinimized ? 'row-span-1 opacity-75' : 'row-span-2 ring-base-content ring-1'
      )}
      {...(isMinimized
        ? {
            onClickCapture: openHandler
          }
        : {})}
    >
      <div
        class={clsx(
          'w-full h-full self-start flex flex-col',
          isMinimized && 'pointer-events-none'
        )}
      >
        <div class='w-full h-32 flex flex-row gap-2'>
          <InputCodeEditor
            label='Selector'
            value={action.selector}
            onChange={value =>
              onChange({ ...action, selector: value })
            }
            mode='css'
          />
          <InputCodeEditor
            label='Type'
            value={action.type}
            onChange={value => onChange({ ...action, type: value })}
          />
        </div>
        <div
          className={clsx(
            'w-full transition-all duration-300 h-full',
            isMinimized && 'hidden'
          )}
        >
          <InputCodeEditor
            label='Call'
            value={action.call}
            onChange={value => onChange({ ...action, call: value })}
            mode='javascript'
            emulateTextarea={true}
          />
        </div>
      </div>
    </div>
  )
}
