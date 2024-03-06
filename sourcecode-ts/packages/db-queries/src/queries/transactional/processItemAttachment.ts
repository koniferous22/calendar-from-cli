import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'
import { ProcessItemAttachmentIndexAndCalculatedOffsetUpdate } from '../../types/input/processItemAttachment.js'

export const deactivateProcessItemAttachment = async (
  pc: PrismaClientReusableInTransactions,
  processItemAttachmentId: number,
) => {
  return pc.processItemAttachment.update({
    where: {
      Id: processItemAttachmentId,
    },
    data: {
      IsActive: false,
    },
  })
}

export const bulkDeactivateProcessItemAttachments = (
  pc: PrismaClientReusableInTransactions,
  processItemAttachmentIds: number[],
  now: Date,
) => {
  return pc.processItemAttachment.updateMany({
    where: {
      Id: {
        in: processItemAttachmentIds,
      },
    },
    data: {
      UpdatedAt: now,
      IsActive: false,
    },
  })
}

export const bulkIncrementProcessItemAttachemntIndex = (
  pc: PrismaClientReusableInTransactions,
  processItemAttachmentIds: number[],
  now: Date,
) => {
  return pc.processItemAttachment.updateMany({
    where: {
      Id: {
        in: processItemAttachmentIds,
      },
    },
    data: {
      Index: {
        increment: 1,
      },
    },
  })
}

export const bulkUpdateProcessItemAttachmentCalculatedOffsets = (
  pc: PrismaClientReusableInTransactions,
  processItemAttachmentCalculatedOffsetUpdates: ProcessItemAttachmentIndexAndCalculatedOffsetUpdate[],
  now: Date,
) => {
  return Promise.all(
    processItemAttachmentCalculatedOffsetUpdates.map(async ({ Id, Index, CalculatedItemOffsetInMinutes }) =>
      pc.processItemAttachment.update({
        where: {
          Id,
        },
        data: {
          Index,
          CalculatedItemOffsetInMinutes,
          UpdatedAt: now,
        },
      }),
    ),
  )
}

export const bulkRemoveProcessItemAttachmentByIds = (pc: PrismaClientReusableInTransactions, ids: number[]) => {
  return pc.processItemAttachment.deleteMany({
    where: {
      Id: {
        in: ids,
      },
    },
  })
}
