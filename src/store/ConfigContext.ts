import { ConfigState } from "@types"
import { createContext } from "preact"

export type ConfigContextValues = {
  config: ConfigState
  updateConfig: (payload: Partial<ConfigState>, dispatch_event?: boolean) => void
}

export const ConfigContext = createContext({} as ConfigContextValues)