import { ConfigState } from '@types'

export function HaCard ({
  htmlContent,
  config,
  onEvent
}: {
  htmlContent: string
  config: ConfigState
  onEvent: (e: Event) => void
}) {
  const theme = config.plugins.daisyui.theme ?? 'inherit - inherit'
  const [scheme, themeName] = theme.split(' - ')
  const attributes = ['inherit', 'auto', 'inherit - inherit'].includes(theme)
    ? {}
    : { 'data-theme': themeName }
  const unsetBackgroundStyles = { background: 'unset', color: 'unset' }

  return (
    <>
      {/* @ts-expect-error tag <ha-card> is not native */}
      <ha-card>
        <div
          className={scheme}
          style={
            config.plugins.daisyui.overrideCardBackground
              ? {}
              : unsetBackgroundStyles
          }
          {...attributes}
          dangerouslySetInnerHTML={{ __html: htmlContent }}

          onClickCapture={onEvent}
          onDblClickCapture={onEvent}
          onChangeCapture={onEvent}
        />
        {/* @ts-expect-error <ha-card> is not native */}
      </ha-card>
    </>
  )
}
