export function TextareaEditor ({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className='p-2'>
      <textarea
        value={value}
        onInput={e => {
          const value = (e.target as HTMLInputElement).value
          onChange(value)
        }}
        class='textarea h-48 font-mono rounded-xl w-full leading-4'
        placeholder={`<div class=''></div>`}
        spellcheck={false}
      ></textarea>
    </div>
  )
}
