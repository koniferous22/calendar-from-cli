import { calendarRangeIdentifier } from '@calendar-from-cli/calendar-utils'
import { types } from '@calendar-from-cli/validation-lib'
import { createContext, useContext, useReducer } from 'react'

type CalendarPermissionsView = {
  type: 'protected' | 'public'
}

type CalendarTimezoneView =
  | {
      type: 'ownerTimezone'
    }
  | {
      type: 'clientTimezone'
    }
  | {
      type: 'custom'
      timezone: string
    }

type CalendarView = {
  now: Date
  rangeView: types.CalendarRangeIdentifier
  timezoneView: CalendarTimezoneView
  permissionsView: CalendarPermissionsView
}

type CalendarViewAction =
  | {
      type: 'setNow'
      data: Date
    }
  | {
      type: 'setRangeView'
      data: types.CalendarRangeIdentifier
    }
  | {
      type: 'setPermissionsView'
      data: CalendarPermissionsView
    }
  | {
      type: 'setTimezoneView'
      data: CalendarTimezoneView
    }

const calendarViewReducer = (state: CalendarView, action: CalendarViewAction): CalendarView => {
  switch (action.type) {
    case 'setNow':
      return {
        ...state,
        now: action.data,
      }
    case 'setRangeView':
      return {
        ...state,
        rangeView: action.data,
      }
    case 'setPermissionsView':
      return {
        ...state,
        permissionsView: action.data,
      }
    case 'setTimezoneView':
      return {
        ...state,
        timezoneView: action.data,
      }
    default:
      return state
  }
}

type UseCalendarViewOptions = {
  resolvers: {
    resolveNow: () => Date
    timezone: {
      resolveOwnerTimezone: () => string
      resolveClientTimezone: () => string
    }
    resolveCanAccessPast: () => boolean
  }
  effects: {
    onCalendarRangeViewChanged: (calendarRangeView: types.CalendarRangeIdentifier) => void
    onCalendarPermissionsViewChange: (calendarPermissionsView: CalendarPermissionsView) => void
    onCalendarTimezoneViewChanged: (calendarRangeView: CalendarTimezoneView) => void
  }
  initialState: ReturnType<typeof calendarViewReducer>
}

const useCalendarView = ({ resolvers, effects, initialState }: UseCalendarViewOptions) => {
  const [ctx, dispatch] = useReducer(calendarViewReducer, initialState)
  const ownerTimezone = resolvers.timezone.resolveOwnerTimezone()
  const clientTimezone = resolvers.timezone.resolveClientTimezone()
  let timezone: string
  switch (ctx.timezoneView.type) {
    case 'ownerTimezone':
      timezone = ownerTimezone
      break
    case 'clientTimezone':
      timezone = clientTimezone
      break
    case 'custom':
      timezone = ctx.timezoneView.timezone
      break
  }
  const validateCanAccessCalendarRangeView = (rangeView: types.CalendarRangeIdentifier) =>
    resolvers.resolveCanAccessPast() ||
    calendarRangeIdentifier.validateCalendarRangeIdentifierNotPast(rangeView, timezone, ctx.now)
  const syncNow = () =>
    dispatch({
      type: 'setNow',
      data: resolvers.resolveNow(),
    })
  const setRangeView = (rangeView: types.CalendarRangeIdentifier) => {
    if (validateCanAccessCalendarRangeView(rangeView)) {
      dispatch({
        type: 'setRangeView',
        data: rangeView,
      })
      effects.onCalendarRangeViewChanged(rangeView)
    }
  }
  const setPermissionsView = (permissionsView: CalendarPermissionsView) => {
    dispatch({
      type: 'setPermissionsView',
      data: permissionsView,
    })
    effects.onCalendarPermissionsViewChange(permissionsView)
  }
  const setTimezoneView = (timezoneView: CalendarTimezoneView) => {
    dispatch({
      type: 'setTimezoneView',
      data: timezoneView,
    })
    effects.onCalendarTimezoneViewChanged(timezoneView)
  }
  const isClientFromSameTimezone = ownerTimezone === clientTimezone
  const calendarRangeInterval = calendarRangeIdentifier.calendarRangeIdentifierToInterval(ctx.rangeView, timezone)

  const callbacks = {
    syncNow,
    setRangeView,
    setPermissionsView,
    setTimezoneView,
  }
  return {
    ctx,
    callbacks,
    utils: {
      timezone,
      isClientFromSameTimezone,
      calendarRangeInterval,
      validateCanAccessCalendarRangeView,
    },
  }
}

const CalendarEventContext = createContext<ReturnType<typeof useCalendarView>>(null as any)

type Props = {
  options: Parameters<typeof useCalendarView>[0]
  children?: React.ReactNode
}

export const CalendarViewProvider = ({ options, children }: Props) => {
  const value = useCalendarView(options)
  return <CalendarEventContext.Provider value={value}>{children}</CalendarEventContext.Provider>
}

export const useCalendarViewContext = () => {
  return useContext(CalendarEventContext)
}
