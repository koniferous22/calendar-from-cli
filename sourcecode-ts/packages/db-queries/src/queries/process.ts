import { prisma } from '@calendar-from-cli/prisma'
import { transactional } from './index.js'

export const findProcessById = async (id: number) => transactional.findProcessById(prisma, id)

export const listUpcomingProcesses = async () => transactional.listUpcomingProcesses(prisma)

export const listProcessesByProcessAttachmentIds = async (processAttachmentIds: number[]) =>
  transactional.listProcessesByProcessAttachmentIds(prisma, processAttachmentIds)
