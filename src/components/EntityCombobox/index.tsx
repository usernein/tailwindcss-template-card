import { Combobox } from '@headlessui/react'
import { HomeAssistant } from 'custom-card-helpers'
import { useState } from 'preact/hooks'

import { BsChevronBarExpand } from 'react-icons/bs'

export function EntityCombobox ({
  hass,
  defaultValue,
  onChange
}: {
  hass: HomeAssistant
  defaultValue: string
  onChange: (value: string) => void
}) {
  const options = Object.keys(hass.states)
  const [query, setQuery] = useState('')
  const [selectedOption, setSelectedOption] =
    useState<typeof options[number]>(defaultValue)

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Combobox
      value={selectedOption}
      onChange={v => {
        setSelectedOption(v)
        onChange(v)
      }}
    >
      <div class='dropdown dropdown-hover w-full'>
        <div class='relativew-full flex flex-row'>
          <Combobox.Input
            onChange={e => setQuery(e.target.value)}
            className='input pr-12 w-full placeholder:opacity-50 rounded-btn'
            placeholder='Pick an entity'
            spellCheck={false}
          ></Combobox.Input>
          <Combobox.Button className='absolute right-0 text-lg opacity-50 w-12 h-full grid place-content-center'>
            <BsChevronBarExpand />
          </Combobox.Button>
        </div>
        {filteredOptions.length > 0 && (
          <Combobox.Options
            as='ul'
            className='outline outline-2 outline-base-content/20 max-h-56 overflow-y-auto mt-2 menu menu-horizontal dropdown-content bg-base-100 text-base-content rounded-btn w-full'
          >
            {filteredOptions.map(option => (
              <Combobox.Option
                key={option}
                value={option}
                className='w-full'
                as='li'
              >
                <div>{option}</div>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  )
}
