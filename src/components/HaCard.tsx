import { ConfigState } from '@types'
import type { RefObject } from 'preact'
import { useCallback, useEffect, useRef } from 'preact/hooks'
import { FOLLOW_HA_THEME } from '@store/configDefaults'

/** Native events forwarded to the card's action handler. */
export const FORWARDED_EVENTS = [
  'click',
  'dblclick',
  'change',
  'input',
  'contextmenu'
] as const

/**
 * Neutralises `ha-card`'s own surface through the custom properties it reads,
 * which is the supported way to restyle it.
 *
 * `overrideCardBackground` only unsets the inner wrapper's background, leaving
 * Home Assistant's card still painted underneath — so content that supplies its
 * own surface sat on top of a stray panel. card-mod cannot help here either:
 * it injects a <style> element into the card's shadow root, and this card
 * clears that root on every render.
 */
const BARE_CARD_STYLE = [
  '--ha-card-background: transparent',
  '--ha-card-box-shadow: none',
  '--ha-card-border-width: 0px',
  '--ha-card-border-radius: 0px'
].join(';')

/**
 * Elements that already turn Enter/Space into a click, or need those keys for
 * typing. Keyboard activation is only synthesised for everything else.
 */
const NATIVE_KEYBOARD =
  'button, a[href], input, select, textarea, summary, [contenteditable=""], [contenteditable="true"]'

/** Opted-in custom controls: `<div role="button" tabindex="0">`. */
const KEYBOARD_ACTIVATABLE = '[role="button"], [tabindex]'

/**
 * `data-theme` and scheme class for the content, from the configured theme.
 *
 * `auto` follows Home Assistant's own light/dark mode. It used to default to a
 * fixed `dark - dark`, so daisyUI components painted dark on a light dashboard.
 */
export const resolveTheme = (theme: string | undefined, darkMode: boolean) => {
  const value = theme ?? FOLLOW_HA_THEME
  if (value === FOLLOW_HA_THEME) {
    const scheme = darkMode ? 'dark' : 'light'
    return { scheme, attributes: { 'data-theme': scheme } }
  }
  if (value === 'inherit' || value === 'inherit - inherit') {
    return { scheme: 'inherit', attributes: {} }
  }
  const [scheme, themeName] = value.split(' - ')
  return { scheme, attributes: { 'data-theme': themeName ?? scheme } }
}

/** How long a pointer must be held before a `hold` action fires. */
const HOLD_DURATION_MS = 500
/** Pointer travel beyond this cancels a hold (it's a scroll, not a press). */
const HOLD_MOVE_TOLERANCE_PX = 10

/**
 * Press-and-hold, synthesised from pointer events the way Home Assistant's
 * own cards offer it:
 *
 *   idle ──pointerdown──▶ pressing ──500ms, fires `hold`──▶ held
 *     ▲                     │ moved, released, cancelled      │
 *     ├─────────────────────┘                                 │
 *     └── its click (swallowed), cancel, key, new press ──────┘
 *
 * `held` exists only to swallow the click its own release produces, so a
 * hold never also runs the element's click action.
 */
type HoldPhase =
  | { name: 'idle' }
  | { name: 'pressing'; timer: number; x: number; y: number }
  | { name: 'held' }

/**
 * The card's persistent shell: `ha-card` and the content container.
 *
 * The content itself is not rendered here. The card morphs it into
 * `contentRef` so that an update changes only what changed — a full re-render
 * dropped focus, reset a slider mid-drag and made CSS transitions impossible.
 */
export function HaCard ({
  config,
  darkMode,
  error,
  contentRef,
  onEvent
}: {
  config: ConfigState
  darkMode: boolean
  /** Template error to show above the last good render. */
  error: string | null
  contentRef: RefObject<HTMLDivElement>
  onEvent: (e: Event) => void
}) {
  const { scheme, attributes } = resolveTheme(
    config.plugins.daisyui.theme,
    darkMode
  )
  const unsetBackgroundStyles = { background: 'unset', color: 'unset' }

  // Keep the latest handler without re-binding listeners on every render.
  const handlerRef = useRef(onEvent)
  handlerRef.current = onEvent

  const dispatch = useCallback((e: Event) => handlerRef.current(e), [])

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    let hold: HoldPhase = { name: 'idle' }

    const reset = () => {
      if (hold.name === 'pressing') window.clearTimeout(hold.timer)
      hold = { name: 'idle' }
    }

    const onPointerDown = (e: PointerEvent) => {
      reset()
      // A right or middle button isn't a press of the control.
      if (e.button > 0) return
      const target = e.target
      if (!(target instanceof HTMLElement)) return

      const timer = window.setTimeout(() => {
        hold = { name: 'held' }
        target.dispatchEvent(
          new CustomEvent('hold', { bubbles: true, composed: true })
        )
      }, HOLD_DURATION_MS)
      hold = { name: 'pressing', timer, x: e.clientX, y: e.clientY }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (hold.name !== 'pressing') return
      const travelled = Math.abs(e.clientX - hold.x) + Math.abs(e.clientY - hold.y)
      if (travelled > HOLD_MOVE_TOLERANCE_PX) reset()
    }

    // A completed hold waits for the click its release produces.
    const onPointerUp = () => {
      if (hold.name === 'pressing') reset()
    }

    const onClickCapture = (e: MouseEvent) => {
      if (hold.name !== 'held') return
      hold = { name: 'idle' }
      // Only the click a pointer release produces belongs to the hold;
      // keyboard and scripted clicks have `detail` 0.
      if (e.detail === 0) return
      e.stopImmediatePropagation()
      e.preventDefault()
    }

    // Custom controls opted in with `role="button"` or `tabindex` answer
    // Enter and Space the way a native button would.
    const onKeyDown = (e: KeyboardEvent) => {
      reset()
      if (e.key !== 'Enter' && e.key !== ' ') return
      if (e.defaultPrevented || e.repeat) return
      const target = e.target
      if (!(target instanceof HTMLElement)) return
      if (target.matches(NATIVE_KEYBOARD)) return
      if (!target.matches(KEYBOARD_ACTIVATABLE)) return
      e.preventDefault()
      target.click()
    }

    // First, so a held press can cancel its click before `dispatch` sees it:
    // listeners on one element run in the order they were added.
    container.addEventListener('click', onClickCapture, true)
    FORWARDED_EVENTS.forEach((type) =>
      container.addEventListener(type, dispatch, true)
    )
    container.addEventListener('keydown', onKeyDown)
    container.addEventListener('hold', dispatch, true)
    container.addEventListener('pointerdown', onPointerDown, true)
    container.addEventListener('pointermove', onPointerMove, true)
    container.addEventListener('pointerup', onPointerUp, true)
    // The browser took the pointer over (a scroll, its own menu): no click
    // follows, so there's nothing left to suppress.
    container.addEventListener('pointercancel', reset, true)

    return () => {
      reset()
      container.removeEventListener('click', onClickCapture, true)
      FORWARDED_EVENTS.forEach((type) =>
        container.removeEventListener(type, dispatch, true)
      )
      container.removeEventListener('keydown', onKeyDown)
      container.removeEventListener('hold', dispatch, true)
      container.removeEventListener('pointerdown', onPointerDown, true)
      container.removeEventListener('pointermove', onPointerMove, true)
      container.removeEventListener('pointerup', onPointerUp, true)
      container.removeEventListener('pointercancel', reset, true)
    }
  }, [dispatch, contentRef])

  return (
    <>
      {/* @ts-expect-error tag <ha-card> is not native */}
      <ha-card style={config.bare ? BARE_CARD_STYLE : undefined}>
        {error && (
          // @ts-expect-error <ha-alert> is not native
          <ha-alert key='error' alert-type='error' style='display: block'>
            {error}
            {/* @ts-expect-error <ha-alert> is not native */}
          </ha-alert>
        )}
        <div
          key='content'
          ref={contentRef}
          className={scheme}
          style={
            config.plugins.daisyui.overrideCardBackground
              ? {}
              : unsetBackgroundStyles
          }
          {...attributes}
        />
        {/* @ts-expect-error <ha-card> is not native */}
      </ha-card>
    </>
  )
}
