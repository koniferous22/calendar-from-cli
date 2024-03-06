import { prisma } from '@calendar-from-cli/prisma'

export const findProcessItemAttachmentById = async (id: number) => {
  return prisma.processItemAttachment.findUnique({
    include: {
      Process: true,
    },
    where: {
      Id: id,
    },
  })
}

export const findPreviousActiveProcessItemBefore = async (processId: number, attachmentIndex: number) => {
  return prisma.processItemAttachment.findFirst({
    include: {
      EventSourceReference: {
        include: {
          Event: true,
        },
      },
    },
    orderBy: {
      Index: 'desc',
    },
    where: {
      ProcessId: processId,
      Index: {
        lt: attachmentIndex,
      },
    },
  })
}

export const findNextActiveProcessItemAfter = async (processId: number, attachmentIndex: number) => {
  return prisma.processItemAttachment.findFirst({
    include: {
      EventSourceReference: {
        include: {
          Event: true,
        },
      },
    },
    orderBy: {
      Index: 'asc',
    },
    where: {
      ProcessId: processId,
      Index: {
        gt: attachmentIndex,
      },
    },
  })
}
