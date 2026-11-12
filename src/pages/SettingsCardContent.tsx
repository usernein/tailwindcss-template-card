import { ContentEditor } from '@components/ContentEditor'
import { SettingsBindings } from '@pages/SettingsBindings'
import { SettingsActions } from './SettingsActions'

export const SettingsCardContent = () => {
  return (
    <div className='w-full flex flex-col gap-3 text-base-content'>
      <div className='rounded-box bg-base-200 p-3'>
        <label className='mb-2 block text-md font-medium'>HTML Content</label>
        <ContentEditor />
      </div>

      {/* Normal flow, directly beneath the editor. */}
      <div className='flex w-full min-w-full flex-col gap-3'>
        <SettingsBindings />
        <SettingsActions />
      </div>
    </div>
  )
}
