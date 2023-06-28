import { useConfigMemo } from '@store/useConfigMemo'
import { CodeEditorOptionsEnum } from '@types'
import { useDebouncer } from '@utils/DebounceHandler'
import { AceEditor } from './AceEditor'
import { TextareaEditor } from './TextareaEditor'
import { CodemirrorEditor } from './CodemirrorEditor'
import clsx from 'clsx'
import { IAceOptions } from 'react-ace'
import { useEffect } from 'preact/hooks'

export function CodeEditor ({
  value,
  onChange,
  additionalOptions,
  className,
  mode = 'html'
}: {
  value: string
  onChange: (value: string) => void
  additionalOptions?: IAceOptions
  className?: string
  mode?: string
}) {
  const { debounceChangePeriod, code_editor: codeEditor } = useConfigMemo(
    'debounceChangePeriod',
    'code_editor'
  )

  const debounce = useDebouncer(debounceChangePeriod)

  const debounceAndChange = (v: string) => {
    debounce(() => {
      onChange(v)
    })
  }

  return (
    <div className={clsx('h-48 w-full', className)}>
      {codeEditor == CodeEditorOptionsEnum.ACE && (
        <AceEditor value={value} onChange={debounceAndChange} additionalOptions={additionalOptions} mode={mode} />
      )}

      {codeEditor == CodeEditorOptionsEnum.TEXTAREA && (
        <TextareaEditor value={value} onChange={debounceAndChange} />
      )}

      {codeEditor == CodeEditorOptionsEnum.CODEMIRROR_DEV && (
        <CodemirrorEditor value={value} onChange={debounceAndChange} />
      )}
    </div>
  )
}
