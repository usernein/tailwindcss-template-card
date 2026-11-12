import { useContext, useMemo } from 'preact/compat'
import { ConfigContext } from '@store/ConfigContext'
import { RulePanel } from '@components/RulePanel'
import {
  BindingConfig,
  BindingTypeList,
  blankBinding,
  summariseBinding
} from '@components/BindingConfig'
import { SelectorList } from '@components/SelectorList'
import { scanSelectors } from '@utils/contentScan'
import { Binding } from '@types'

const SELECTOR_LIST_ID = 'ttc-binding-selectors'

export const SettingsBindings = () => {
  const { config, updateConfig } = useContext(ConfigContext)

  const selectors = useMemo(
    () => scanSelectors(config.content),
    [config.content]
  )

  return (
    <>
      <BindingTypeList />
      <SelectorList id={SELECTOR_LIST_ID} selectors={selectors} />
      <RulePanel<Binding>
        name='bindings'
        title='Bindings'
        noun='binding'
        addLabel='Add binding'
        hint='Write live values into the rendered markup — text, HTML, a class, or any attribute.'
        emptyHint='No bindings yet. Most cards need none: Jinja templates in the content already read entity state.'
        rules={config.bindings}
        blank={blankBinding}
        summarise={summariseBinding}
        renderBody={(binding, onChange) => (
          <BindingConfig
            binding={binding}
            onChange={onChange}
            selectorListId={SELECTOR_LIST_ID}
            selectors={selectors}
          />
        )}
        onUpdate={bindings => updateConfig({ bindings })}
      />
    </>
  )
}
