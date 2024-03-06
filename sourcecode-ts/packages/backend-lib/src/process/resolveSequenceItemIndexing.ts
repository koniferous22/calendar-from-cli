import { ListedProcessSnapshot, LoadedProcess } from './types.js'

const enrichArrayItemsWithSequencedIndex = <T>(items: T[], getSortingAttribute: (item: T) => number) => {
  // Sort ascending
  // Side-effects shouldn't matter here
  const sortedItems = items.sort((a, b) => getSortingAttribute(a) - getSortingAttribute(b))
  return sortedItems.map((item, index) => ({
    sequencedIndex: index + 1,
    item,
  }))
}

export const resolveSequencedProcessItemIndexing = (processFromDb: LoadedProcess) => {
  const historicEvents = processFromDb.HistoricProcessSnapshot?.HistoricEvent ?? []
  return {
    // Note - temp workaround of sorting by historicEvent.EndedAtUTC, dont' want to store process
    indexedHistoricProcessEvents: enrichArrayItemsWithSequencedIndex(historicEvents, (historicEvent) =>
      historicEvent.EndedAtUTC.getTime(),
    ).map(({ sequencedIndex, item }) => ({
      sequencedIndex,
      historicEventId: item.Id,
    })),
    indexedProcessEvents: enrichArrayItemsWithSequencedIndex(
      processFromDb.ProcessItemAttachment,
      (processItemAttachment) => processItemAttachment.Index,
    ).map(({ sequencedIndex, item }) => ({
      sequencedIndex,
      processItemAttachmentId: item.Id,
    })),
    process: processFromDb,
  }
}

export const resolveSequencedProcessSnapshotItemIndexing = (processSnapshotFromDb: ListedProcessSnapshot) => {
  const historicEvents = processSnapshotFromDb.HistoricEvent
  return {
    // Note - temp workaround of sorting by historicEvent.EndedAtUTC, dont' want to store process
    indexedHistoricProcessEvents: enrichArrayItemsWithSequencedIndex(historicEvents, (historicEvent) =>
      historicEvent.EndedAtUTC.getTime(),
    ).map(({ sequencedIndex, item }) => ({
      sequencedIndex,
      historicEventId: item.Id,
    })),
    processSnapshot: processSnapshotFromDb,
  }
}
