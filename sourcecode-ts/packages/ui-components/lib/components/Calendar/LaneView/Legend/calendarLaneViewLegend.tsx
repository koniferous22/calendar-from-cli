import clsx from 'clsx'
import { calendarLaneViewHours } from '../../../../constants'

export const CalendarLaneViewLegend = () => {
  return (
    <div>
      {Array.from({ length: calendarLaneViewHours + 1 }).map((_, hour) => (
        <div key={hour} className="flex">
          <div
            className={clsx('grow text-xs sm:text-base sm:text-right pr-[0.25rem] translate-y-[-0.75rem]', {
              'h-0': hour === calendarLaneViewHours,
            })}
          >{`${hour}:00`}</div>
          <div
            className={clsx('w-[0.5rem] border-t border-[var(--theme-color-grid)]', {
              'h-0': hour === calendarLaneViewHours,
              'h-[3rem]': hour !== calendarLaneViewHours,
            })}
          />
        </div>
      ))}
    </div>
  )
}
