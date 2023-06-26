export function FloatingTextarea ({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div class='w-full flex flex-col-reverse p-1'>
      <textarea
        name='floating_outlined'
        value={value}
        onInput={e => onChange((e.target as HTMLInputElement).value)}
        class='bg-white/5 text-sm w-full z-10 textarea leading-4 peer focus:outline-none resize-y ring-0 placeholder:text-[hsl(var(--er))] placeholder-shown:ring-1 placeholder-shown:ring-[hsl(var(--er))]'
        placeholder={label}
        autoComplete={'off'}
        spellcheck={false}
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
