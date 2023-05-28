import parse from 'html-react-parser'

export function HaCard ({ htmlContent }: { htmlContent: string }) {
  let parsedHtml = parse(htmlContent)

  return (
    <>
      {/* @ts-ignore */}
      <ha-card>
        {parsedHtml}
        {/* @ts-ignore */}
      </ha-card>
    </>
  )
}
