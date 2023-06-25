export const SettingsBindings = () => {
  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='collapse collapse-arrow bg-base-200/30'>
        <input type='checkbox' checked={true} />
        <div className='collapse-title text-md font-medium'>
          Bindings
        </div>
        <div className='collapse-content'>
          <p>hello</p>
        </div>
      </div>
      <div className='collapse collapse-arrow bg-base-200/30'>
        <input type='checkbox' />
        <div className='collapse-title text-md font-medium'>
          Actions
        </div>
        <div className='collapse-content'>
          <p>hello</p>
        </div>
      </div>
    </div>
  )
}
