import type { ConfigState } from '../types/index.ts'

type Listener = (config: ConfigState) => void

/**
 * The link between one editor element and the Preact tree it mounts.
 *
 * - Home Assistant → tree: the element calls `receive` from `setConfig`. The
 *   latest config is kept and handed to every new subscriber, so it doesn't
 *   matter whether `setConfig` comes before the tree mounts, after it, or
 *   before a remount.
 * - Tree → Home Assistant: each edit calls `onChange`.
 *
 * One per editor element. It replaced events on `document`, which every card
 * on the page fired from its own `setConfig` and every open editor obeyed:
 * with a stack of these cards, the editor for one showed — and on the next
 * edit saved — another card's content.
 */
export class ConfigChannel {
  private latest: ConfigState | null = null
  private readonly listeners = new Set<Listener>()

  /** Reports an edit to Home Assistant. */
  readonly onChange: Listener

  // No parameter property: Node's type stripping, which runs the unit
  // tests, doesn't support them.
  constructor (onChange: Listener) {
    this.onChange = onChange
  }

  receive (config: ConfigState) {
    this.latest = config
    this.listeners.forEach(listener => listener(config))
  }

  subscribe (listener: Listener): () => void {
    this.listeners.add(listener)
    if (this.latest) listener(this.latest)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** Live subscribers; for tests and debugging. */
  get size () {
    return this.listeners.size
  }
}
