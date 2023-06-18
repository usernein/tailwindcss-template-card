import { ConfigContext } from './ConfigContext'
import { useConfigReducer } from './ConfigReducer'

export const ConfigProvider = ({ children }: { children: any }) => {
  const values = useConfigReducer()

  return (
    <ConfigContext.Provider value={values}>
      {children}
    </ConfigContext.Provider>
  )
}
