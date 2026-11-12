import clsx from 'clsx'
import { HaCodeEditor } from '@components/HaCodeEditor'

/**
 * `default` is the card's HTML content; `compact` is a short snippet such as
 * the code a binding or action runs. The height is chosen here rather than
 * passed as a class because two `min-h-*` utilities in one class attribute
 * resolve by their order in the compiled stylesheet, not by the order written.
 */
const HEIGHTS = {
  default: 'min-h-32 max-h-[420px]',
  compact: 'min-h-24 max-h-64'
} as const

export function CodeEditor ({
  defaultValue,
  onChange,
  className,
  mode = 'jinja2',
  html = true,
  size = 'default'
}: {
  defaultValue: string
  onChange: (defaultValue: string) => void
  className?: string
  mode?: string
  html?: boolean
  size?: keyof typeof HEIGHTS
}) {
  return (
    /*
     * `ha-code-editor` sizes itself to its content — its host style is only
     * `display: block`, and CodeMirror's own scroller never gets a bounded
     * height. Left alone it grows past its container and paints over whatever
     * follows it, which is what put the Bindings and Actions panels on top of
     * the code. Capping the height here and scrolling makes it behave.
     */
    <HaCodeEditor
      defaultValue={defaultValue}
      onChange={onChange}
      mode={mode}
      html={html}
      className={clsx(
        'w-full overflow-auto rounded-lg',
        HEIGHTS[size],
        className
      )}
    />
  )
}
