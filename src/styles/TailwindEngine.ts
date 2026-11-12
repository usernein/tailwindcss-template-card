import { compile } from 'tailwindcss'

// Tailwind's own stylesheets, inlined at build time so the compiler never
// needs a filesystem or a network fetch at runtime.
import indexCss from 'tailwindcss/index.css?raw'
import themeCss from 'tailwindcss/theme.css?raw'
import preflightCss from 'tailwindcss/preflight.css?raw'
import utilitiesCss from 'tailwindcss/utilities.css?raw'

import daisyuiPlugin from 'daisyui'

import { splitAtProperties } from './cssScan.ts'

export { extractCandidates } from './cssScan.ts'

type Compiler = Awaited<ReturnType<typeof compile>>

/**
 * The `@import` ids Tailwind's own entrypoint resolves, mapped to the bundled
 * source. `compile()` asks for these by the exact strings below.
 */
const STYLESHEETS: Record<string, string> = {
  tailwindcss: indexCss,
  './index.css': indexCss,
  './theme.css': themeCss,
  './preflight.css': preflightCss,
  './utilities.css': utilitiesCss
}

type CompileOptions = NonNullable<Parameters<typeof compile>[1]>
type PluginModule = Awaited<
  ReturnType<NonNullable<CompileOptions['loadModule']>>
>['module']

const MODULES: Record<string, PluginModule> = {
  daisyui: daisyuiPlugin
}

/** Document-level sheet holding every `@property` rule any card has needed. */
let propertySheet: CSSStyleSheet | null = null
const registeredProperties = new Set<string>()

/**
 * Registers `@property` rules on the document, once each. Shared across every
 * card instance, since custom property registration is global anyway.
 */
const ensureAtPropertiesRegistered = (rules: string[]) => {
  const unseen = rules.filter(rule => !registeredProperties.has(rule))
  if (unseen.length === 0) return

  unseen.forEach(rule => registeredProperties.add(rule))

  if (!propertySheet) {
    propertySheet = new CSSStyleSheet()
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, propertySheet]
  }

  propertySheet.replaceSync([...registeredProperties].join('\n'))
}

type CacheEntry = {
  compiler: Compiler
  candidates: Set<string>
  css: string
  /** Adopted by every card using this entry stylesheet. */
  sheet: CSSStyleSheet
}

/**
 * Compiles Tailwind CSS in the browser from a candidate list.
 *
 * One compiler, and one constructed stylesheet, per entry stylesheet. Every
 * card with the same plugin setup adopts the same sheet: each compiler already
 * accumulated every card's classes, so per-card sheets only meant the same
 * growing stylesheet being parsed once per card on the dashboard.
 */
export class TailwindEngine {
  private static cache = new Map<string, Promise<CacheEntry>>()

  static buildEntryCss(options: {
    daisyui?: boolean
    daisyuiThemes?: string
  }): string {
    const lines = ['@import "tailwindcss";']

    if (options.daisyui) {
      const themes = options.daisyuiThemes?.trim()
      lines.push(
        themes
          ? `@plugin "daisyui" { themes: ${themes}; }`
          : '@plugin "daisyui";'
      )
    }

    return lines.join('\n')
  }

  private static async createCompiler(entryCss: string): Promise<CacheEntry> {
    const compiler = await compile(entryCss, {
      base: '/',
      loadStylesheet: async (id: string) => {
        const content = STYLESHEETS[id]
        if (content === undefined) {
          throw new Error(`Unable to resolve stylesheet import: ${id}`)
        }
        return { path: id, base: '/', content }
      },
      loadModule: async (id: string) => {
        const module = MODULES[id]
        if (module === undefined) {
          throw new Error(`Unable to resolve plugin: ${id}`)
        }
        return { path: id, base: '/', module }
      }
    })

    return {
      compiler,
      candidates: new Set<string>(),
      css: '',
      sheet: new CSSStyleSheet()
    }
  }

  /**
   * Returns the shared sheet for `entryCss`, after making sure it covers
   * `candidates`. The sheet is updated synchronously with the compile, so
   * cards awaiting the same compiler can never write an older result over a
   * newer one.
   */
  static async sheetFor(
    entryCss: string,
    candidates: string[]
  ): Promise<CSSStyleSheet> {
    let pending = this.cache.get(entryCss)

    if (!pending) {
      pending = this.createCompiler(entryCss)
      this.cache.set(entryCss, pending)
    }

    let entry: CacheEntry
    try {
      entry = await pending
    } catch (e) {
      // Don't cache a failed compiler — a later render may succeed.
      this.cache.delete(entryCss)
      throw e
    }

    const unseen = candidates.filter(c => !entry.candidates.has(c))
    if (unseen.length === 0 && entry.css) return entry.sheet

    unseen.forEach(c => entry.candidates.add(c))
    entry.css = entry.compiler.build([...entry.candidates])

    // `@property` only takes effect at document scope, so those rules are
    // hoisted out before the rest is adopted into shadow roots.
    const { properties, rest } = splitAtProperties(entry.css)
    ensureAtPropertiesRegistered(properties)
    entry.sheet.replaceSync(rest)

    return entry.sheet
  }
}
