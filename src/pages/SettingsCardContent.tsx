import { useContext, useMemo } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { CodeEditor } from '@components/CodeEditor'
import { SettingsBindings } from '@pages/SettingsBindings'

export const SettingsCardContent = () => {
  const { config, updateConfig } = useContext(ConfigContext)
  const content = useMemo(() => config.content, [config.content])

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

      <SettingsBindings />
    </div>
  )
}
