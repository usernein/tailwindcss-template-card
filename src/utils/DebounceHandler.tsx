export class DebounceHandler {
  debounceChangePeriod: number
  timeoutPointer: NodeJS.Timeout | null = null

  constructor (debounceChangePeriod: number) {
    this.debounceChangePeriod = debounceChangePeriod
  }

  run (fn: () => void) {
    if (this.timeoutPointer) {
      clearTimeout(this.timeoutPointer)
    }

    this.timeoutPointer = setTimeout(fn, this.debounceChangePeriod)
  }
}

export const useDebouncer = (debounceChangePeriod: number) => {
  const debouncer = new DebounceHandler(debounceChangePeriod)

  return (fn: () => void) => {
    debouncer.run(fn)
  }
}
