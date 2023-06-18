export function ConfigToggle ({
  children,
  checked,
  onChange
}: {
  children: any
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className='label cursor-pointer bg-white/5 rounded-xl px-2'>
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
