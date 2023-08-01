import { PropsWithChildren } from 'preact/compat'
import { ConfigContext } from './ConfigContext'
import { useConfigReducer } from './ConfigReducer'

export const ConfigProvider = ({ children }: PropsWithChildren) => {
  const values = useConfigReducer()

  return (
    <ConfigContext.Provider value={values}>{children}</ConfigContext.Provider>
  )
}
