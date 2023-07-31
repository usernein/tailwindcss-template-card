import { ConfigContext } from '@store/ConfigContext'
import clsx from 'clsx'
import { useMemo, PropsWithChildren, useContext } from 'preact/compat'

export function WithDaisyUitheme ({
  className,
  children
}: PropsWithChildren<{ className?: string }>) {
  const { config } = useContext(ConfigContext)

  const daisyUiTheme = useMemo(
    () => config.plugins.daisyui.theme ?? 'inherit',
    [config.plugins.daisyui.theme]
  )

  // split string by " - "
  const [scheme, theme] = daisyUiTheme.split(' - ')
  console.log({ scheme, theme })

  const attributes = ['inherit', 'auto'].includes(daisyUiTheme)
    ? {}
    : { 'data-theme': theme }
  return (
    <div {...attributes} className={clsx(scheme, className)}>
      {children}
    </div>
  )
}
