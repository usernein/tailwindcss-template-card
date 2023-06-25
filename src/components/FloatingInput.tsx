export function FloatingInput ({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {

  return (
    <div class='relative w-full '>
      <input
        type='text'
        name='floating_outlined'
        value={value}
        onChange={e => onChange((e.target as HTMLInputElement).value)}
        class='bg-base-100 w-full z-10 input h-10 peer focus:outline-none'
        placeholder=' '
        autoComplete={'off'}
        spellcheck={false}
      />
      <label
        for='floating_outlined'
        class='peer-focus:bg-base-100 text-base-content/30 peer-hover:text-[hsl(var(--a))] peer-focus:text-[hsl(var(--a))] scale-90 absolute top-0 peer-focus:top-0 left-2 transform origin-[0] duration-300 -translate-y-1/2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100'
      >
        {label}
      </label>
    </div>
  )
}
