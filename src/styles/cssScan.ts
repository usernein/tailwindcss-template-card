/*
 * Pure helpers for the in-browser Tailwind engine, kept apart from it so they
 * can be unit tested without bundling Tailwind's stylesheets.
 */

/**
 * Extracts utility class candidates from rendered HTML.
 *
 * Tailwind's real scanner is a native (Rust) binary and cannot run in the
 * browser, but we do not need it: the card already holds the exact HTML it is
 * about to render, so reading the class attributes is both sufficient and
 * cheap. Arbitrary values use underscores rather than spaces by Tailwind
 * convention, so splitting on whitespace is safe.
 */
const CLASS_ATTRIBUTE = /class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)')/g

export const extractCandidates = (html: string): string[] => {
  const found = new Set<string>()

  for (const match of html.matchAll(CLASS_ATTRIBUTE)) {
    const value = match[1] ?? match[2] ?? ''
    for (const token of value.split(/\s+/)) {
      if (token) found.add(token)
    }
  }

  return [...found]
}

/**
 * `@property` rules are registered per document, and a browser ignores them
 * entirely when they arrive inside a shadow root's adopted stylesheets. Tailwind
 * v4 leans on registered custom properties for gradients, transforms, shadows
 * and filters, so those utilities silently render as nothing unless the rules
 * are hoisted to the document.
 *
 * Verified in Chrome: a gradient defined against a shadow-scoped `@property`
 * computes to `none`; the same rule adopted on `document` resolves correctly.
 */
const AT_PROPERTY_RULE = /@property\s+--[\w-]+\s*\{[^}]*\}/g

export const splitAtProperties = (css: string) => {
  const properties = css.match(AT_PROPERTY_RULE) ?? []
  return { properties, rest: css.replace(AT_PROPERTY_RULE, '') }
}
