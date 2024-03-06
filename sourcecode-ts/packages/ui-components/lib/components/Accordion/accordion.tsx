import { ReactNode, useState } from 'react'
import { MinusIcon } from '../../icons/Minus/minus'
import { PlusIcon } from '../../icons/Plus/plus'
import clsx from 'clsx'

type Props = {
  items: { title: string; content: ReactNode }[]
  background?: 'input' | 'component'
}

const defaultBackground = 'input' as const

export const Accordion = ({ items, background: backgroundProp }: Props) => {
  const background = backgroundProp ?? defaultBackground
  const [activeIndexes, setActiveIndexes] = useState<number[]>([])

  const handleItemClick = (index: number) => {
    setActiveIndexes((prevActiveIndexes) => {
      return prevActiveIndexes.includes(index)
        ? prevActiveIndexes.filter((activeIndex) => activeIndex !== index)
        : prevActiveIndexes.concat(index)
    })
  }

  return (
    <div>
      {items.map((item, index) => {
        const isItemOpen = activeIndexes.includes(index)
        return (
          <div className="flex flex-col" key={index}>
            <div
              className="flex justify-between items-center bg-[var(--theme-color-background-subsection)] p-4 cursor-pointer"
              onClick={() => handleItemClick(index)}
            >
              <div>{item.title}</div>
              <div>{isItemOpen ? <MinusIcon variant="inactive" /> : <PlusIcon variant="standard" />}</div>
            </div>
            <div
              className={clsx('overflow-hidden transition-all duration-300 origin-top px-1 ', {
                'scale-y-100': isItemOpen,
                'max-h-screen': isItemOpen,
                'scale-y-0': !isItemOpen,
                'max-h-0': !isItemOpen,
                'bg-[var(--theme-color-background-input)]': background === 'input',
                'bg-[var(--theme-color-background-component)]': background === 'component',
              })}
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
