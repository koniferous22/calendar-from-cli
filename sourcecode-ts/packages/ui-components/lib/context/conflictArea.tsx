import { createContext, useContext } from 'react'
import { useCalendarEventContext } from './calendarEvent'

type CalendarEvent = ReturnType<typeof useCalendarEventContext>
type ConflictArea = {
  conflictAreaStartsAt: Date
  conflictAreaEndsAt: Date
  events: [CalendarEvent, CalendarEvent, ...CalendarEvent[]]
}

const ConflictAreaContext = createContext<ConflictArea>(null as any)

type Props = {
  value: ConflictArea
  children?: React.ReactNode
}

export const ConflictAreaProvider = ({ value, children }: Props) => {
  return <ConflictAreaContext.Provider value={value}>{children}</ConflictAreaContext.Provider>
}

export const useConflictAreaContext = () => {
  return useContext(ConflictAreaContext)
}
