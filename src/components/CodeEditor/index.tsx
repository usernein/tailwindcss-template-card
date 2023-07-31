import { CodeEditorOptionsEnum } from '@types'
import clsx from 'clsx'
import { IAceOptions } from 'react-ace'
import { useContext } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { AceEditor } from '@components/AceEditor'
import { TextareaEditor } from '@components/TextareaEditor'
import { CodemirrorEditor } from '@components/CodemirrorEditor'

export function CodeEditor ({
  defaultValue,
  onChange,
  additionalOptions,
  className,
  mode = 'html'
}: {
  defaultValue: string
  onChange: (defaultValue: string) => void
  additionalOptions?: IAceOptions
  className?: string
  mode?: string
}) {
  const { config } = useContext(ConfigContext)
  const { code_editor: codeEditor } = config

  return (
    <div className={clsx('h-48 w-full', className)}>
      {codeEditor == CodeEditorOptionsEnum.ACE && (
        <AceEditor
          defaultValue={defaultValue}
          onChange={onChange}
          additionalOptions={additionalOptions}
          mode={mode}
        />
      )}

      {codeEditor == CodeEditorOptionsEnum.TEXTAREA && (
        <TextareaEditor defaultValue={defaultValue} onChange={onChange} />
      )}

      {codeEditor == CodeEditorOptionsEnum.CODEMIRROR_DEV && (
        <CodemirrorEditor defaultValue={defaultValue} onChange={onChange} />
      )}
    </div>
  )
}
