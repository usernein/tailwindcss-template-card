import { useEffect, useState } from 'preact/hooks'

/**
 * Whether a Home Assistant custom element is registered yet.
 *
 * The frontend defines its elements lazily, so a component that wants one
 * (`ha-code-editor`, `ha-entity-picker`) renders a fallback until it appears
 * and upgrades in place once it does. After `timeoutMs` it stops waiting and
 * the fallback stays.
 */
export const useElementDefined = (name: string, timeoutMs = 4000) => {
  const [defined, setDefined] = useState(() => Boolean(customElements.get(name)))

  useEffect(() => {
    if (defined) return

    let cancelled = false
    const timeout = window.setTimeout(() => {
      cancelled = true
    }, timeoutMs)

    customElements.whenDefined(name).then(() => {
      window.clearTimeout(timeout)
      if (!cancelled) setDefined(true)
    })

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [defined, name, timeoutMs])

  return defined
}
