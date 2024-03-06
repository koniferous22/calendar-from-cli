import { eventFmt } from '@calendar-from-cli/calendar-utils'
import { useModalState } from '../../hooks/useModalState'
import { ConflictAreaModal } from '../Modal/ConflictArea/conflictAreaModal'
import { Tooltip } from '../Tooltip/Generic/genericTooltip'
import clsx from 'clsx'
import { useCalendarEventContext } from '../../context/calendarEvent'
import { useConflictAreaContext } from '../../context/conflictArea'

type TooltipDirection = Parameters<typeof Tooltip>[0]['direction']
type CalendarEvent = ReturnType<typeof useCalendarEventContext>

type Props = {
  isBlurred?: boolean
  isDampened?: boolean
  isConflictAreaModalEnabled?: boolean
  tooltipDirection: TooltipDirection
  trimmingOptions: {
    isTrimmedAtStart: boolean
    isTrimmedAtEnd: boolean
  }
}

const formatConflictingEventTooltipContent = ({ title, startsAt, endsAt }: CalendarEvent) =>
  `- "${title}" (${eventFmt.formatZonedEventTime(startsAt)}-${eventFmt.formatZonedEventTime(endsAt)})`

export const ConflictArea = ({
  tooltipDirection,
  trimmingOptions,
  isBlurred,
  isDampened,
  isConflictAreaModalEnabled,
}: Props) => {
  const { events } = useConflictAreaContext()
  const { modalState, openModalHandler, closeModalHandler } = useModalState()
  const { isTrimmedAtStart, isTrimmedAtEnd } = trimmingOptions
  const smConflictArea = (
    <div
      className={clsx('bg-striped w-full h-full', {
        rounded: !isTrimmedAtStart && !isTrimmedAtEnd,
        'rounded-t': !isTrimmedAtStart && isTrimmedAtEnd,
        'rounded-b': isTrimmedAtStart && !isTrimmedAtEnd,
        'cursor-pointer': !isBlurred && isConflictAreaModalEnabled,
        'opacity-75': isDampened,
      })}
      onClick={openModalHandler}
    />
  )
  let conflictArea = smConflictArea
  if (isConflictAreaModalEnabled) {
    const tooltipContent = [`${events.length} ongoing events`].concat(events.map(formatConflictingEventTooltipContent))
    conflictArea = (
      <Tooltip content={tooltipContent} shouldCenterOnSecondaryAxis direction={tooltipDirection} minWidth={200}>
        {conflictArea}
      </Tooltip>
    )
  }
  return (
    <>
      {isConflictAreaModalEnabled && <ConflictAreaModal modalState={modalState} onModalClose={closeModalHandler} />}
      <div
        className={clsx('sm:hidden w-full h-full', {
          'blur-sm': isBlurred,
        })}
      >
        {smConflictArea}
      </div>
      <div
        className={clsx('hidden sm:block w-full h-full ', {
          'blur-sm': isBlurred,
        })}
      >
        {conflictArea}
      </div>
    </>
  )
}
