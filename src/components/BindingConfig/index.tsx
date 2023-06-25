import { Binding } from '../..'
import { FloatingInput } from '../FloatingInput'

export function BindingConfig ({ binding }: { binding: Binding }) {

  return (
    <div class="flex flex-col gap-2">
      <FloatingInput
        label='Selector'
        value={binding.selector}
        onChange={value => {}}
      />
      <FloatingInput label='Type' value={binding.type} onChange={value => {}} />
      <FloatingInput label='Bind' value={binding.bind} onChange={value => {}} />
      <div className='w-full flex justify-end'>
        <button class="btn btn-accent normal-case btn-sm">Add</button>
      </div>
    </div>
  )
}
