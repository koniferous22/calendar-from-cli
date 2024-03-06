export const cancelProcessItemSubsequentItemsBehaviour = [
  {
    value: 'cancelRest',
    name: 'Cancel',
  },
  {
    value: 'keepInPlace',
    name: 'Keep remaining events in place',
  },
  {
    value: 'preserveCalculatedOffsets',
    name: 'Preserve calculated offsets - this setting preserves gaps between events (can move events backward)',
  },
  {
    value: 'reevaluateRelations',
    name: 'Reevaluate relations - reschedules other events with relation to process specification',
  },
] as const

export const rescheduleProcessItemSubsequentItemsBehaviour = [
  {
    value: 'keepInPlace',
    name: 'Keep remaining events in place',
  },
  {
    value: 'preserveCalculatedOffsets',
    name: 'Preserve calculated offsets - this setting preserves gaps between events',
  },
  {
    value: 'reevaluateRelations',
    name: 'Reevaluate relations - reschedules other events with relation to process specification',
  },
] as const
