import {
  PropsWithChildren,
  StateUpdater,
  useContext,
  useState
} from 'preact/compat'
import { ConfigContext } from '../../store/ConfigContext'
import clsx from 'clsx'
import { SettingsTweaks } from '../../pages/SettingsTweaks'
import { SettingsCardContent } from '../../pages/SettingsCardContent'
import { SettingsPlugins } from '../../pages/SettingsPlugins'
import { SettingsAbout } from '../../pages/SettingsAbout'

const ConfigTab = ({
  activeState,
  tabKey,
  children
}: PropsWithChildren & {
  activeState: [number, StateUpdater<number>]
  tabKey: number
}) => {
  const [activeTab, setActiveTab] = activeState
  return (
    <div
      className={clsx(
        'tab',
        'tab-bordered',
        activeTab == tabKey && 'tab-active'
      )}
      onClick={() => setActiveTab(tabKey)}
    >
      {children}
    </div>
  )
}

export function HaCardConfig () {
  const { config } = useContext(ConfigContext)
  const activeState = useState(0)

  return (
    <div
      data-theme={config.plugins.daisyui.theme ?? 'auto'}
      className='w-full flex flex-col justify-center items-center rounded-xl bg-base-100'
    >
      <div className='form-control w-[90%] gap-3 justify-evenly'>
        <div className='tabs py-4 flex justify-center w-full'>
          <ConfigTab activeState={activeState} tabKey={0}>
            Content
          </ConfigTab>
          <ConfigTab activeState={activeState} tabKey={1}>
            Tweaks
          </ConfigTab>
          <ConfigTab activeState={activeState} tabKey={2}>
            Plugins
          </ConfigTab>
          <ConfigTab activeState={activeState} tabKey={3}>
            About
          </ConfigTab>

          {activeState[0] == 0 && <SettingsCardContent />}
          {activeState[0] == 1 && <SettingsTweaks />}
          {activeState[0] == 2 && <SettingsPlugins />}
          {activeState[0] == 3 && <SettingsAbout />}
        </div>
      </div>
    </div>
  )
}
