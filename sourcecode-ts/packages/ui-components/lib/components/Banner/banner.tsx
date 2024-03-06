import clsx from 'clsx'
import { TimesIcon } from '../../icons/Times/times'

type Props = {
  message: string | string[]
  variant: 'error' | 'warning'
  onCancel: () => void
}

export const Banner = ({ message, onCancel, variant }: Props) => {
  return (
    <div
      className={clsx('rounded-lg p-3 w-full relative cursor-pointer min-h-12', {
        'bg-[var(--theme-color-background-error)]': variant === 'error',
        'text-[var(--theme-color-font-error)]': variant === 'error',
        'bg-[var(--theme-color-background-warning)]': variant === 'warning',
        'text-[var(--theme-color-font-warning)]': variant === 'warning',
      })}
      onClick={onCancel}
    >
      {Array.isArray(message) ? (
        <ul className="list-disc ml-2">
          {message.map((message, messageIndex) => (
            <li key={messageIndex}>{message}</li>
          ))}
        </ul>
      ) : (
        <div>{message}</div>
      )}
      <div className="absolute top-2 right-2" onClick={onCancel}>
        <TimesIcon variant={variant} />
      </div>
    </div>
  )
}
