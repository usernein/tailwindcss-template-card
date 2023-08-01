import { TweakToggle } from '@components/TweakToggle'
import { CodeEditorOptions } from '@components/CodeEditorOptions'
import { TweakRangeInput } from '@components/TweakRangeInput'
import { CardEntityConfig } from '@components/CardEntityConfig'

export const SettingsTweaks = ({
  inHiddenMode
}: {
  inHiddenMode?: boolean
}) => {
  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='collapse collapse-open bg-base-200'>
        <div className='collapse-title text-md font-medium text-base-content'>
          General
        </div>
        <div className='collapse-content flex gap-1 flex-col'>
          <CardEntityConfig />
          <TweakToggle label='Ignore line breaks' tweak='ignore_line_breaks' />
          <TweakToggle label='Always update' tweak='always_update' />
          <TweakToggle label='Parse Jinja templates' tweak='parse_jinja' />
          <CodeEditorOptions inHiddenMode={inHiddenMode} />
          <TweakRangeInput
          // label='Debounce change period'
          // tweak='debounceChangePeriod'
          // min={50}
          // max={1000}
          // step={50}
          />
        </div>
      </div>
    </div>
  )
}
