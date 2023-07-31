import { ConfigState } from '@types'

export function HaCard ({
  htmlContent,
  config
}: {
  htmlContent: string
  config: ConfigState
}) {
  const theme = config.plugins.daisyui.theme ?? 'inherit'
  const attributes = ['inherit', 'auto'].includes(theme)
    ? {}
    : { 'data-theme': theme }
  const unsetBackgroundStyles = { background: 'unset', color: 'unset' }

  return (
    <>
      {/* @ts-expect-error tag <ha-card> is not native */}
      <ha-card>
        <div
          style={
            config.plugins.daisyui.overrideCardBackground
              ? {}
              : unsetBackgroundStyles
          }
          {...attributes}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
        {/* @ts-expect-error <ha-card> is not native */}
      </ha-card>
    </>
  )
}
