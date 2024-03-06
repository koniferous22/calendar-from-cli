import ReactMarkdown from 'react-markdown'
import {
  eventFmt,
  formatRecurringEventSchedule,
  processStatus,
  processItemStatus,
} from '@calendar-from-cli/calendar-utils'
import { Hr } from '../../Hr/hr'
import { ProgressBar } from '../../ProgressBar/progressBar'
import { useCalendarEventContext } from '../../../context/calendarEvent'

type Props = {
  now: Date
}

export const CalendarEventInfoContent = ({ now }: Props) => {
  const { startsAt, endsAt, eventInfo } = useCalendarEventContext()
  return (
    <>
      <ul className="list-disc">
        <li>{`Event Start: ${startsAt.toLocaleString()} (UTC: ${eventFmt.formatUTCEventTime(startsAt)})`}</li>
        <li>{`Event End: ${endsAt.toLocaleString()} (UTC: ${eventFmt.formatUTCEventTime(endsAt)})`}</li>
      </ul>
      {eventInfo?.type === 'recurringEvent' && (
        <>
          <Hr />
          <p>{`Event is recurring - ${formatRecurringEventSchedule(eventInfo.recurringSchedule)}`}</p>
        </>
      )}
      {eventInfo?.type === 'processSnapshot' && (
        <>
          <Hr />
          <ul>
            <li>
              <span>{`Event was part of "`}</span>
              <span className="font-bold">{eventInfo.processTitle}</span>
              <span>{'" process'}</span>
            </li>
            <li>{processStatus.formatProcessItemsCompleted(eventInfo.processItemsCompleted)}</li>
          </ul>
        </>
      )}
      {eventInfo?.type === 'ongoingProcess' && (
        <>
          <Hr />
          <div className="flex flex-col">
            <ul className="list-disc mb-3">
              <li>
                {processItemStatus.formatProcessItemStatus(
                  eventInfo.eventIndexInProcess,
                  eventInfo.processEventCount,
                  eventInfo.processTitle,
                  eventInfo.processStartsAtUTC,
                  now,
                )}
              </li>
              <li>{processStatus.formatProcessItemsCompleted(eventInfo.processItemsCompleted)}</li>
            </ul>
            <ProgressBar capacity={eventInfo.processEventCount} completed={eventInfo.processItemsCompleted} />
          </div>
        </>
      )}
      {eventInfo && (
        <>
          <Hr />
          <h2 className="text-2xl">Description</h2>
          {(function () {
            switch (eventInfo.descriptionFormat) {
              case 'Plaintext':
                return <p>{eventInfo.description}</p>
              case 'Markdown':
                return <ReactMarkdown>{eventInfo.description}</ReactMarkdown>
            }
          })()}
        </>
      )}
    </>
  )
}
