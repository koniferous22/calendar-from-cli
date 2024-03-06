import { pluralizeByCount } from '../pluralize/pluralizeUtils.js'

export const formatProcessStatus = (itemsCompleted: number, totalItems: number) =>
  `${itemsCompleted} out of ${totalItems} ${pluralizeByCount('event', totalItems)} completed`

export const formatProcessItemsCompleted = (itemsCompleted: number) =>
  `${itemsCompleted} ${pluralizeByCount('event', itemsCompleted)} completed`
