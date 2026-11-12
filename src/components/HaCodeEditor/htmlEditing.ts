/**
 * HTML editing conveniences for Home Assistant's code editor.
 *
 * `ha-code-editor` only ships `yaml` and `jinja2` CodeMirror languages, so it
 * has no HTML tag handling. The card's content is HTML, and upstream's Ace
 * editor did close tags, so this restores that behaviour without pulling a
 * second CodeMirror into the bundle.
 *
 * The logic is kept pure — it takes the text around the caret and returns the
 * edit to apply — so it can be tested without a browser or an editor instance.
 */

/** Elements that never take a closing tag. */
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

/** An unclosed opening tag ending at the caret, e.g. `<div class="x"`. */
const OPEN_TAG_AT_CARET = /<([a-zA-Z][\w:-]*)(?:\s[^<>]*)?$/

export type Edit = {
  /** Text to insert at the caret. */
  insert: string
  /** Where to leave the caret, as an offset from the insertion point. */
  caret: number
}

/**
 * Closing a tag: typing `>` after `<div` yields `<div></div>` with the caret
 * between the two. Returns null when the `>` should be inserted normally —
 * void elements, self-closing tags, and anything that isn't an opening tag.
 *
 * When content follows the caret immediately, the closing tag would otherwise
 * butt straight up against it (`</div><div class=...`), so the remainder is
 * pushed onto its own line at the current indent.
 */
export const closeTagEdit = (
  before: string,
  after = '',
  lineIndent = ''
): Edit | null => {
  if (before.endsWith('/')) return null

  const match = OPEN_TAG_AT_CARET.exec(before)
  if (!match) return null

  const tag = match[1]
  if (VOID_TAGS.has(tag.toLowerCase())) return null

  // An odd number of quotes means the caret is inside an attribute value,
  // where `>` is just a character.
  const attrs = match[0].slice(1 + tag.length)
  if ((attrs.match(/"/g) ?? []).length % 2 !== 0) return null
  if ((attrs.match(/'/g) ?? []).length % 2 !== 0) return null

  const closer = '></' + tag + '>'
  const followedByContent = after.length > 0 && !/^\s/.test(after)

  return {
    insert: followedByContent ? closer + '\n' + lineIndent : closer,
    caret: 1
  }
}

/**
 * Pressing Enter between `>` and `</` opens the tag out over three lines with
 * the caret indented on the middle one:
 *
 *     <div>|</div>   ->   <div>
 *                           |
 *                         </div>
 */
export const expandTagEdit = (
  before: string,
  after: string,
  lineIndent: string,
  indentUnit = '  '
): Edit | null => {
  if (!before.endsWith('>')) return null
  if (!after.startsWith('</')) return null

  const inner = lineIndent + indentUnit
  return { insert: '\n' + inner + '\n' + lineIndent, caret: 1 + inner.length }
}

/** Leading whitespace of the line the caret sits on. */
export const indentOf = (lineText: string): string =>
  /^[ \t]*/.exec(lineText)?.[0] ?? ''
