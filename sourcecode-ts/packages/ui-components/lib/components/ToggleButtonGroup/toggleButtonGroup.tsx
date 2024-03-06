import clsx from 'clsx'
import { Accordion } from '../Accordion/accordion'
import { GenericTuple } from '../../generics/tuple'

type ItemProps = {
  onClick: () => void
  label: string
}

type Buttons =
  | GenericTuple<ItemProps, 2>
  | GenericTuple<ItemProps, 3>
  | GenericTuple<ItemProps, 4>
  | GenericTuple<ItemProps, 5>
  | GenericTuple<ItemProps, 6>
  | GenericTuple<ItemProps, 7>
  | GenericTuple<ItemProps, 8>
  | GenericTuple<ItemProps, 9>
  | GenericTuple<ItemProps, 10>
  | GenericTuple<ItemProps, 11>

type InnerProps = {
  activeButton: number | null
  buttons: Buttons
}

type ToggleButtonGroupComponentProps = InnerProps

const ToggleButtonGroupComponent = ({ buttons, activeButton }: ToggleButtonGroupComponentProps) => {
  const widthOptions = {
    'w-1/2': buttons.length === 2,
    'w-1/3': buttons.length === 3,
    'w-1/4': buttons.length === 4,
    'w-1/5': buttons.length === 5,
    'w-1/6': buttons.length === 6,
    'w-[calc(100%/7)]': buttons.length === 7,
    'w-[calc(100%/8)]': buttons.length === 8,
    'w-[calc(100%/9)]': buttons.length === 9,
    'w-[calc(100%/10)]': buttons.length === 10,
    'w-[calc(100%/11)]': buttons.length === 11,
  }
  return (
    <div
      className={clsx('relative rounded bg-[var(--theme-color-background-component)] w-full', {
        'min-w-[200px]': buttons.length === 2,
        'min-w-[300px]': buttons.length === 3,
        'min-w-[400px]': buttons.length === 4,
        'min-w-[500px]': buttons.length === 5,
        'min-w-[600px]': buttons.length === 6,
        'min-w-[700px]': buttons.length === 7,
        'min-w-[800px]': buttons.length === 8,
        'min-w-[900px]': buttons.length === 9,
        'min-w-[1000px]': buttons.length === 10,
        'min-w-[1100px]': buttons.length === 11,
      })}
    >
      <div
        id="slider"
        className={clsx(
          // `absolute inset-y-0 w-1/${buttons.length} h-full px-4 py-1 transition-transform transform ease-in`,
          `absolute inset-y-0 h-full px-4 py-1 transition-transform transform ease-in`,
          {
            'opacity-0': activeButton === null,
            'translate-x-0': activeButton === 0,
            'translate-x-full': activeButton === 1,
            'translate-x-200': activeButton === 2,
            'translate-x-300': activeButton === 3,
            'translate-x-400': activeButton === 4,
            'translate-x-500': activeButton === 5,
            'translate-x-600': activeButton === 6,
            'translate-x-700': activeButton === 7,
            'translate-x-800': activeButton === 8,
            'translate-x-900': activeButton === 9,
            'translate-x-1000': activeButton === 10,
          },
          widthOptions,
        )}
      >
        <div className={clsx('w-full h-full opacity-15 bg-[var(--theme-color-background-contrast)] rounded-md')} />
      </div>
      <div className="relative flex w-full h-full">
        {buttons.map(({ label, onClick }, i) => {
          const isButtonActive = activeButton === i
          return (
            <button
              key={i}
              tabIndex={i}
              className={clsx(
                // `py-1 my-2 ml-2 w-1/${buttons.length} text-sm cursor-pointer select-none focus:outline-none`,
                `py-1 my-2 ml-2 text-sm cursor-pointer select-none focus:outline-none `,
                {
                  active: isButtonActive,
                  'font-bold text--gray-900': isButtonActive,
                  'text--gray-600': !isButtonActive,
                },
                widthOptions,
              )}
              onClick={onClick}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type ToggleButtonGroupAsSmAccordionProps = InnerProps & {
  toggleLabel: string
}

const ToggleButtonGroupAsSmAccordion = ({
  buttons,
  activeButton,
  toggleLabel,
}: ToggleButtonGroupAsSmAccordionProps) => {
  const accordionItems = [
    {
      title: toggleLabel,
      content: buttons.map(({ label, onClick }, index) => (
        <div
          onClick={onClick}
          className={clsx('py-4 px-2 cursor-pointer', {
            'bg-[var(--theme-color-background-input)]': activeButton !== index,
            'bg-[var(--theme-color-background-component)]': activeButton === index,
          })}
          key={index}
        >
          {label}
        </div>
      )),
    },
  ]
  return <Accordion items={accordionItems} />
}

type Props = {
  title: string
  activeButton: number | null
  buttons: Buttons
}

export const ToggleButtonGroup = ({ activeButton, buttons, title }: Props) => (
  <>
    <div className="hidden sm:block">
      <ToggleButtonGroupComponent activeButton={activeButton} buttons={buttons} />
    </div>
    <div className="sm:hidden w-4/5 mx-auto">
      <ToggleButtonGroupAsSmAccordion activeButton={activeButton} buttons={buttons} toggleLabel={title} />
    </div>
  </>
)
