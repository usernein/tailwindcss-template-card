import { useContext, useMemo } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { RulePanel } from '@components/RulePanel'
import { SelectorList } from '@components/SelectorList'
import {
  ActionConfig,
  blankAction,
  summariseAction
} from '@components/ActionConfig'
import { scanSelectors } from '@utils/contentScan'
import { suggestActions } from '@utils/actionSuggestions'
import { Action } from '@types'

const SELECTOR_LIST_ID = 'ttc-action-selectors'

export const SettingsActions = () => {
  const { config, updateConfig } = useContext(ConfigContext)

  const selectors = useMemo(
    () => scanSelectors(config.content),
    [config.content]
  )
  const suggestions = useMemo(
    () =>
      suggestActions(selectors, config.actions).map(suggestion => ({
        key: suggestion.key,
        label: suggestion.label,
        detail: suggestion.detail,
        rule: suggestion.action
      })),
    [selectors, config.actions]
  )

  return (
    <>
      <SelectorList id={SELECTOR_LIST_ID} selectors={selectors} />
      <RulePanel<Action>
        name='actions'
        title='Actions'
        noun='action'
        addLabel='Add action'
        hint='Run code when something in the card is clicked, held or changed.'
        emptyHint='No actions yet. Markup alone does nothing — a data attribute such as data-toggle only responds once an action matches it.'
        rules={config.actions}
        blank={blankAction}
        summarise={summariseAction}
        suggestions={suggestions}
        renderBody={(action, onChange) => (
          <ActionConfig
            action={action}
            onChange={onChange}
            selectorListId={SELECTOR_LIST_ID}
            selectors={selectors}
          />
        )}
        onUpdate={actions => updateConfig({ actions })}
      />
    </>
  )
}
