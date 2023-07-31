import { ConfigContext } from '@store/ConfigContext'
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
  const attributes = ['inherit', 'auto'].includes(daisyUiTheme)
    ? {}
    : { 'data-theme': daisyUiTheme }
  return (
    <div {...attributes} className={className}>
      {children}
    </div>
  )
}
