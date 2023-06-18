import { createContext } from "preact"
import { ConfigState } from "./ConfigReducer"

export type ConfigContextValues = {
  config: ConfigState
  updateConfig: (payload: Partial<ConfigState>, dispatch_event?: boolean) => void
}

export const ConfigContext = createContext({} as ConfigContextValues)