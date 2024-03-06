import { duration } from '@calendar-from-cli/calendar-utils'
import { useCalendarEventContext } from '../../context/calendarEvent'

type BuildEventOptions = {
  startsAt: Date
  endsAt: Date
  title: string
  isConcealed?: boolean
}

type CalendarEvent = ReturnType<typeof useCalendarEventContext>

export const buildBasicEvent = ({ startsAt, endsAt, title, isConcealed }: BuildEventOptions): CalendarEvent => ({
  title,
  startsAt,
  endsAt,
  duration: duration.timeDiffInMinutes(endsAt, startsAt),
  eventInfo: {
    type: 'basic',
    description: 'Example Event Description',
    descriptionFormat: 'Plaintext',
  },
  eventTag: null,
  isConcealed: !!isConcealed,
})
