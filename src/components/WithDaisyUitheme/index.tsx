import { ConfigContext } from '@store/ConfigContext'
import { HassContext, hassDarkMode } from '@store/HassContext'
import { resolveTheme } from '@components/HaCard'
import clsx from 'clsx'
import { PropsWithChildren, useContext } from 'preact/compat'

/** Themes the editor the same way the card itself is themed. */
export function WithDaisyUitheme ({
  className,
  children
}: PropsWithChildren<{ className?: string }>) {
  const { config } = useContext(ConfigContext)
  const hass = useContext(HassContext)

  const { scheme, attributes } = resolveTheme(
    config.plugins.daisyui.theme,
    hassDarkMode(hass)
  )

  return (
    <div {...attributes} className={clsx(scheme, className)}>
      {children}
    </div>
  )
}
