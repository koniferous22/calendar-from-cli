import { eventFmt } from '@calendar-from-cli/calendar-utils'
import { useModalState } from '../../../hooks/useModalState'
import { Accordion } from '../../Accordion/accordion'
import { CalendarEventInfoContent } from '../CalendarEventInfoContent/calendarEventInfoContent'
import { GenericModal } from '../Generic/genericModal'
import { useConflictAreaContext } from '../../../context/conflictArea'
import { useCalendarViewContext } from '../../../context/calendarView'
import { CalendarEventProvider } from '../../../context/calendarEvent'

type Props = {
  modalState: ReturnType<typeof useModalState>['modalState']
  onModalClose: () => void
}

export const ConflictAreaModal = ({ modalState, onModalClose }: Props) => {
  const { ctx } = useCalendarViewContext()
  const { conflictAreaStartsAt, conflictAreaEndsAt, events } = useConflictAreaContext()
  const formattedConflictAreaDuration = `${eventFmt.formatZonedEventTime(
    conflictAreaStartsAt,
  )}-${eventFmt.formatZonedEventTime(conflictAreaEndsAt)}`
  return (
    <GenericModal size="large" modalState={modalState} onClose={onModalClose}>
      <div className="flex items center flex-col gap-5">
        <h1 className="text-3xl mb-5">{`Events during ${formattedConflictAreaDuration} period`}</h1>
        <Accordion
          items={events.map((event) => ({
            title: event.title,
            content: (
              <CalendarEventProvider value={event}>
                <div className="p-3 flex flex-col gap-3">
                  <CalendarEventInfoContent now={ctx.now} />
                </div>
              </CalendarEventProvider>
            ),
          }))}
          background="component"
        />
      </div>
    </GenericModal>
  )
}
