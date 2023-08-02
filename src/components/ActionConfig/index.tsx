import clsx from 'clsx'
import { Action } from '@types'
import { InputCodeEditor } from '@components/InputCodeEditor'
import { BiSolidTrash } from 'react-icons/bi'

export function ActionConfig ({
  action,
  isMinimized = false,
  maximize,
  onChange,
  onDelete
}: {
  action: Action
  isMinimized?: boolean
  maximize?: () => void
  onChange: (value: Action) => void
  onDelete: () => void
}) {
  const openHandler: EventListener = e => {
    e.preventDefault()
    e.stopImmediatePropagation()

    if (maximize) maximize()
  }

  return (
    <div
      class={clsx(
        'relative group flex flex-col gap-2 justify-start bg-base-100 p-2 rounded-[var(--rounded-box)] origin-top transition-[height] duration-300 w-80 overflow-visible',
        isMinimized
          ? 'row-span-1 opacity-75 cursor-pointer'
          : 'row-span-2 ring-base-content ring-1'
      )}
      {...(isMinimized
        ? {
            onClick: openHandler
          }
        : {})}
    >
      <div
        className='z-10 hover:text-error hover:scale-110 active:scale-90 transition-all text-base-content/30 text-sm absolute top-2 right-4 hidden group-hover:flex'
        onClick={e => {
          e.stopImmediatePropagation()
          onDelete()
        }}
      >
        <BiSolidTrash />
      </div>

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
            onChange={value => onChange({ ...action, selector: value })}
            mode='css'
          />
          <div class={clsx('h-full py-1 w-full flex flex-col-reverse')}>
            <select
              className='select min-h-0 h-full w-full text-base-content select-bordered'
              defaultValue={action.type}
              onChange={e =>
                onChange({
                  ...action,
                  type: (e.target as HTMLSelectElement).value
                })
              }
            >
              <option>click</option>
              <option>dblclick</option>
              <option>change</option>
              <option>input</option>
            </select>
            <label
              for='floating_outlined'
              class='select-none flex text-base-content'
            >
              <span className='label-text-alt text-inherit'>Type</span>
            </label>
          </div>
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
