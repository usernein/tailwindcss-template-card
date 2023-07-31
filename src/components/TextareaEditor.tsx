import clsx from "clsx"

export function TextareaEditor ({
  defaultValue,
  onChange,
  className
}: {
  defaultValue: string
  onChange: (defaultValue: string) => void
  className?: string
}) {
  return (
    <div className={clsx('h-full', className)}>
      <textarea
        defaultValue={defaultValue}
        onInput={e => {
          const value = (e.target as HTMLInputElement).value
          onChange(value)
        }}
        class='textarea h-full min-h-0 m-0 p-2 font-mono rounded-xl w-full leading-4'
        spellcheck={false}
      ></textarea>
    </div>
  )
}
