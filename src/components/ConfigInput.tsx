import { PropsWithChildren } from 'preact/compat'

export function ConfigInput ({
  disabled = false,
  value,
  placeholder,
  onChange,
  children,
  debounceChangePeriod = 500
}: PropsWithChildren & {
  disabled?: boolean
  value: string
  placeholder: string
  onChange: (value: string) => void
  debounceChangePeriod?: number
}) {
  let timeoutPointer: NodeJS.Timeout
  return (
    <div className='form-control'>
      <label class='label px-0 gap-3'>
        <span className='label-text text-left text-xs whitespace-nowrap'>
          {children}
        </span>
        <input
          type='text'
          className='input w-full input-sm bg-base-100'
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          spellcheck={false}
          onInput={e => {
            if (timeoutPointer) {
              clearTimeout(timeoutPointer)
            }
            const value = (e.target as HTMLInputElement).value

            timeoutPointer = setTimeout(() => {
              onChange(value)
            }, debounceChangePeriod)
          }}
        />
      </label>
    </div>
  )
}
