import { useState } from 'preact/hooks'
import clsx from 'clsx'
import { SettingsTweaks } from '@pages/SettingsTweaks'
import { SettingsCardContent } from '@pages/SettingsCardContent'
import { SettingsPlugins } from '@pages/SettingsPlugins'
import { WithDaisyUitheme } from './WithDaisyUitheme'
import { DarkModeToggle } from './DarkModeToggle'

const TABS = [
  { label: 'Content', Page: SettingsCardContent },
  { label: 'Tweaks', Page: SettingsTweaks },
  { label: 'Plugins', Page: SettingsPlugins }
]

export function HaCardConfig () {
  const [active, setActive] = useState(0)
  const { Page } = TABS[active]

  return (
    <WithDaisyUitheme className='w-full flex flex-col justify-center items-center rounded-xl bg-base-300 p-4'>
      <div className='form-control w-full gap-3 justify-evenly'>
        <div class='flex flex-row'>
          <div className='flex-grow'></div>
          {/* Buttons, not clickable divs, so the tabs are keyboard reachable. */}
          <div role='tablist' className='tabs flex justify-center flex-grow'>
            {TABS.map(({ label }, index) => (
              <button
                key={label}
                type='button'
                role='tab'
                aria-selected={active === index}
                className={clsx(
                  'tab',
                  'tab-bordered',
                  active === index && 'tab-active'
                )}
                onClick={() => setActive(index)}
              >
                {label}
              </button>
            ))}
          </div>
          <DarkModeToggle />
        </div>

        <Page />
      </div>
    </WithDaisyUitheme>
  )
}
