import clsx from 'clsx'
import React, { useState } from 'react'

type TooltipDirection = 'above' | 'below' | 'left' | 'right'

const ArrowUp = () => {
  return (
    <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-[var(--theme-color-background-contrast-light)]" />
  )
}

const ArrowDown = () => {
  return (
    <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[var(--theme-color-background-contrast-light)]" />
  )
}

const ArrowLeft = () => {
  return (
    <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-[var(--theme-color-background-contrast-light)]" />
  )
}

const ArrowRight = () => {
  return (
    <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-[var(--theme-color-background-contrast-light)]" />
  )
}

type ArrowProps = {
  direction: TooltipDirection
}

const Arrow = ({ direction }: ArrowProps) => {
  switch (direction) {
    case 'below':
      return <ArrowUp />
    case 'above':
      return <ArrowDown />
    case 'left':
      return <ArrowRight />
    case 'right':
      return <ArrowLeft />
  }
}

type Props = {
  children?: React.ReactNode
  content: string | string[]
  direction: TooltipDirection
  isDampened?: boolean
  minWidth?: 100 | 200 | 300 | 400 | 500 | 600
  shouldCenterOnSecondaryAxis?: boolean
}

export const Tooltip = ({ content, children, direction, isDampened, shouldCenterOnSecondaryAxis, minWidth }: Props) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false)

  const handleMouseEnter = () => {
    setTooltipVisible(true)
  }

  const handleMouseLeave = () => {
    setTooltipVisible(false)
  }
  return (
    <div className="opacity-100 block w-full h-full">
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="w-full h-full">
        {children}
      </div>

      {isTooltipVisible && (
        <div
          className={clsx('absolute bg-tooltip p-2 rounded-md text-center z-20', {
            'top-[calc(100%+8px)]': direction === 'below',
            'bottom-[calc(100%+8px)]': direction === 'above',
            'left-1/2': (direction === 'below' || direction === 'above') && shouldCenterOnSecondaryAxis,
            '-translate-x-1/2': (direction === 'below' || direction === 'above') && shouldCenterOnSecondaryAxis,

            'left-[calc(100%+8px)]': direction === 'right',
            'right-[calc(100%+8px)]': direction === 'left',

            'top-1/2': (direction === 'left' || direction === 'right') && shouldCenterOnSecondaryAxis,
            '-translate-y-1/2': (direction === 'left' || direction === 'right') && shouldCenterOnSecondaryAxis,

            'min-w-[100px]': minWidth === 100,
            'min-w-[200px]': minWidth === 200,
            'min-w-[300px]': minWidth === 300,
            'min-w-[400px]': minWidth === 400,
            'min-w-[500px]': minWidth === 500,
            'min-w-[600px]': minWidth === 600,
          })}
        >
          <Arrow direction={direction} />
          {Array.isArray(content) ? (
            <div
              className={clsx('flex flex-col items-center', {
                'text-[var(--theme-color-font-disabled)]': isDampened,
              })}
            >
              {content.map((contentItem, index) => (
                <div key={index}>{contentItem}</div>
              ))}
            </div>
          ) : (
            <div>{content}</div>
          )}
        </div>
      )}
    </div>
  )
}
