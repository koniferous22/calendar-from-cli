import { createContext, useContext } from 'react'
import type { types } from '@calendar-from-cli/validation-lib'

type CalendarEventInfo = {
  description: string
  descriptionFormat: types.DescriptionFormat
} & (
  | {
      type: 'basic'
    }
  | {
      type: 'processSnapshot'
      processTitle: string
      processItemsCompleted: number
    }
  | {
      type: 'ongoingProcess'
      eventIndexInProcess: number
      processItemsCompleted: number
      processEventCount: number
      processTitle: string
      processStartsAtUTC: Date
    }
  | {
      type: 'recurringEvent'
      recurringSchedule: types.RecurringEventScheduleSpec
    }
)

type CalendarEvent = {
  title: string
  startsAt: Date
  endsAt: Date
  isConcealed: boolean
  duration: number
  eventTag: null | {
    color: string
    alias: string
  }
  eventInfo: null | CalendarEventInfo
}

const CalendarEventContext = createContext<CalendarEvent>(null as any)

type Props = {
  value: CalendarEvent
  children?: React.ReactNode
}

export const CalendarEventProvider = ({ value, children }: Props) => {
  return <CalendarEventContext.Provider value={value}>{children}</CalendarEventContext.Provider>
}

export const useCalendarEventContext = () => {
  return useContext(CalendarEventContext)
}
