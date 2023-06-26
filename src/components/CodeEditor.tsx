import 'ace-builds/src-noconflict/ace'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/theme-github_dark'
import 'ace-builds/src-noconflict/snippets/html'
import 'ace-builds/src-noconflict/ext-language_tools'

import AceEditor from 'react-ace'
import { CodemirrorEditor } from '@components/CodemirrorEditor'
import { TextareaEditor } from '@components/TextareaEditor'
import { CodeEditorOptionsEnum } from '../types'
import { useConfigMemo } from '@store/useConfigMemo'
import { useDebouncer } from '@utils/DebounceHandler'

export function CodeEditor ({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { debounceChangePeriod, code_editor: codeEditor } = useConfigMemo('debounceChangePeriod', 'code_editor')
  const debounce = useDebouncer(debounceChangePeriod)

  const debounceAndChange = (v: string) => {
    debounce(() => {
      onChange(v)
    })
  }

  return (
    <div className='h-48 w-full'>
      {codeEditor == CodeEditorOptionsEnum.ACE && (
        // @ts-ignore
        <AceEditor
          mode='html'
          theme='github_dark'
          name='tailwindcss-template-card-config-ace'
          height='100%'
          width='100%'
          editorProps={{ $blockScrolling: true }}
          debounceChangePeriod={500}
          setOptions={{
            useWorker: false,
            enableEmmet: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true
          }}
          value={value}
          onChange={debounceAndChange}
        />
      )}

      {codeEditor == CodeEditorOptionsEnum.TEXTAREA && (
        <TextareaEditor
          value={value}
          onChange={debounceAndChange}
        />
      )}

      {codeEditor == CodeEditorOptionsEnum.CODEMIRROR_DEV && (
        <CodemirrorEditor
          value={value}
          onChange={debounceAndChange}
        />
      )}
    </div>
  )
}
