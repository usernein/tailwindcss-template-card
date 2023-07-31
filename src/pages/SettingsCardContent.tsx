import { ContentEditor } from '@components/ContentEditor'
import { SettingsBindings } from '@pages/SettingsBindings'
import { SettingsActions } from './SettingsActions'

export const SettingsCardContent = () => {
  return (
    <div className='w-full flex flex-col gap-3 text-base-content'>
      <div className='collapse collapse-open bg-base-200'>
        <label className='collapse-title text-md font-medium'>
          HTML Content
        </label>

        <ContentEditor />
      </div>
      <div className='min-w-full flex flex-col gap-3'>
        <SettingsBindings />
        <SettingsActions />
      </div>
    </div>
  )
}
