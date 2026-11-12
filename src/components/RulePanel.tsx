import { useEffect, useRef, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import clsx from 'clsx'
import { BiChevronRight, BiPlus, BiSolidTrash } from 'react-icons/bi'

/** What the collapsed row shows, and why it might not run. */
export type RuleSummary = {
  /** Event or binding type, shown as the row's badge. */
  type: string
  /** CSS selector, shown as the row's title. */
  selector: string
  /** Human-readable list of what is still missing; empty means valid. */
  missing: string[]
}

/**
 * Collapsible list of bindings or actions.
 *
 * Replaces the fixed-height, column-flowing grid the panels used to be. That
 * grid gave every row a ~85px track while the row's own contents needed at
 * least 136px, so rows painted over each other (or were clipped), and a fourth
 * rule started a new column that could only be reached by scrolling sideways.
 *
 * Rows are a plain vertical stack instead: full width, expanded independently,
 * and collapsed by default so no code editor is mounted for a rule nobody is
 * editing.
 */
export function RulePanel<T> ({
  name,
  title,
  noun,
  hint,
  emptyHint,
  addLabel,
  rules,
  blank,
  summarise,
  renderBody,
  onUpdate,
  suggestions = []
}: {
  /** Stable hook for tests and CSS: `data-panel="actions"`. */
  name: string
  title: string
  /** Singular, lower case — used in the "won't run" explanation. */
  noun: string
  hint: string
  emptyHint: string
  addLabel: string
  rules: T[]
  blank: () => T
  summarise: (rule: T) => RuleSummary
  renderBody: (rule: T, onChange: (value: T) => void) => ComponentChildren
  onUpdate: (rules: T[]) => void
  /** One-click rules derived from the card's markup. */
  suggestions?: { key: string; label: string; detail?: string; rule: T }[]
}) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number[]>([])

  // Open the panel by itself the first time a card arrives with something to
  // show — existing rules, or markup that has none yet and should. A card whose
  // buttons do nothing is precisely the case worth not hiding behind a click.
  // After that the panel is the user's to open and close.
  const seeded = useRef(false)
  const notable = rules.length + suggestions.length
  useEffect(() => {
    if (seeded.current || notable === 0) return
    seeded.current = true
    setOpen(true)
  }, [notable])

  const summaries = rules.map(summarise)
  const incomplete = summaries.filter(s => s.missing.length > 0).length

  const change = (index: number, value: T) =>
    onUpdate(rules.map((rule, i) => (i === index ? value : rule)))

  const remove = (index: number) => {
    onUpdate(rules.filter((_, i) => i !== index))
    // Indices above the removed row shift down with it.
    setExpanded(open =>
      open.filter(i => i !== index).map(i => (i > index ? i - 1 : i))
    )
  }

  const append = (rule: T) => {
    onUpdate([...rules, rule])
    setExpanded(open => [...open, rules.length])
  }

  const add = () => append(blank())

  const toggle = (index: number) =>
    setExpanded(open =>
      open.includes(index) ? open.filter(i => i !== index) : [...open, index]
    )

  return (
    <section
      data-panel={name}
      class='overflow-hidden rounded-box bg-base-200 text-base-content'
    >
      <button
        type='button'
        aria-expanded={open}
        class='flex w-full items-center gap-2 px-3 py-3 text-left'
        onClick={() => setOpen(value => !value)}
      >
        <span
          class={clsx(
            'inline-flex shrink-0 transition-transform',
            open && 'rotate-90'
          )}
        >
          <BiChevronRight />
        </span>
        <span class='font-medium'>{title}</span>
        {rules.length > 0 && (
          <span class='badge badge-sm badge-neutral'>{rules.length}</span>
        )}
        {incomplete > 0 && (
          <span class='badge badge-sm badge-warning'>
            {incomplete} incomplete
          </span>
        )}
      </button>

      {open && (
        <div class='flex flex-col gap-2 px-3 pb-3'>
          <p class='text-xs leading-snug opacity-60'>{hint}</p>

          {rules.length === 0 ? (
            <p class='rounded-box border border-dashed border-base-content/20 px-3 py-6 text-center text-xs leading-snug opacity-60'>
              {emptyHint}
            </p>
          ) : (
            rules.map((rule, index) => {
              const summary = summaries[index]
              const isOpen = expanded.includes(index)
              const isInvalid = summary.missing.length > 0

              return (
                <div
                  key={index}
                  data-rule={name}
                  data-incomplete={isInvalid ? 'true' : 'false'}
                  class={clsx(
                    'rounded-box bg-base-100 ring-1',
                    isInvalid ? 'ring-warning/50' : 'ring-base-content/10'
                  )}
                >
                  <div class='flex items-center gap-1 p-1'>
                    <button
                      type='button'
                      aria-expanded={isOpen}
                      class='btn btn-ghost btn-sm min-w-0 grow justify-start gap-2 px-2 font-normal'
                      onClick={() => toggle(index)}
                    >
                      <span
                        class={clsx(
                          'inline-flex shrink-0 transition-transform',
                          isOpen && 'rotate-90'
                        )}
                      >
                        <BiChevronRight />
                      </span>
                      <span class='badge badge-sm shrink-0 font-mono'>
                        {summary.type || 'unset'}
                      </span>
                      <span class='truncate font-mono text-xs opacity-70'>
                        {summary.selector || 'no selector'}
                      </span>
                    </button>

                    {isInvalid && (
                      <span
                        class='badge badge-sm badge-warning shrink-0'
                        title={summary.missing.join(', ')}
                      >
                        won&rsquo;t run
                      </span>
                    )}

                    {/*
                      Always visible, not revealed on hover: the config UI is
                      used on a touchscreen where there is no hover state.
                    */}
                    <button
                      type='button'
                      aria-label={`Delete ${noun} ${index + 1}`}
                      class='btn btn-ghost btn-sm btn-square shrink-0 text-base-content/50 hover:text-error'
                      onClick={() => remove(index)}
                    >
                      <BiSolidTrash />
                    </button>
                  </div>

                  {isOpen && (
                    <div class='flex flex-col gap-3 border-t border-base-content/10 p-3'>
                      {renderBody(rule, value => change(index, value))}
                      {isInvalid && (
                        <p class='text-xs text-warning'>
                          This {noun} is ignored until you set{' '}
                          {summary.missing.join(' and ')}.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}

          {suggestions.length > 0 && (
            <div class='flex flex-col gap-1.5 rounded-box border border-base-content/10 p-2'>
              <p class='text-xs opacity-60'>
                Found in your markup, with no {noun} yet:
              </p>
              <div class='flex flex-wrap gap-1.5'>
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion.key}
                    type='button'
                    class='btn btn-xs gap-1 font-mono normal-case'
                    title={
                      suggestion.detail
                        ? `Adds a ${noun} for ${suggestion.label} (${suggestion.detail})`
                        : `Adds a ${noun} for ${suggestion.label}`
                    }
                    onClick={() => append(suggestion.rule)}
                  >
                    <BiPlus />
                    {suggestion.label}
                    {suggestion.detail && (
                      <span class='font-sans opacity-60'>
                        {suggestion.detail}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type='button'
            class='btn btn-sm btn-block btn-outline gap-1'
            onClick={add}
          >
            <BiPlus />
            {addLabel}
          </button>
        </div>
      )}
    </section>
  )
}
