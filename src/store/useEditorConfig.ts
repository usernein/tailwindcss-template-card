import { useCallback, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { ConfigState } from '@types'
import { ConfigChannel } from './ConfigChannel'
import { initialConfigState } from './configDefaults'

/**
 * The editor's working copy of the config.
 *
 * `updateConfig` merges a partial change into it and, unless told otherwise,
 * reports the result to Home Assistant through the channel. Configs Home
 * Assistant sets arrive the same way with reporting off, so they never echo.
 */
export const useEditorConfig = (channel: ConfigChannel) => {
  const [config, setConfig] = useState(initialConfigState)
  // Ahead of the next render, so two updates in one tick both land.
  const latest = useRef(config)

  const updateConfig = useCallback(
    (payload: Partial<ConfigState>, dispatch_event: boolean = true) => {
      const next = { ...latest.current, ...payload } as ConfigState
      latest.current = next
      setConfig(next)
      if (dispatch_event) channel.onChange(next)
    },
    [channel]
  )

  /*
   * A layout effect, not a plain one: Preact runs it before `render()`
   * returns. The channel replays its latest config on subscribe anyway, so
   * a config set before the first frame is never dropped — which once left
   * the editor showing the demo content, ready to be saved over the card's.
   */
  useLayoutEffect(
    () => channel.subscribe(config => updateConfig(config, false)),
    [channel, updateConfig]
  )

  return { config, updateConfig }
}
