import { FloatingInput } from '@components/FloatingInput'
import { FloatingTextarea } from './FloatingTextarea'
import clsx from 'clsx'
import { Binding } from '@types'

export function BindingConfig ({
  binding,
  isMinimized = false,
  maximize,
  onChange
}: {
  binding: Binding
  isMinimized?: boolean
  maximize?: () => void
  onChange: (value: Binding) => void
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
        isMinimized ? 'h-20 brightness-75' : 'h-60'
      )}
      {...(isMinimized
        ? {
            onClickCapture: openHandler
          }
        : {})}
    >
      <div
        class={clsx(
          'w-full h-full self-start flex flex-col gap-5',
          isMinimized && 'pointer-events-none'
        )}
      >
        <div class='w-full h-32 flex flex-row gap-2'>
          <FloatingInput
            label='Selector'
            value={binding.selector}
            onChange={value =>
              onChange({ ...binding, selector: value })
            }
            mode='css'
          />
          <FloatingInput
            label='Type'
            value={binding.type}
            onChange={value => onChange({ ...binding, type: value })}
          />
        </div>
        <div
          className={clsx(
            'w-full transition-all duration-300 h-full',
            isMinimized && 'hidden'
          )}
        >
          <FloatingTextarea
            label='Bind'
            value={binding.bind}
            onChange={value => onChange({ ...binding, bind: value })}
            mode='javascript'
          />
        </div>
      </div>
    </div>
  )
}
