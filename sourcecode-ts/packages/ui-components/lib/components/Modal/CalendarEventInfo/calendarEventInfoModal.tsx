import { useModalState } from '../../../hooks/useModalState'
import { GenericModal } from '../Generic/genericModal'
import { CalendarEventInfoContent } from '../CalendarEventInfoContent/calendarEventInfoContent'
import { useCalendarEventContext } from '../../../context/calendarEvent'

type Props = {
  modalState: ReturnType<typeof useModalState>['modalState']
  onModalClose: () => void
  now: Date
}

export const CalendarEventInfoModal = ({ modalState, onModalClose, now }: Props) => {
  const { title } = useCalendarEventContext()
  return (
    <GenericModal size="large" modalState={modalState} onClose={onModalClose}>
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl mb-5">{title}</h1>
        <CalendarEventInfoContent now={now} />
      </div>
    </GenericModal>
  )
}
