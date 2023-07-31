import { PropsWithChildren } from "preact/compat"

export function ConfigToggle ({
  children,
  checked,
  onChange
}: PropsWithChildren & {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className='select label cursor-pointer bg-base-100 px-2'>
      <span className='label-text'>{children}</span>
      <input
        type='checkbox'
        checked={checked}
        onChange={e => onChange((e.target as HTMLInputElement).checked)}
        className='toggle toggle-accent'
      />
    </label>
  )
}
