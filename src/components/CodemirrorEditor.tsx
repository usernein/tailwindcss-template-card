export function CodemirrorEditor ({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  const haCodeEditor = document.createElement(
    'ha-code-editor'
  ) as HTMLElement & { value: string }
  haCodeEditor.value = value
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
