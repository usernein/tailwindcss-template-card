import { useContext } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { useConfigMemo } from '@store/useConfigMemo'
// import { ConfigState } from '@types'

export function TweakRangeInput (
  // {
  //   label,
  //   tweak,
  //   min,
  //   max,
  //   steps
  // }: {
  //   label: string
  //   tweak: keyof ConfigState
  //   min: number
  //   max: number
  //   steps: number
  // }
) {
  const { updateConfig } = useContext(ConfigContext)
  const { debounceChangePeriod } = useConfigMemo('debounceChangePeriod')

  return (
    <div className='form-control p-2 bg-base-100 font-semibold rounded-[--rounded-box]'>
      <div className='label-text'>Debounce change period: {debounceChangePeriod}ms</div>
      <div className='label flex flex-row w-full justify-evenly'>
        <input
          type='range'
          className='range range-accent'
          min={50}
          max={1000}
          step={50}
          value={debounceChangePeriod}
          onChange={e =>
            updateConfig({
              debounceChangePeriod: Number((e.target as HTMLInputElement).value)
            })
          }
        />
      </div>
    </div>
  )
}
