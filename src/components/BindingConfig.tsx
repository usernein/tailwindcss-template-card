import { Binding } from '@/src/types'
import { FloatingInput } from '@components/FloatingInput'
import { FloatingTextarea } from './FloatingTextarea'
import clsx from 'clsx'

export function BindingConfig ({
  binding,
  isMinimized = false,
  maximize
}: {
  binding: Binding
  isMinimized?: boolean
  maximize?: () => void
}) {
  const openHandler: EventListener = e => {
    e.preventDefault()
    e.stopImmediatePropagation()

    if (maximize) maximize()
  }
  return (
    <div
      class={clsx(
        'flex flex-col gap-2 justify-center bg-base-100 p-2 rounded-[var(--rounded-box)] transition-[height] duration-300 w-56',
        isMinimized ? 'h-12 cursor-pointer delay-150' : 'h-32'
      )}
      {...(isMinimized ? { onClickCapture: openHandler, onMouseOverCapture: (e) => e.stopImmediatePropagation() } : {})}
    >
      <div class='w-full h-fit self-start flex flex-row flex-wrap'>
        <FloatingInput
          label='Selector'
          value={binding.selector}
          onChange={value => {}}
          isMinimized={isMinimized}
        />
        <FloatingInput
          label='Type'
          value={binding.type}
          onChange={value => {}}
          isMinimized={isMinimized}
        />
        {!isMinimized && (
          <FloatingTextarea
            label='Bind'
            value={binding.bind}
            onChange={value => {}}
          />
        )}
      </div>
    </div>
  )
}
