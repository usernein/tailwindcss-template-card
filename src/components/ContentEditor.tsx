import { useDebouncer } from '@utils/DebounceHandler'

import { IAceOptions } from 'react-ace'
import { useContext } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { CodeEditor } from './CodeEditor'

export function ContentEditor ({
  additionalOptions,
  className,
  mode = 'html'
}: {
  additionalOptions?: IAceOptions
  className?: string
  mode?: string
}) {
  const { config } = useContext(ConfigContext)
  const { debounceChangePeriod, content } = config

  const updateConfig = useContext(ConfigContext)['updateConfig']

  const debounce = useDebouncer(debounceChangePeriod)

  const debounceAndChange = (v: string) => {
    debounce(() => {
      updateConfig({ content: v })
    })
  }

  return (
    <CodeEditor
      defaultValue={content}
      onChange={debounceAndChange}
      additionalOptions={additionalOptions}
      className={className}
      mode={mode}
    />
  )
}
