import React from 'react'
import { calendarRangeIdentifier, zonedRangeInterval } from '@calendar-from-cli/calendar-utils'
import { LaneViewHeaderItem } from '../HeaderItem/laneViewHeaderItem'
import { CalendarLane } from '../Lane/calendarLane'
import { CalendarLaneViewLegend } from '../Legend/calendarLaneViewLegend'
import { CalendarLaneViewDayLabel } from '../DayLabel/calendarLaneViewDayLabel'
import { addDays } from 'date-fns'
import { useCalendarViewContext } from '../../../../context/calendarView'
import { types } from '@calendar-from-cli/validation-lib'

type WeekLaneViewRangeIdentifier = Extract<types.CalendarRangeIdentifier, { type: 'weekLaneView' }>['identifier']

type RenderingOptions = Parameters<typeof CalendarLane>[0]['renderingOptions']

type WeekGridLayoutProps = {
  children?: React.ReactNode
}

const WeekGridLayout = ({ children }: WeekGridLayoutProps) => {
  return (
    <div className="grid grid-cols-[2.5rem,1fr,1fr,1fr,1fr,1fr,1fr,1fr] sm:grid-cols-[4rem,1fr,1fr,1fr,1fr,1fr,1fr,1fr] grid-rows-[80px,1fr] sm:grid-rows-[120px,1fr]">
      {children}
    </div>
  )
}

type Props = {
  identifier: WeekLaneViewRangeIdentifier
  navigation: {
    goToDay: {
      type: 'button'
      onClick: (date: Date) => void
    }
  }
  renderingOptions: Omit<RenderingOptions, 'eventInfo' | 'tooltipDirection'>
  events: Parameters<typeof CalendarLane>[0]['events']
}

export const CalendarWeekLaneView = ({ identifier, renderingOptions, events, navigation }: Props) => {
  const { year, month, dayOfMonth } = identifier
  const { ctx, utils, callbacks } = useCalendarViewContext()
  const { now } = ctx
  const { timezone } = utils
  const [weekLaneStart] = zonedRangeInterval.createZonedWeekInterval(year, month, dayOfMonth, timezone)
  const daysOfWeek = Array.from({ length: 7 }).map((_, dayIndex) => ({
    laneStart: addDays(weekLaneStart, dayIndex),
    laneEnd: addDays(weekLaneStart, dayIndex + 1),
  }))
  return (
    <WeekGridLayout>
      <LaneViewHeaderItem />
      {daysOfWeek.map(({ laneStart }, dayIndex) => {
        const dayRangeIdentifier = calendarRangeIdentifier.calendarRangeIdentifierFromDate(laneStart, 'dayLaneView')
        let dayLabelNavigation: Parameters<typeof CalendarLaneViewDayLabel>[0]['navigation'] = undefined
        if (utils.validateCanAccessCalendarRangeView(dayRangeIdentifier)) {
          switch (navigation.goToDay.type) {
            case 'button':
              dayLabelNavigation = {
                type: 'button',
                onClick: () => callbacks.setRangeView(dayRangeIdentifier),
              }
          }
        }
        return (
          <LaneViewHeaderItem key={dayIndex}>
            <CalendarLaneViewDayLabel
              dayOfWeek={dayIndex}
              dayOfMonth={laneStart.getDate()}
              shouldHighlightNumber={
                now.getFullYear() === laneStart.getFullYear() &&
                now.getMonth() === laneStart.getMonth() &&
                now.getDate() === laneStart.getDate()
              }
              shouldAdaptForSmLayout
              navigation={dayLabelNavigation}
            />
          </LaneViewHeaderItem>
        )
      })}
      <CalendarLaneViewLegend />
      {daysOfWeek.map(({ laneStart, laneEnd }, dayIndex) => {
        const eventsInDayOfWeek = events.filter(({ startsAt, endsAt }) => startsAt < laneEnd && endsAt > laneStart)
        return (
          <CalendarLane
            key={dayIndex}
            shouldContrastLeftBorder={dayIndex === 0}
            laneStart={laneStart}
            laneEnd={laneEnd}
            events={eventsInDayOfWeek}
            renderingOptions={{
              ...renderingOptions,
              tooltipDirection: {
                conflictArea: 'below',
                event: 'below',
                eventTag: dayIndex === 6 ? 'left' : 'right',
              },
              eventInfo: {
                maxAllowedShortEventInfo: 'nothing',
                smMaxAllowedShortEventInfo: 'all',
              },
            }}
          />
        )
      })}
    </WeekGridLayout>
  )
}
