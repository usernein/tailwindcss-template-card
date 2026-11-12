import { PropsWithChildren } from 'preact/compat'

export function ConfigCheckbox ({
  checked,
  onChange,
  children
}: PropsWithChildren & {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className='label bg-base-100 rounded-xl px-2 cursor-pointer gap-2 min-w-[40%]'>
      <input
        type='checkbox'
        checked={checked}
        className='checkbox checkbox-accent'
        onChange={e => onChange((e.target as HTMLInputElement).checked)}
      />
      <span className='label-text text-left w-full'>{children}</span>
    </label>
  )
}
