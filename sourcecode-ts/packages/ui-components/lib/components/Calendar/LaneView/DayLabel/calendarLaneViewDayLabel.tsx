import clsx from 'clsx'
import { formatDayOfWeek, formatOneLetterDayOfWeek } from '../../../../labels/dayOfWeek'

type LaneViewDayLabelNavigation = {
  type: 'button'
  onClick: () => void
}

type Props = {
  dayOfMonth: number
  shouldHighlightNumber?: boolean
  shouldAdaptForSmLayout?: boolean
  dayOfWeek: number
  navigation?: LaneViewDayLabelNavigation
}

export const CalendarLaneViewDayLabel = ({
  shouldHighlightNumber,
  dayOfWeek,
  dayOfMonth,
  shouldAdaptForSmLayout,
  navigation,
}: Props) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={clsx('rounded-full flex justify-center items-center', {
          'bg-highlighted-day': shouldHighlightNumber,
          'w-20': !shouldAdaptForSmLayout,
          'w-8': shouldAdaptForSmLayout,
          'sm:w-20': shouldAdaptForSmLayout,
          'h-20': !shouldAdaptForSmLayout,
          'h-8': shouldAdaptForSmLayout,
          'sm:h-20': shouldAdaptForSmLayout,
          'cursor-pointer': !!navigation,
        })}
        onClick={navigation?.onClick}
      >
        <span
          className={clsx('text-4xl text-[var(--theme-color-font)] font-semibold', {
            'text-4xl': !shouldAdaptForSmLayout,
            'md:text-4xl': shouldAdaptForSmLayout,
            'sm:text-2xl': shouldAdaptForSmLayout,
            'text-xl': shouldAdaptForSmLayout,
          })}
        >
          {dayOfMonth}
        </span>
      </div>
      {shouldAdaptForSmLayout && (
        <>
          <div className="hidden sm:block mt-2">{formatDayOfWeek(dayOfWeek)}</div>
          <div
            className={clsx('sm:hidden', {
              'mt-2': !shouldAdaptForSmLayout,
            })}
          >
            {formatOneLetterDayOfWeek(dayOfWeek)}
          </div>
        </>
      )}
      {!shouldAdaptForSmLayout && <div className="mt-2">{formatDayOfWeek(dayOfWeek)}</div>}
    </div>
  )
}
