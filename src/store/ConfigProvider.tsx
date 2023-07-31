import { PropsWithChildren, useEffect } from 'preact/compat'
import { ConfigContext } from './ConfigContext'
import { useConfigReducer } from './ConfigReducer'

export const ConfigProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    console.log('rendering ConfigProvider')
  })
  const values = useConfigReducer()

  return (
    <ConfigContext.Provider value={values}>{children}</ConfigContext.Provider>
  )
}
