import { prisma } from '@calendar-from-cli/prisma'
import { transactional } from './index.js'

export const findRecurringEventInstanceById = (id: number) => transactional.findRecurringEventInstanceById(prisma, id)

export const findFirstUnconvertedRecurringEventInstanceEndingEarlierThan = (untilUTC: Date) =>
  transactional.findFirstUnconvertedRecurringEventInstanceEndingEarlierThan(prisma, untilUTC)
