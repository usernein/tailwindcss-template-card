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
        onChange={e => onChange((e.target as HTMLInputElement).value)}
        class='bg-white/5 w-full z-10 textarea leading-4 text-base peer focus:outline-none resize-y'
        placeholder={label}
        autoComplete={'off'}
        spellcheck={false}
      />
      <label
        for='floating_outlined'
        class='flex text-base-content peer-hover:text-[hsl(var(--a))] peer-hover:scale-110 peer-focus:scale-110 peer-focus:text-[hsl(var(--a))] duration-300 w-fit opacity-100 peer-placeholder-shown:opacity-0'
      >
        <span className='label-text-alt text-inherit'>{label}</span>
      </label>
    </div>
  )
}
