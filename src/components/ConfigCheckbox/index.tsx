import { clsx } from 'clsx'
export function ConfigCheckbox ({
  checked,
  disabled = false,
  onChange,
  children
}: {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  children: any
}) {
  return (
    <div
      className={clsx(
        disabled && 'tooltip',
        'tooltip-bottom tooltip-accent min-w-[40%]'
      )}
      data-tip='Not supported yet'
    >
      <label className='label bg-white/5 rounded-xl px-2 cursor-pointer gap-2'>
        <input
          type='checkbox'
          checked={checked}
          className='checkbox'
          disabled={disabled}
          onChange={e => onChange((e.target as HTMLInputElement).checked)}
        />
        <span className='label-text w-full'>{children}</span>
      </label>
    </div>
  )
}
