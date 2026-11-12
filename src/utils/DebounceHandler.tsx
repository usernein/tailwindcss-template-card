import { useCallback, useEffect, useRef } from 'preact/hooks'

export class DebounceHandler {
  debounceChangePeriod: number
  timeoutPointer: ReturnType<typeof setTimeout> | null = null

  constructor (debounceChangePeriod: number) {
    this.debounceChangePeriod = debounceChangePeriod
  }

  run (fn: () => void) {
    this.cancel()
    this.timeoutPointer = setTimeout(fn, this.debounceChangePeriod)
  }

  cancel () {
    if (this.timeoutPointer) {
      clearTimeout(this.timeoutPointer)
      this.timeoutPointer = null
    }
  }
}

/**
 * A debouncer that survives re-renders.
 *
 * Building a new handler on every render meant `timeoutPointer` was always
 * null, so the pending timer was never cancelled and nothing was debounced.
 */
export const useDebouncer = (debounceChangePeriod: number) => {
  const debouncer = useRef<DebounceHandler | null>(null)

  if (!debouncer.current) {
    debouncer.current = new DebounceHandler(debounceChangePeriod)
  }
  debouncer.current.debounceChangePeriod = debounceChangePeriod

  useEffect(() => () => debouncer.current?.cancel(), [])

  return useCallback((fn: () => void) => debouncer.current?.run(fn), [])
}
