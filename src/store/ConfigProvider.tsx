import { PropsWithChildren } from 'preact/compat'
import { ConfigContext } from './ConfigContext'
import { ConfigChannel } from './ConfigChannel'
import { useEditorConfig } from './useEditorConfig'

export const ConfigProvider = ({
  channel,
  children
}: PropsWithChildren<{ channel: ConfigChannel }>) => {
  const values = useEditorConfig(channel)

  return (
    <ConfigContext.Provider value={values}>{children}</ConfigContext.Provider>
  )
}
