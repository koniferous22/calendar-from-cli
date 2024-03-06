import clsx from 'clsx'

type Props = {
  capacity: number
  completed: number
}

export const ProgressBar = ({ capacity, completed }: Props) => {
  const renderedCompleted = Math.min(capacity, Math.max(completed, 0))
  return (
    <div className="rounded relative w-full bg-[var(--theme-color-background-input)] h-5">
      <div
        className={clsx('rounded-l absolute h-full', {
          'bg-progress-bar': renderedCompleted !== capacity,
          'bg-[var(--theme-color-font)]': renderedCompleted === capacity,
          'rounded-r': renderedCompleted === capacity,
        })}
        style={{
          width: `${(100 * renderedCompleted) / capacity}%`,
        }}
      />
    </div>
  )
}
