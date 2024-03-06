import { queries } from '@calendar-from-cli/db-queries'

type ResolvedProcessFromEvent = NonNullable<
  Awaited<
    ReturnType<typeof queries.transactional.listEventsFromProcessItemAttachmentEndingEarlierThan>
  >[number]['EventSourceReference']['ProcessItemAttachment']
>['Process']
type ProcessSnapshot = NonNullable<Awaited<ReturnType<typeof queries.transactional.findHistoricProcessSnapshotById>>>

export const compareProcessFieldsWithHistoricProcessSnapshot = (
  calendarProcess: ResolvedProcessFromEvent,
  snapshot: ProcessSnapshot,
) => {
  return (
    snapshot.OriginalStartsAtUTC.getTime() === calendarProcess.StartsAtUTC.getTime() &&
    snapshot.Title === calendarProcess.Title &&
    snapshot.Description === calendarProcess.Description &&
    snapshot.PublicTitle === calendarProcess.PublicTitle &&
    snapshot.PublicDescription === calendarProcess.PublicDescription &&
    snapshot.ProtectedTitle === calendarProcess.ProtectedTitle &&
    snapshot.ProtectedDescription === calendarProcess.ProtectedDescription &&
    snapshot.ProcessColor === calendarProcess.ProcessColor
  )
}
