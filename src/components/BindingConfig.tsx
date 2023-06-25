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
        'flex flex-col gap-2 justify-center bg-base-100 p-2 rounded-[var(--rounded-box)] transition-[height] duration-300 w-[40%] h-fit cursor-pointer',
        isMinimized ? 'opacity-70' : ''
      )}
      {...(isMinimized
        ? {
            onClickCapture: openHandler
          }
        : {})}
    >
      <div class={clsx('w-fit h-fit self-start flex flex-row flex-wrap', isMinimized && 'pointer-events-none')}>
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
        <div className={clsx('w-full transition-all duration-300', isMinimized && 'hidden')}>
          <FloatingTextarea
            label='Bind'
            value={binding.bind}
            onChange={value => {}}
          />
        </div>
      </div>
    </div>
  )
}
