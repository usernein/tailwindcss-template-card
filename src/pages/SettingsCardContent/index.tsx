import { useContext } from 'preact/compat'
import { TextareaEditor } from '../../components/TextareaEditor'
import { ConfigContext } from '../../store/ConfigContext'
import { CodeEditor } from '../../components/CodeEditor'
import { SettingsBindings } from '../SettingsBindings'

export const SettingsCardContent = () => {
  const { config, updateConfig } = useContext(ConfigContext)
  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='form-control w-full'>
        <label className='label label-text text-md font-medium'>HTML Content</label>
        {config.use_textarea_editor ? (
          <TextareaEditor
            value={config.content}
            onChange={e =>
              updateConfig({
                content: e
              })
            }
            debounceChangePeriod={500}
          />
        ) : (
          <CodeEditor
            value={config.content}
            onChange={e => updateConfig({ content: e })}
          />
        )}
      </div>
    </div>
  )
}
