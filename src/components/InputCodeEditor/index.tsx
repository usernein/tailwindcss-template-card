import { CodeEditor } from '@components/CodeEditor'
import clsx from 'clsx'

export function InputCodeEditor ({
  label,
  value,
  onChange,
  className,
  mode = 'html',
  emulateTextarea = false
}: {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
  mode?: string
  emulateTextarea?: boolean
}) {
  return (
    <div class={clsx('relative p-1 w-full flex flex-col-reverse', emulateTextarea && 'w-full h-full', className)}>
      {/* <input
        type='text'
        name='floating_outlined'
        value={value}
        onInput={e => onChange((e.target as HTMLInputElement).value)}
        class={clsx(
          'bg-white/5 text-sm z-10 w-full input h-10 peer focus:outline-none ring-0 placeholder:text-[hsl(var(--er))] placeholder-shown:ring-1 placeholder-shown:ring-[hsl(var(--er))]',
          isMinimized ? 'text-base-content/50' : ''
        )}
        placeholder={label}
        autoComplete={'off'}
        spellcheck={false}
      /> */}
      <CodeEditor
        defaultValue={value}
        onChange={onChange}
        additionalOptions={{ showGutter: false, highlightActiveLine: false }}
        className='w-full h-full'
        mode={mode}
      />
      <label
        for='floating_outlined'
        class='select-none flex text-base-content peer-hover:text-[hsl(var(--a))] peer-hover:scale-110 peer-focus:scale-110 peer-focus:text-[hsl(var(--a))] duration-300 w-fit opacity-100 peer-placeholder-shown:hidden'
      >
        <span className='label-text-alt text-inherit'>{label}</span>
      </label>
      <label
        for='floating_outlined'
        class='select-none peer-hover:scale-110 peer-focus:scale-110 duration-300 w-fit opacity-100 text-error hidden peer-placeholder-shown:block'
      >
        <span className='label-text-alt text-inherit'>Required</span>
      </label>
    </div>
  )
}
