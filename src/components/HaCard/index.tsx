export function HaCard ({ htmlContent }: { htmlContent: string }) {
  return (
    <>
      {/* @ts-ignore */}
      <ha-card>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        {/* @ts-ignore */}
      </ha-card>
    </>
  )
}
