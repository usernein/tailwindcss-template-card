import 'ace-builds'
import 'ace-builds/src-noconflict/ace'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/theme-github_dark'
import 'ace-builds/src-noconflict/snippets/html'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-emmet'

// import htmlWorkerUrl from 'ace-builds/src-noconflict/worker-html?worker&inline'
// ace.config.setModuleUrl('ace/mode/html_worker', htmlWorkerUrl)
import AceEditor from 'react-ace'
import { CodemirrorEditor } from '@components/CodemirrorEditor'
import { TextareaEditor } from '@components/TextareaEditor'
import { useContext, useMemo } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { CodeEditorOptionsEnum } from '@store/ConfigReducer'

export function CodeEditor ({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { config } = useContext(ConfigContext)

  const codeEditor = useMemo(() => config.code_editor, [config.code_editor])
  return (
    <div className='h-48 w-full'>
      {codeEditor == CodeEditorOptionsEnum.ACE && (
        // @ts-expect-error
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
          onChange={onChange}
        />
      )}

      {codeEditor == CodeEditorOptionsEnum.TEXTAREA && (
        <TextareaEditor
          value={value}
          onChange={onChange}
          debounceChangePeriod={500}
        />
      )}

      {codeEditor == CodeEditorOptionsEnum.CODEMIRROR_DEV && (
        <CodemirrorEditor
          value={value}
          onChange={onChange}
          debounceChangePeriod={500}
        />
      )}
    </div>
  )
}
