import { prisma } from '@calendar-from-cli/prisma'
import { transactional } from './index.js'

export const getLatestMigratePastExecution = async () => transactional.getLatestMigratePastExecution(prisma)

export const commitNewMigratePastExecution = async (executedAt: Date) =>
  transactional.commitNewMigratePastExecution(prisma, executedAt)
