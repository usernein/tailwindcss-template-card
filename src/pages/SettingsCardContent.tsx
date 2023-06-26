import { useContext } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { CodeEditor } from '@components/CodeEditor'
import { SettingsBindings } from '@pages/SettingsBindings'
import { SettingsActions } from './SettingsActions'
import { useConfigMemo } from '@store/useConfigMemo'

export const SettingsCardContent = () => {
  const { updateConfig } = useContext(ConfigContext)
  const { content } = useConfigMemo('content')

  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='collapse collapse-open bg-base-200'>
        <label className='collapse-title text-md font-medium'>
          HTML Content
        </label>

        <CodeEditor
          value={content}
          onChange={e => updateConfig({ content: e })}
        />
      </div>
      <div className='min-w-full flex flex-col gap-3'>
        <SettingsBindings />
        <SettingsActions />
      </div>
    </div>
  )
}
