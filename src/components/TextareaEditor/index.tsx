export function TextareaEditor ({
  value,
  onChange,
  debounceChangePeriod
}: {
  value: string
  onChange: (value: string) => void
  debounceChangePeriod: number
}) {
  let timeoutPointer: NodeJS.Timeout
  return (
    <div className='p-2'>
      <textarea
        value={value}
        onInput={e => {
          if (timeoutPointer) {
            clearTimeout(timeoutPointer)
          }
          const value = (e.target as HTMLInputElement).value

          timeoutPointer = setTimeout(() => {
            onChange(value)
          }, debounceChangePeriod)
        }}
        class='textarea h-48 font-mono rounded-xl w-full leading-4'
        placeholder={`<div class=''></div>`}
        spellcheck={false}
      ></textarea>
    </div>
  )
}
