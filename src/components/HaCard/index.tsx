import { ConfigState } from '../../store/ConfigReducer'

export function HaCard ({
  htmlContent,
  config
}: {
  htmlContent: string
  config: Partial<ConfigState>
}) {
  return (
    <>
      {/* @ts-ignore */}
      <ha-card data-theme={config.plugins?.daisyui?.theme || "auto"}>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        {/* @ts-ignore */}
      </ha-card>
    </>
  )
}
