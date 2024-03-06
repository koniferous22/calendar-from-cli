import { Fragment } from 'react'
import { calendarDaysOfWeek } from '../../../../constants'
import { formatDayOfWeek, formatOneLetterDayOfWeek } from '../../../../labels/dayOfWeek'
import { WeekGridLayout } from '../MonthGridLayout/calendarMonthCellViewGridLayout'

export const MonthCellViewHeader = () => {
  return (
    <WeekGridLayout>
      {Array(calendarDaysOfWeek)
        .fill(null)
        .map((_, dayOfWeekIndex) => (
          <Fragment key={dayOfWeekIndex}>
            <div className="hidden sm:block mb-2 text-center">{formatDayOfWeek(dayOfWeekIndex)}</div>
            <div className="sm:hidden mb-2 text-center">{formatOneLetterDayOfWeek(dayOfWeekIndex)}</div>
          </Fragment>
        ))}
    </WeekGridLayout>
  )
}
