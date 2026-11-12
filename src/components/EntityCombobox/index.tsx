import { HomeAssistant } from 'custom-card-helpers'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

import { BsChevronBarExpand } from 'react-icons/bs'

/** Cap the rendered list; the state machine can hold thousands of entities. */
const MAX_RESULTS = 100

/**
 * Entity picker for the card's config UI.
 *
 * Implemented directly on Preact hooks rather than Headless UI: the latter is
 * React-only, and its polymorphic `as` typings do not resolve against Preact's
 * JSX, which is what made this component fail to typecheck.
 */
export function EntityCombobox ({
  hass,
  defaultValue,
  onChange
}: {
  hass: HomeAssistant
  defaultValue: string
  onChange: (value: string) => void
}) {
  const [query, setQuery] = useState(defaultValue ?? '')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Only while the list is open: `hass` is replaced on every state change in
  // the house, and re-sorting thousands of ids for a closed list is waste.
  const states = open ? hass.states : null
  const options = useMemo(
    () => (states ? Object.keys(states).sort() : []),
    [states]
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = needle
      ? options.filter(o => o.toLowerCase().includes(needle))
      : options
    return matches.slice(0, MAX_RESULTS)
  }, [options, query])

  // Close when focus or a click lands outside the picker.
  useEffect(() => {
    const onDocumentPointerDown = (e: Event) => {
      const container = containerRef.current
      if (container && !container.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    return () =>
      document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  }, [])

  const select = (entityId: string) => {
    setQuery(entityId)
    setOpen(false)
    onChange(entityId)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) setOpen(true)
      setHighlighted(current => {
        const next = e.key === 'ArrowDown' ? current + 1 : current - 1
        if (filtered.length === 0) return 0
        return (next + filtered.length) % filtered.length
      })
      return
    }
    if (e.key === 'Enter' && open && filtered[highlighted]) {
      e.preventDefault()
      select(filtered[highlighted])
    }
  }

  return (
    <div class='dropdown w-full' ref={containerRef}>
      <div class='relative w-full flex flex-row'>
        <input
          type='text'
          value={query}
          role='combobox'
          aria-expanded={open}
          aria-autocomplete='list'
          class='input pr-12 w-full placeholder:opacity-50 rounded-btn'
          placeholder='Pick an entity'
          spellcheck={false}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          onInput={e => {
            setQuery((e.target as HTMLInputElement).value)
            setHighlighted(0)
            setOpen(true)
          }}
        />
        <button
          type='button'
          tabIndex={-1}
          aria-label='Toggle entity list'
          class='absolute right-0 text-lg opacity-50 w-12 h-full grid place-content-center'
          onClick={() => setOpen(current => !current)}
        >
          <BsChevronBarExpand />
        </button>
      </div>

      {open && filtered.length > 0 && (
        <ul class='outline outline-2 outline-base-content/20 max-h-56 overflow-y-auto mt-2 menu dropdown-content bg-base-100 text-base-content rounded-btn w-full z-10'>
          {filtered.map((option, index) => (
            <li key={option} class='w-full'>
              <div
                class={index === highlighted ? 'active' : undefined}
                onPointerDown={e => {
                  // Fire before the input's blur closes the list.
                  e.preventDefault()
                  select(option)
                }}
                onMouseEnter={() => setHighlighted(index)}
              >
                {option}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
