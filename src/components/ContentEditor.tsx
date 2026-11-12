import { useDebouncer } from '@utils/DebounceHandler'

import { useContext } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { CodeEditor } from './CodeEditor'

export function ContentEditor ({
  className,
  mode = 'jinja2'
}: {
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
      className={className}
      mode={mode}
    />
  )
}
