import { formatOrdinalNumber } from '../ordinal-numbers/formatOrdinalNumber.js'
import { pluralizeByCount } from '../pluralize/pluralizeUtils.js'

export const formatProcessItemStatus = (
  itemIndexInProcess: number,
  processItemCount: number,
  processTitle: string,
  processStartsAtUTC: Date,
  now: Date,
) =>
  `${formatOrdinalNumber(itemIndexInProcess)} of ${processItemCount} ${pluralizeByCount(
    'event',
    processItemCount,
  )} in "${processTitle}" process, ${
    processStartsAtUTC < now ? 'started' : 'starting'
  } at ${processStartsAtUTC.toLocaleString()}`
