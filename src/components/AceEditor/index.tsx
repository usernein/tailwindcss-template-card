import 'ace-builds/src-noconflict/ace'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-css'
import 'ace-builds/src-noconflict/theme-github_dark'
import 'ace-builds/src-noconflict/snippets/html'
import 'ace-builds/src-noconflict/ext-language_tools'

import Ace, { IAceOptions } from 'react-ace'

import './index.css'

export const AceEditor = ({
  defaultValue,
  onChange,
  additionalOptions,
  mode = 'html'
}: {
  defaultValue: string
  onChange: (defaultValue: string) => void
  additionalOptions?: IAceOptions
  mode?: string
}) => {
  return (
    // @ts-expect-error AceEditor is not typed correctly
    <Ace
      mode={mode}
      theme='github_dark'
      name='tailwindcss-template-card-config-ace'
      height='100%'
      width='100%'
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        useWorker: false,
        enableEmmet: true,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        ...additionalOptions
      }}
      defaultValue={defaultValue}
      onChange={onChange}
    />
  )
}
