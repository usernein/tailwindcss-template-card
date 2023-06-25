import clsx from 'clsx'
import { useContext, useMemo } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { CodeEditorOptionsEnum } from '@store/ConfigReducer'

const CodeOption = ({
  devFeature,
  hidden,
  checked,
  name,
  onChange
}: {
  devFeature: boolean
  hidden: boolean
  checked: boolean
  name: string
  onChange: (checked: boolean) => void
}) => {
  return (
    <label className={clsx('label gap-2', hidden && 'hidden')}>
      <input
        type='radio'
        className={clsx('radio', devFeature ? 'radio-primary' : 'radio-accent')}
        name='code-editor'
        checked={checked}
        onChange={e => onChange((e.target as HTMLInputElement).checked)}
      />
      <span className={clsx('label-text', devFeature && 'text-primary')}>
        {name}
      </span>
    </label>
  )
}

export function CodeEditorOptions ({
  inHiddenMode
}: {
  inHiddenMode?: boolean
}) {
  const { config, updateConfig } = useContext(ConfigContext)
  const code_editor = useMemo(() => config.code_editor, [config.code_editor])

  return (
    <div className='form-control p-2 bg-base-100 font-semibold rounded-[--rounded-box]'>
      <div className='label-text'>Code editor</div>
      <div className='label flex flex-row w-full justify-evenly'>
        {Object.values(CodeEditorOptionsEnum).map(option => {
          const isDevFeature = /_dev/i.test(option)

          return (
            <CodeOption
              key={option}
              devFeature={isDevFeature}
              hidden={isDevFeature && option !== code_editor && !inHiddenMode}
              checked={code_editor == option}
              name={option}
              onChange={value => value && updateConfig({ code_editor: option })}
            />
          )
        })}
      </div>
    </div>
  )
}
