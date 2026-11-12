import { Binding } from '@types'
import { CodeEditor } from '@components/CodeEditor'
import { RuleField } from '@components/RuleField'
import { RuleSummary } from '@components/RulePanel'
import { SelectorSuggestion, covers } from '@utils/contentScan'

/**
 * Named types the card handles specially. Any other value is set as an
 * attribute of that name, so this is a suggestion list rather than a closed
 * set — hence a datalist rather than a select.
 */
const TYPES = ['text', 'html', 'class', 'value', 'checked']

export const TYPE_LIST_ID = 'ttc-binding-types'

/**
 * Rendered once per panel rather than once per row: several rows share this
 * list, and duplicate element ids in one tree are only ever resolved to the
 * first anyway.
 */
export function BindingTypeList () {
  return (
    <datalist id={TYPE_LIST_ID}>
      {TYPES.map(type => (
        <option key={type} value={type} />
      ))}
    </datalist>
  )
}

export const blankBinding = (): Binding => ({
  type: 'text',
  selector: '',
  bind: ''
})

export const summariseBinding = (binding: Binding): RuleSummary => {
  const missing: string[] = []
  if (!binding.selector?.trim()) missing.push('a selector')
  if (!binding.type?.trim()) missing.push('a type')
  if (!binding.bind?.trim()) missing.push('some code')
  return { type: binding.type, selector: binding.selector, missing }
}

export function BindingConfig ({
  binding,
  onChange,
  selectorListId,
  selectors
}: {
  binding: Binding
  onChange: (value: Binding) => void
  selectorListId: string
  selectors: SelectorSuggestion[]
}) {
  const matched = selectors.find(s => covers(binding.selector, s))

  return (
    <>
      <div class='grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]'>
        <RuleField
          label='Selector'
          hint={
            matched
              ? `Matches ${matched.count} element${matched.count === 1 ? '' : 's'} in your markup.`
              : 'CSS selector. Every match is updated each time the card re-renders.'
          }
          invalid={!binding.selector?.trim()}
        >
          <input
            type='text'
            list={selectorListId}
            class='input input-sm w-full font-mono'
            placeholder='.temperature'
            spellcheck={false}
            autocomplete='off'
            value={binding.selector}
            onInput={e =>
              onChange({
                ...binding,
                selector: (e.target as HTMLInputElement).value
              })
            }
          />
        </RuleField>

        <RuleField
          label='Type'
          hint='Or any attribute name, e.g. src, title, aria-label.'
          invalid={!binding.type?.trim()}
        >
          <input
            type='text'
            list={TYPE_LIST_ID}
            class='input input-sm w-full font-mono'
            placeholder='text'
            spellcheck={false}
            autocomplete='off'
            value={binding.type}
            onInput={e =>
              onChange({
                ...binding,
                type: (e.target as HTMLInputElement).value
              })
            }
          />
        </RuleField>
      </div>

      <RuleField
        label='Code'
        hint='JavaScript returning the value to apply. `this` is the matched element; hass, config, entity, state and attr are in scope.'
        invalid={!binding.bind?.trim()}
      >
        <CodeEditor
          defaultValue={binding.bind}
          onChange={bind => onChange({ ...binding, bind })}
          mode='javascript'
          html={false}
          size='compact'
        />
      </RuleField>
    </>
  )
}
