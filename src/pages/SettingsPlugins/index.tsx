import { TweakPluginInput } from '../../components/TweakPluginInput'
import { TweakPluginToggle } from '../../components/TweakPluginToggle'

export const SettingsPlugins = () => {
  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='form-control w-full'>
        <div className='label label-text text-md font-medium'>Plugins</div>
        <div className='flex flex-col p-2 ring-1 ring-accent rounded-xl'>
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

      <div className='form-control w-full'>
        <div className='label label-text text-md font-medium'>
          Plugins settings
        </div>
        <div className='ring-1 ring-accent rounded-xl gap-1 flex flex-col p-2'>
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
