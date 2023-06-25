import { ConfigState } from '../../store/ConfigReducer'

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

  return (
    <>
      {/* @ts-ignore */}
      <ha-card {...attributes}>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        {/* @ts-ignore */}
      </ha-card>
    </>
  )
}
