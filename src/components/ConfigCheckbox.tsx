import { clsx } from 'clsx'
import { PropsWithChildren } from 'preact/compat'
export function ConfigCheckbox ({
  checked,
  disabled = false,
  onChange,
  children
}: PropsWithChildren & {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div
      className={clsx(
        disabled && 'tooltip',
        'tooltip-bottom tooltip-accent min-w-[40%]'
      )}
      data-tip='Not supported yet'
    >
      <label className='label bg-base-100 rounded-xl px-2 cursor-pointer gap-2'>
        <input
          type='checkbox'
          checked={checked}
          className='checkbox checkbox-accent'
          disabled={disabled}
          onChange={e => onChange((e.target as HTMLInputElement).checked)}
        />
        <span className='label-text text-left w-full'>{children}</span>
      </label>
    </div>
  )
}
