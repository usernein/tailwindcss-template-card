// @ts-nocheck
export function CodemirrorEditor ({
  value,
  onChange,
  debounceChangePeriod
}: {
  value: string
  onChange: (value: string) => void
  debounceChangePeriod: number
}) {
  let timeoutPointer: NodeJS.Timeout

  const haCodeEditor = document.createElement('ha-code-editor')
  // @t
  haCodeEditor.value = value
  haCodeEditor.addEventListener('value-changed', e => {
    if (timeoutPointer) {
      clearTimeout(timeoutPointer)
    }
    const value = (e.target as HTMLInputElement).value

    timeoutPointer = setTimeout(() => {
      onChange(value)
    }, debounceChangePeriod)
  })

  return (
    <div
      ref={ref => {
        if (ref) {
          ref.innerHTML = '';
          ref.appendChild(haCodeEditor)
        }
      }}
    ></div>
    // <textarea
    //   value={value}
    //   onInput={e => {
    //     if (timeoutPointer) {
    //       clearTimeout(timeoutPointer)
    //     }
    //     const value = (e.target as HTMLInputElement).value

    //     timeoutPointer = setTimeout(() => {
    //       onChange(value)
    //     }, debounceChangePeriod)
    //   }}
    //   class='textarea textarea-accent h-48 font-mono rounded-xl w-full leading-4'
    //   placeholder={`<div class=''></div>`}
    //   spellcheck={false}
    // ></textarea>
  )
}
