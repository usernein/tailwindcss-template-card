import { useEffect, useRef } from 'preact/hooks'
import { TextareaEditor } from '@components/TextareaEditor'
import { useElementDefined } from '@utils/useElementDefined'
import { closeTagEdit, expandTagEdit, indentOf } from './htmlEditing'

/**
 * The subset of `ha-code-editor`'s API this wrapper drives.
 *
 * Home Assistant supports two modes only — `yaml` and `jinja2` (the latter is
 * Jinja layered on a YAML base). There is no HTML or JavaScript mode.
 */
type EditorView = {
  state: {
    doc: {
      length: number
      sliceString: (from: number, to: number) => string
      lineAt: (pos: number) => { text: string }
    }
    selection: { main: { head: number; empty: boolean } }
  }
  dispatch: (spec: {
    changes: { from: number; to: number; insert: string }
    selection: { anchor: number }
    userEvent?: string
  }) => void
}

type HaCodeEditorElement = HTMLElement & {
  /** CodeMirror view, exposed publicly by ha-code-editor. */
  codemirror?: EditorView
  value: string
  mode: string
  autocompleteEntities: boolean
  autocompleteIcons: boolean
  linewrap: boolean
  hasToolbar: boolean
  disableFullscreen: boolean
  readOnly: boolean
}

const ELEMENT_NAME = 'ha-code-editor'

/**
 * Restores the tag handling upstream's Ace editor provided.
 *
 * Transactions are dispatched as plain objects, which CodeMirror accepts, so
 * this needs no CodeMirror import and cannot conflict with the copy Home
 * Assistant already loaded.
 */
const attachHtmlEditing = (editor: HaCodeEditorElement) => {
  const onKeyDown = (event: KeyboardEvent) => {
    const view = editor.codemirror
    if (!view || event.defaultPrevented) return
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key !== '>' && event.key !== 'Enter') return

    const { doc, selection } = view.state
    const range = selection.main
    if (!range.empty) return

    const caret = range.head
    const before = doc.sliceString(Math.max(0, caret - 500), caret)
    const after = doc.sliceString(caret, Math.min(doc.length, caret + 2))

    const indent = indentOf(doc.lineAt(caret).text)
    const edit =
      event.key === '>'
        ? closeTagEdit(before, after, indent)
        : expandTagEdit(before, after, indent)

    if (!edit) return

    // Stop the event reaching CodeMirror; this replaces its handling entirely.
    event.preventDefault()
    event.stopPropagation()

    view.dispatch({
      changes: { from: caret, to: caret, insert: edit.insert },
      selection: { anchor: caret + edit.caret },
      userEvent: 'input.type'
    })
  }

  editor.addEventListener('keydown', onKeyDown, true)
  return () => editor.removeEventListener('keydown', onKeyDown, true)
}

/**
 * Wraps Home Assistant's own CodeMirror editor.
 *
 * Using the frontend's editor rather than bundling one means the card picks up
 * entity autocompletion, the active Home Assistant theme, and the same
 * keybindings as every other YAML field — at no bundle cost, since the element
 * already ships with the frontend.
 *
 * `ha-code-editor` sources its entity list through Lit context rather than a
 * `hass` property. Those `context-request` events are composed, so they cross
 * the card's shadow boundary and reach Home Assistant's provider unaided.
 *
 * The element is registered lazily by the frontend, so until it exists this
 * falls back to a plain textarea and upgrades in place once it appears.
 */
export function HaCodeEditor ({
  defaultValue,
  onChange,
  mode = 'jinja2',
  linewrap = true,
  html = true,
  className
}: {
  defaultValue: string
  onChange: (value: string) => void
  mode?: string
  linewrap?: boolean
  /** Close tags and expand them on Enter, as the old Ace editor did. */
  html?: boolean
  className?: string
}) {
  const available = useElementDefined(ELEMENT_NAME)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<HaCodeEditorElement | null>(null)

  // Keep the latest callback without re-creating the editor on every render.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const container = containerRef.current
    if (!available || !container) return

    const editor = document.createElement(ELEMENT_NAME) as HaCodeEditorElement
    editor.mode = mode
    editor.value = defaultValue ?? ''
    editor.autocompleteEntities = true
    editor.autocompleteIcons = true
    editor.linewrap = linewrap
    editor.hasToolbar = false
    editor.disableFullscreen = true
    editor.style.display = 'block'

    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent<{ value: string }>).detail
      const value = detail?.value ?? editor.value
      onChangeRef.current(value)
    }

    editor.addEventListener('value-changed', handleChange)

    container.innerHTML = ''
    container.appendChild(editor)
    editorRef.current = editor

    const detachHtmlEditing = html ? attachHtmlEditing(editor) : undefined

    return () => {
      detachHtmlEditing?.()
      editor.removeEventListener('value-changed', handleChange)
      editor.remove()
      editorRef.current = null
    }
    // `defaultValue` is deliberately excluded from the dependencies: it seeds
    // the editor, and re-running this on every keystroke would rebuild the
    // element and destroy the caret. External changes are handled below.
  }, [available, mode, linewrap, html])

  /*
   * Adopt genuinely external changes — a different card loaded into the same
   * editor — but never while the user is typing.
   *
   * Config updates are debounced, so `defaultValue` always trails the
   * keystrokes by at least the debounce period. Writing it back mid-edit
   * discarded everything typed since and reset the caret to the start of the
   * document, which showed up as characters vanishing and landing at the top.
   * While focus is inside the editor, the editor owns its content.
   */
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || defaultValue === undefined) return
    if (editor.value === defaultValue) return
    if (editor.matches(':focus-within')) return

    editor.value = defaultValue
  }, [defaultValue])

  if (!available) {
    return (
      <TextareaEditor
        defaultValue={defaultValue}
        onChange={onChange}
        className={className}
      />
    )
  }

  // No forced height: ha-code-editor sizes itself to its content, so the
  // wrapper caps it and scrolls instead of overflowing onto its siblings.
  return <div class={className} ref={containerRef} />
}
