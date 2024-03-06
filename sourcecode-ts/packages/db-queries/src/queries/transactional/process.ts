import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'
import { findProcessTemplateByAlias } from '../processTemplate.js'
import { resolveValueByAccessScope } from '../../concepts/transparencyScope.js'
import { ScheduleProcessFallbackPublicValues } from '../../types/input/process.js'

export const findProcessById = async (pc: PrismaClientReusableInTransactions, id: number) => {
  const now = new Date()
  return pc.process.findFirst({
    include: {
      ProcessSourceReference: true,
      ProcessItemAttachment: {
        include: {
          EventSourceReference: {
            include: {
              Event: true,
            },
          },
        },
      },
      HistoricProcessSnapshot: {
        include: {
          HistoricEvent: true,
        },
      },
    },
    where: {
      Id: id,
      UpdatedAt: now,
    },
  })
}

export const listUpcomingProcesses = async (pc: PrismaClientReusableInTransactions) => {
  const now = new Date()
  return pc.process.findMany({
    include: {
      ProcessSourceReference: true,
      ProcessItemAttachment: {
        include: {
          EventSourceReference: {
            include: {
              Event: true,
            },
          },
        },
      },
      HistoricProcessSnapshot: {
        include: {
          HistoricEvent: true,
        },
      },
    },
    where: {
      ProcessState: 'Active',
      StartsAtUTC: {
        gt: now,
      },
    },
  })
}

export const listProcessesByProcessAttachmentIds = async (
  pc: PrismaClientReusableInTransactions,
  processItemAttachmentIds: number[],
) => {
  return pc.process.findMany({
    include: {
      ProcessSourceReference: true,
      ProcessItemAttachment: {
        include: {
          EventSourceReference: {
            include: {
              Event: true,
            },
          },
        },
      },
      HistoricProcessSnapshot: {
        include: {
          HistoricEvent: true,
        },
      },
    },
    where: {
      ProcessItemAttachment: {
        some: {
          Id: {
            in: processItemAttachmentIds,
          },
        },
      },
    },
  })
}

export const cancelProcess = async (pc: PrismaClientReusableInTransactions, id: number) => {
  const now = new Date()
  return pc.process.update({
    where: {
      Id: id,
    },
    data: {
      UpdatedAt: now,
      ProcessState: 'Cancelled',
    },
  })
}

export const scheduleProcessFromProcessTemplate = async (
  pc: PrismaClientReusableInTransactions,
  processTemplate: NonNullable<Awaited<ReturnType<typeof findProcessTemplateByAlias>>>,
  { fallbackPublicTitle, fallbackPublicDescription }: ScheduleProcessFallbackPublicValues,
  scheduleBaselineUTC: Date,
  now: Date,
) => {
  const titlesByScope = {
    Private: processTemplate.Title,
    Protected: processTemplate.ProtectedTitle,
    Public: processTemplate.PublicTitle,
  }
  const descriptionsByScope = {
    Private: {
      content: processTemplate.Description,
      format: processTemplate.DescriptionFormat,
    },
    Protected:
      processTemplate.ProtectedDescription !== null && processTemplate.ProtectedDescriptionFormat !== null
        ? {
            content: processTemplate.ProtectedDescription,
            format: processTemplate.ProtectedDescriptionFormat,
          }
        : null,
    Public:
      processTemplate.PublicDescription !== null && processTemplate.PublicDescriptionFormat !== null
        ? {
            content: processTemplate.PublicDescription,
            format: processTemplate.PublicDescriptionFormat,
          }
        : null,
  }
  const resolvedPrivateDescription = resolveValueByAccessScope(
    'Private',
    processTemplate.TransparencyScope,
    descriptionsByScope,
    fallbackPublicDescription,
  )
  const resolvedProtectedDescription = resolveValueByAccessScope(
    'Protected',
    processTemplate.TransparencyScope,
    descriptionsByScope,
    fallbackPublicDescription,
  )
  const resolvedPublicDescription = resolveValueByAccessScope(
    'Public',
    processTemplate.TransparencyScope,
    descriptionsByScope,
    fallbackPublicDescription,
  )
  return pc.process.create({
    include: {
      ProcessSourceReference: true,
    },
    data: {
      CreatedAt: now,
      UpdatedAt: now,
      ProcessSourceReference: {
        create: {
          ProcessSourceType: 'ProcessTemplate' as const,
          ProcessTemplateId: processTemplate.Id,
        },
      },
      ProcessState: 'Active',
      TransparencyScope: processTemplate.TransparencyScope,
      Title: processTemplate.Title,
      Description: resolvedPrivateDescription.content,
      DescriptionFormat: resolvedPrivateDescription.format,
      ProtectedTitle: resolveValueByAccessScope(
        'Protected',
        processTemplate.TransparencyScope,
        titlesByScope,
        fallbackPublicTitle,
      ),
      ProtectedDescription: resolvedProtectedDescription.content,
      ProtectedDescriptionFormat: resolvedProtectedDescription.format,
      PublicTitle: resolveValueByAccessScope(
        'Public',
        processTemplate.TransparencyScope,
        titlesByScope,
        fallbackPublicTitle,
      ),
      PublicDescription: resolvedPublicDescription.content,
      PublicDescriptionFormat: resolvedPublicDescription.format,
      Notifications: processTemplate.Notifications,
      ...(!!processTemplate.EventTagId
        ? {
            EventTag: {
              connect: {
                Id: processTemplate.EventTagId,
              },
            },
          }
        : {}),
      ScheduleBaselineUTC: scheduleBaselineUTC,
      // Note - temporary setting, as you need to calculate items 1st in order to resolve this attribute
      // StartsAtUTC is expectedt to be updated after the items are inserted, with "updateProcessStartByProcessId"
      StartsAtUTC: scheduleBaselineUTC,
      ProcessColor: processTemplate.ProcessColor,
    },
  })
}

export const updateProcessStartByProcessId = async (
  pc: PrismaClientReusableInTransactions,
  processId: number,
  processStartsAtUTC: Date,
) => {
  return pc.process.update({
    where: {
      Id: processId,
    },
    data: {
      StartsAtUTC: processStartsAtUTC,
    },
  })
}

export const bulkRemoveEmptyProcesses = async (pc: PrismaClientReusableInTransactions, olderThanUTC: Date) => {
  return pc.process.deleteMany({
    where: {
      ProcessItemAttachment: {
        none: {},
      },
      UpdatedAt: {
        lt: olderThanUTC,
      },
    },
  })
}
