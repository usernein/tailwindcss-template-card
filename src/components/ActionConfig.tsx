import { Action } from '@types'
import { CodeEditor } from '@components/CodeEditor'
import { RuleField } from '@components/RuleField'
import { RuleSummary } from '@components/RulePanel'
import { SelectorSuggestion, covers } from '@utils/contentScan'

/**
 * The events the card actually dispatches. `hold` is synthesised from pointer
 * events by `HaCard`; the rest are forwarded from the shadow root. Anything
 * outside this list never fires, so the list is the list.
 */
const EVENTS = [
  { value: 'click', label: 'click — tap or click' },
  { value: 'hold', label: 'hold — press and hold' },
  { value: 'dblclick', label: 'dblclick — double click' },
  { value: 'change', label: 'change — input committed' },
  { value: 'input', label: 'input — while typing' },
  { value: 'contextmenu', label: 'contextmenu — right click' }
]

export const blankAction = (): Action => ({
  type: 'click',
  selector: '',
  call: ''
})

/**
 * The card skips any action missing a selector, an event or a call, without
 * saying so. Reporting that here is the difference between a button that
 * visibly does nothing and one you can see is unfinished.
 */
export const summariseAction = (action: Action): RuleSummary => {
  const missing: string[] = []
  if (!action.selector?.trim()) missing.push('a selector')
  if (!action.type?.trim()) missing.push('an event')
  if (!action.call?.trim()) missing.push('some code')
  return { type: action.type, selector: action.selector, missing }
}

export function ActionConfig ({
  action,
  onChange,
  selectorListId,
  selectors
}: {
  action: Action
  onChange: (value: Action) => void
  selectorListId: string
  selectors: SelectorSuggestion[]
}) {
  const matched = selectors.find(s => covers(action.selector, s))
  const entities = matched?.entities ?? []

  return (
    <>
      <div class='grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]'>
        <RuleField
          label='Selector'
          hint={
            matched
              ? `Matches ${matched.count} element${matched.count === 1 ? '' : 's'} in your markup${entities.length ? ` — ${entities.join(', ')}` : ''}.`
              : 'CSS selector. Fires when the event lands on a match, or on anything inside one.'
          }
          invalid={!action.selector?.trim()}
        >
          <input
            type='text'
            list={selectorListId}
            class='input input-sm w-full font-mono'
            placeholder='[data-toggle]'
            spellcheck={false}
            autocomplete='off'
            value={action.selector}
            onInput={e =>
              onChange({
                ...action,
                selector: (e.target as HTMLInputElement).value
              })
            }
          />
        </RuleField>

        <RuleField label='Event' invalid={!action.type?.trim()}>
          {/*
            Controlled, with a real empty option. As an uncontrolled select it
            showed "click" for an action whose stored type was empty — so the
            action looked configured and was silently skipped at runtime.
          */}
          <select
            class='select select-sm w-full'
            value={action.type ?? ''}
            onChange={e =>
              onChange({
                ...action,
                type: (e.target as HTMLSelectElement).value
              })
            }
          >
            <option value=''>Choose an event…</option>
            {EVENTS.map(event => (
              <option key={event.value} value={event.value}>
                {event.label}
              </option>
            ))}
          </select>
        </RuleField>
      </div>

      <RuleField
        label='Code'
        hint='JavaScript. `this` is the matched element; hass, config, entity, moreInfo(entity_id) and event are in scope.'
        invalid={!action.call?.trim()}
      >
        <CodeEditor
          defaultValue={action.call}
          onChange={call => onChange({ ...action, call })}
          mode='javascript'
          html={false}
          size='compact'
        />
      </RuleField>
    </>
  )
}
