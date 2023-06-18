export function ConfigInput ({
  disabled = false,
  value,
  placeholder,
  onChange,
  children
}: {
  disabled?: boolean
  value: string
  placeholder: string
  onChange: (value: string) => void
  children: any
}) {
  return (
    <div className='form-control'>
      <label class='label px-0 gap-3'>
        <span className='label-text text-left text-xs whitespace-nowrap'>
          {children}
        </span>
        <input
          type='text'
          className='input input-secondary w-full input-sm'
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          spellcheck={false}
          onInput={e => onChange((e.target as HTMLInputElement).value)}
        />
      </label>
    </div>
  )
}
