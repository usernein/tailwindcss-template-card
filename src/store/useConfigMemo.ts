import { useContext, useMemo } from 'preact/hooks'
import { ConfigContext } from '@store/ConfigContext'
import { ConfigState } from '@types'

export const useConfigMemo = <T extends keyof ConfigState>(...keys: T[]) => {
  const { config } = useContext(ConfigContext);
  return useMemo(() => {
    const memoizedValues = keys.reduce((acc, key) => {
      return { ...acc, [key]: config[key] };
    }, {} as { [K in T]: ConfigState[K] });
    return memoizedValues;
  }, keys.map((key) => config[key]));
};