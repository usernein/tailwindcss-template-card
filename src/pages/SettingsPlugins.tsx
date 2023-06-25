import { TweakPluginInput } from '@components/TweakPluginInput'
import { TweakPluginToggle } from '@components/TweakPluginToggle'

export const SettingsPlugins = () => {
  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='collapse collapse-open overflow-visible bg-base-300/30'>
        <div className='collapse-title text-md font-medium'>Plugins</div>
        <div className='collapse-content'>
          <div className='w-full flex flex-row flex-wrap justify-between'>
            <TweakPluginToggle label='DaisyUI' plugin='daisyui' />
            <TweakPluginToggle
              label='Tailwind-Elements'
              plugin='tailwindElements'
              disabled
            />
          </div>
        </div>
      </div>

      <div className='collapse collapse-open bg-base-300/30'>
        <div className='collapse-title text-md font-medium'>
          Plugins settings
        </div>
        <div className='collapse-content'>
          <TweakPluginInput
            label='DaisyUI CSS URL'
            plugin='daisyui'
            option='url'
            placeholder={DAISYUI_CDN_URL}
          />
        </div>
      </div>
    </div>
  )
}
