/*
 * Pure helpers for rendering the card's content. No path aliases, so the unit
 * tests can import this directly.
 */

/**
 * `ignore_line_breaks: false` turns newlines into `<br>`.
 *
 * Applied to the rendered HTML, never to the template: rewriting newlines
 * before Home Assistant renders it put markup inside multi-line Jinja tags
 * (`{% if a and↵ b %}`), which then failed to parse.
 */
export const applyLineBreaks = (html: string) => html.replace(/\r?\n|\r/g, '<br>')

/**
 * Class names from a `class` binding's result. `classList.add` throws on a
 * token containing whitespace, so `'text-red-500 font-bold'` has to be split;
 * falsy results mean "no class".
 */
export const classTokens = (result: unknown): string[] =>
  result ? String(result).split(/\s+/).filter(Boolean) : []

// Each source compiled once, rather than once per element per state change.
// Syntax errors are cached as well so a broken binding fails the same way each
// time without being recompiled.
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const compiled = new Map<string, Function | Error>()

/** Compiles a binding's or action's code into a function of `params`. */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const compileUserCode = (params: string[], body: string): Function => {
  const key = `${params.join(',')}\n${body}`
  let fn = compiled.get(key)

  if (fn === undefined) {
    try {
      fn = new Function(...params, body)
    } catch (e) {
      fn = e instanceof Error ? e : new Error(String(e))
    }
    compiled.set(key, fn)
  }

  if (fn instanceof Error) throw fn
  return fn
}
