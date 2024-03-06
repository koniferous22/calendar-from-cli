import { CalendarLane } from '../Lane/calendarLane'
import { LaneViewHeaderItem } from '../HeaderItem/laneViewHeaderItem'
import { CalendarLaneViewLegend } from '../Legend/calendarLaneViewLegend'
import { CalendarLaneViewDayLabel } from '../DayLabel/calendarLaneViewDayLabel'
import { zonedRangeInterval } from '@calendar-from-cli/calendar-utils'
import { useCalendarViewContext } from '../../../../context/calendarView'
import { types } from '@calendar-from-cli/validation-lib'

type DayGridLayoutProps = {
  children?: React.ReactNode
}

const DayGridLayout = ({ children }: DayGridLayoutProps) => {
  return <div className="grid grid-cols-[2.5rem,1fr] sm:grid-cols-[4rem,1fr] grid-rows-[120px,1fr]">{children}</div>
}

type RenderingOptions = Parameters<typeof CalendarLane>[0]['renderingOptions']

type Props = {
  identifier: Extract<types.CalendarRangeIdentifier, { type: 'dayLaneView' }>['identifier']
  dayOfWeek: number
  now: Date
  renderingOptions: Omit<RenderingOptions, 'eventInfo' | 'tooltipDirection'>
  events: Parameters<typeof CalendarLane>[0]['events']
}

export const CalendarDayLaneView = ({ identifier, dayOfWeek, now, events, renderingOptions }: Props) => {
  const { year, month, dayOfMonth } = identifier
  const { utils, callbacks } = useCalendarViewContext()
  const { timezone } = utils
  const [dayLaneStart, dayLaneEnd] = zonedRangeInterval.createZonedDayInterval(year, month, dayOfMonth, timezone)
  const isCurrentDay = year === now.getFullYear() && month === now.getMonth() && dayOfMonth === now.getDate()
  return (
    <DayGridLayout>
      <LaneViewHeaderItem />
      <LaneViewHeaderItem>
        <CalendarLaneViewDayLabel
          dayOfWeek={dayOfWeek}
          dayOfMonth={dayOfMonth}
          shouldHighlightNumber={isCurrentDay}
          navigation={{
            type: 'button',
            onClick: () =>
              callbacks.setRangeView({
                type: 'dayLaneView',
                identifier,
              }),
          }}
        />
      </LaneViewHeaderItem>
      <CalendarLaneViewLegend />
      <CalendarLane
        laneStart={dayLaneStart}
        laneEnd={dayLaneEnd}
        events={events}
        shouldContrastLeftBorder
        renderingOptions={{
          ...renderingOptions,
          tooltipDirection: {
            conflictArea: 'below',
            event: 'below',
            eventTag: 'left',
          },
          eventInfo: {
            maxAllowedShortEventInfo: 'all',
            smMaxAllowedShortEventInfo: 'all',
          },
        }}
      />
    </DayGridLayout>
  )
}
