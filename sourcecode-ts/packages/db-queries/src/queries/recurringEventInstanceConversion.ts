import { prisma } from '@calendar-from-cli/prisma'
import { transactional } from './index.js'

export const findFirstUnneededRecurringEventInstanceConversion = async (now: Date) =>
  transactional.findFirstUnneededRecurringEventInstanceConversion(prisma, now)
