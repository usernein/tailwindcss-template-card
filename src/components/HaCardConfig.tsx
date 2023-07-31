import { PropsWithChildren, StateUpdater, useState } from 'preact/compat'
import clsx from 'clsx'
import { SettingsTweaks } from '@pages/SettingsTweaks'
import { SettingsCardContent } from '@pages/SettingsCardContent'
import { SettingsPlugins } from '@pages/SettingsPlugins'
import { WithDaisyUitheme } from './WithDaisyUitheme'
// import { SettingsAbout } from '@pages/SettingsAbout'

type ActiveTabState = {
  index: number
  inHiddenMode: boolean
}
const ConfigTab = ({
  activeState,
  tabKey,
  children
}: PropsWithChildren & {
  activeState: [ActiveTabState, StateUpdater<ActiveTabState>]
  tabKey: number
}) => {
  const [activeTab, setActiveTab] = activeState
  return (
    <div
      className={clsx(
        'tab',
        'tab-bordered',
        activeTab.index == tabKey && 'tab-active'
      )}
      onClick={() => setActiveTab({ index: tabKey, inHiddenMode: false })}
      onDblClick={() => setActiveTab({ index: tabKey, inHiddenMode: true })}
    >
      {children}
    </div>
  )
}

export function HaCardConfig () {
  const activeState = useState({
    index: 0,
    inHiddenMode: false
  } as ActiveTabState)

  return (
    <WithDaisyUitheme className='w-full flex flex-col justify-center items-center rounded-xl bg-base-300 p-4'>
      <div className='form-control w-full gap-3 justify-evenly'>
        <div className='tabs flex justify-center w-full'>
          <ConfigTab activeState={activeState} tabKey={0}>
            Content
          </ConfigTab>
          <ConfigTab activeState={activeState} tabKey={1}>
            Tweaks
          </ConfigTab>
          <ConfigTab activeState={activeState} tabKey={2}>
            Plugins
          </ConfigTab>
          {/* <ConfigTab activeState={activeState} tabKey={3}>
            About
          </ConfigTab> */}
        </div>

        {activeState[0].index == 0 && <SettingsCardContent />}
        {activeState[0].index == 1 && (
          <SettingsTweaks inHiddenMode={activeState[0].inHiddenMode} />
        )}
        {activeState[0].index == 2 && <SettingsPlugins />}
        {/* {activeState[0].index == 3 && <SettingsAbout />} */}
      </div>
    </WithDaisyUitheme>
  )
}
