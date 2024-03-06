import clsx from 'clsx'
import { Spinner } from '../Spinner/spinner'

type Props = {
  onClick: () => void
  label: string
  isInactive?: boolean
  isLoading?: boolean
}

export const Button = ({ onClick, label, isInactive, isLoading }: Props) => {
  return (
    <button
      onClick={() => {
        if (!isInactive) {
          onClick()
        }
      }}
      type="button"
      className={clsx(
        'flex justify-between w-full px-4 py-2 text-sm font-medium  bg-[var(--theme-color-background-component)] focus:outline-none',
        {
          'text-[var(--theme-color-font)]': !isInactive,
          'text-[var(--theme-color-font-disabled)]': !!isInactive,
          'cursor-default': !!isInactive,
        },
      )}
    >
      <span className={'grow'}>{label}</span>
      {isLoading && <Spinner size="small" speed="standard" />}
    </button>
  )
}
