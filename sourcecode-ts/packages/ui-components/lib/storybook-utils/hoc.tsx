import { ReactNode } from 'react'
import { CalendarViewProvider } from '../context/calendarView'
import { CalendarEventProvider } from '../context/calendarEvent'
import { ConflictAreaProvider } from '../context/conflictArea'
import { LoaderProvider } from '../context/loader'

type WithLoaderOptions = {
  isLoading: boolean
  shouldDisplayLoaderOverlay: boolean
}

export const withLoader = <T extends {}>(
  { isLoading, shouldDisplayLoaderOverlay }: WithLoaderOptions,
  Component: (props: T) => ReactNode,
) => {
  return (props: T) => {
    return (
      <LoaderProvider shouldDisplayLoaderOverlay={shouldDisplayLoaderOverlay} isLoading={isLoading}>
        <Component {...props} />
      </LoaderProvider>
    )
  }
}

type CalendarViewContextOptions = Parameters<typeof CalendarViewProvider>[0]['options']

export const withCalendarView = <T extends {}>(
  ctxOptions: CalendarViewContextOptions,
  Component: (props: T) => ReactNode,
) => {
  return (props: T) => {
    return (
      <CalendarViewProvider options={ctxOptions}>
        <Component {...props} />
      </CalendarViewProvider>
    )
  }
}

type CalendarEvent = Parameters<typeof CalendarEventProvider>[0]['value']

export const withCalendarEvent = <T extends {}>(calendarEvent: CalendarEvent, Component: (props: T) => ReactNode) => {
  return (props: T) => {
    return (
      <CalendarEventProvider value={calendarEvent}>
        <Component {...props} />
      </CalendarEventProvider>
    )
  }
}

type ConflictArea = Parameters<typeof ConflictAreaProvider>[0]['value']

export const withConflictArea = <T extends {}>(conflictArea: ConflictArea, Component: (props: T) => ReactNode) => {
  return (props: T) => {
    return (
      <ConflictAreaProvider value={conflictArea}>
        <Component {...props} />
      </ConflictAreaProvider>
    )
  }
}
