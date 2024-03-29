import clsx from 'clsx'

export function FloatingInput ({
  label,
  className,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
  mode?: string
}) {
  return (
    <div class={clsx('relative p-1 w-[50%] flex flex-col-reverse', className)}>
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
      <input
        className='input'
        defaultValue={value}
        onChange={e => onChange((e.target as HTMLInputElement).value)}
        spellCheck={false}
      />
      <label
        for='floating_outlined'
        class='flex text-base-content peer-hover:text-[hsl(var(--a))] peer-hover:scale-110 peer-focus:scale-110 peer-focus:text-[hsl(var(--a))] duration-300 w-fit opacity-100 peer-placeholder-shown:hidden'
      >
        <span className='label-text-alt text-inherit'>{label}</span>
      </label>
      <label
        for='floating_outlined'
        class='peer-hover:scale-110 peer-focus:scale-110 duration-300 w-fit opacity-100 text-error hidden peer-placeholder-shown:block'
      >
        <span className='label-text-alt text-inherit'>Required</span>
      </label>
    </div>
  )
}
