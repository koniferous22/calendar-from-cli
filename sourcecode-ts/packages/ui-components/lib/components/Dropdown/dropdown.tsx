import { useState } from 'react'
import { Button } from '../Button/button'
import { Accordion } from '../Accordion/accordion'
import clsx from 'clsx'

type Props = {
  toggleLabel: string
  options: {
    label: string
    onSelect: () => void
  }[]
}

const DropdownComponent = ({ options, toggleLabel }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }
  const alignment = 'left' as 'left' | 'right' | 'center'

  return (
    <div className="relative inline-block text-left">
      <Button label={toggleLabel} onClick={toggleDropdown} isInactive={isOpen} />
      <div
        className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg ${isOpen ? 'block' : 'hidden'} ${
          alignment === 'right' ? 'right-0' : ''
        } ${alignment === 'left' ? 'left-0' : ''} ${alignment === 'center' ? '' : ''}`}
      >
        <div className="py-1 bg-[var(--theme-color-background-component)] rounded-md shadow-xs">
          {options.map(({ label, onSelect }, index) => (
            <div
              key={`${index}-${label}`}
              className={clsx(
                'block px-4 py-2 text-sm hover:bg-[var(--theme-color-background-contrast-light)] text-[var(--theme-color-font)] cursor-pointer',
              )}
              onClick={() => {
                onSelect()
                setIsOpen(false)
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const DropdownAsSmAccordion = ({ options, toggleLabel }: Props) => {
  const accordionItems = [
    {
      title: toggleLabel,
      content: options.map(({ label, onSelect }) => (
        <div onClick={onSelect} className="py-4 px-2 cursor-pointer">
          {label}
        </div>
      )),
    },
  ]
  return <Accordion items={accordionItems} />
}

export const Dropdown = ({ options, toggleLabel }: Props) => {
  return (
    <>
      <div className="hidden sm:block">
        <DropdownComponent options={options} toggleLabel={toggleLabel} />
      </div>
      <div className="sm:hidden w-4/5 mx-auto">
        <DropdownAsSmAccordion options={options} toggleLabel={toggleLabel} />
      </div>
    </>
  )
}
