export function CodemirrorEditor ({
  defaultValue,
  onChange
}: {
  defaultValue: string
  onChange: (defaultValue: string) => void
}) {
  const haCodeEditor = document.createElement(
    'ha-code-editor'
  ) as HTMLElement & { defaultValue: string }
  haCodeEditor.defaultValue = defaultValue
  haCodeEditor.addEventListener('value-changed', e => {
    const value = (e.target as HTMLInputElement).value
    onChange(value)
  })

  return (
    <div
      ref={ref => {
        if (ref) {
          ref.innerHTML = ''
          ref.appendChild(haCodeEditor)
        }
      }}
    ></div>
  )
}
