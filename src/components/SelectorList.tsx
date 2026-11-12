import { SelectorSuggestion } from '@utils/contentScan'

/**
 * Suggestion list for the selector inputs, built from the card's own markup.
 *
 * Rendered once per panel and shared by its rows: duplicate element ids in a
 * single tree resolve to the first one anyway.
 */
export function SelectorList ({
  id,
  selectors
}: {
  id: string
  selectors: SelectorSuggestion[]
}) {
  return (
    <datalist id={id}>
      {selectors.map(suggestion => (
        <option key={suggestion.selector} value={suggestion.selector}>
          {suggestion.entities.length
            ? suggestion.entities.slice(0, 3).join(', ')
            : `${suggestion.count} element${suggestion.count === 1 ? '' : 's'}`}
        </option>
      ))}
    </datalist>
  )
}
