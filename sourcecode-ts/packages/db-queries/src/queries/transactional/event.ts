import { Event as CalendarEvent, EventSourceType } from '@prisma/client'
import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'
import { duration } from '@calendar-from-cli/calendar-utils'
import { $Enums, EventTemplate } from '@prisma/client'
import { resolveValueByAccessScope } from '../../concepts/transparencyScope.js'
import { findRecurringEventInstanceById } from '../recurringEventInstance.js'
import { findProcessTemplateByAlias } from './processTemplate.js'
import {
  CommonEventFields,
  ConvertRecurringEventInstanceOptions,
  ProcessEventRescheduleUpdate,
  ScheduleEventFallbackPublicValues,
} from '../../types/input/event.js'

const resolveCommonFields = (
  adHocInput: CommonEventFields,
  { fallbackPublicTitle, fallbackPublicDescription }: ScheduleEventFallbackPublicValues,
  eventTagId: number | null,
  now: Date,
) => {
  const titlesByScope = {
    Private: adHocInput.Title,
    Protected: adHocInput.ProtectedTitle,
    Public: adHocInput.PublicTitle,
  }
  const descriptionsByScope = {
    Private: {
      content: adHocInput.Description,
      format: adHocInput.DescriptionFormat,
    },
    Protected:
      adHocInput.ProtectedDescription !== null && adHocInput.ProtectedDescriptionFormat !== null
        ? {
            content: adHocInput.ProtectedDescription,
            format: adHocInput.ProtectedDescriptionFormat,
          }
        : null,
    Public:
      adHocInput.PublicDescription !== null && adHocInput.PublicDescriptionFormat !== null
        ? {
            content: adHocInput.PublicDescription,
            format: adHocInput.PublicDescriptionFormat,
          }
        : null,
  }
  const resolvedPrivateDescription = resolveValueByAccessScope(
    'Private',
    adHocInput.TransparencyScope,
    descriptionsByScope,
    fallbackPublicDescription,
  )
  const resolvedProtectedDescription = resolveValueByAccessScope(
    'Protected',
    adHocInput.TransparencyScope,
    descriptionsByScope,
    fallbackPublicDescription,
  )
  const resolvedPublicDescription = resolveValueByAccessScope(
    'Public',
    adHocInput.TransparencyScope,
    descriptionsByScope,
    fallbackPublicDescription,
  )
  return {
    CreatedAt: now,
    UpdatedAt: now,
    EventState: 'Active' as const,
    TransparencyScope: adHocInput.TransparencyScope,
    Title: adHocInput.Title,
    Description: resolvedPrivateDescription.content,
    DescriptionFormat: resolvedPrivateDescription.format,
    ProtectedTitle: resolveValueByAccessScope(
      'Protected',
      adHocInput.TransparencyScope,
      titlesByScope,
      fallbackPublicTitle,
    ),
    ProtectedDescription: resolvedProtectedDescription.content,
    ProtectedDescriptionFormat: resolvedProtectedDescription.format,
    PublicTitle: resolveValueByAccessScope('Public', adHocInput.TransparencyScope, titlesByScope, fallbackPublicTitle),
    PublicDescription: resolvedPublicDescription.content,
    PublicDescriptionFormat: resolvedPublicDescription.format,
    ...(!!eventTagId
      ? {
          EventTag: {
            connect: {
              Id: eventTagId,
            },
          },
        }
      : {}),
    Duration: adHocInput.Duration,
    ScheduledAtUTC: adHocInput.ScheduledAtUTC,
    EndsAtUTC: duration.calculateEndsAtFromBeginAndDuration(adHocInput.ScheduledAtUTC, adHocInput.Duration),
  }
}

const resolveCommonEventFieldsFromTemplate = (
  eventTemplate: EventTemplate,
  fallbackPublicValues: ScheduleEventFallbackPublicValues,
  scheduledAtUTC: Date,
  now: Date,
) =>
  resolveCommonFields(
    {
      ...eventTemplate,
      ScheduledAtUTC: scheduledAtUTC,
    },
    fallbackPublicValues,
    eventTemplate.EventTagId,
    now,
  )

export const scheduleEventFromAdHocInput = async (
  pc: PrismaClientReusableInTransactions,
  adHocInput: CommonEventFields,
  fallbackPublicValues: ScheduleEventFallbackPublicValues,
  eventTagId: number | null,
) => {
  const now = new Date()
  return pc.event.create({
    include: {
      EventSourceReference: true,
    },
    data: {
      ...resolveCommonFields(adHocInput, fallbackPublicValues, eventTagId, now),
      EventSourceReference: {
        create: {
          EventSourceType: 'AdHoc',
        },
      },
    },
  })
}

export const scheduleEventFromTemplate = async (
  pc: PrismaClientReusableInTransactions,
  eventTemplate: EventTemplate,
  fallbackPublicValues: ScheduleEventFallbackPublicValues,
  scheduledAtUTC: Date,
) => {
  const now = new Date()
  return pc.event.create({
    include: {
      EventSourceReference: true,
    },
    data: {
      ...resolveCommonEventFieldsFromTemplate(eventTemplate, fallbackPublicValues, scheduledAtUTC, now),
      Metadata: eventTemplate.Metadata as any,
      EventSourceReference: {
        create: {
          EventSourceType: $Enums.EventSourceType.EventTemplate,
          EventTemplateId: eventTemplate.Id,
        },
      },
    },
  })
}

export const scheduleEventAsProcessItem = async (
  pc: PrismaClientReusableInTransactions,
  processTemplateItem: NonNullable<
    Awaited<ReturnType<typeof findProcessTemplateByAlias>>
  >['ProcessTemplateItem'][number],
  fallbackPublicValues: ScheduleEventFallbackPublicValues,
  scheduledAtUTC: Date,
  calculatedOffsetInMinutes: number,
  processId: number,
  defaultEventTagId: number | null,
  now: Date,
) => {
  return pc.event.create({
    include: {
      EventSourceReference: {
        include: {
          ProcessItemAttachment: true,
        },
      },
    },
    data: {
      ...resolveCommonEventFieldsFromTemplate(
        {
          ...processTemplateItem.EventTemplate,
          EventTagId: processTemplateItem.EventTemplate.EventTagId ?? defaultEventTagId,
        },
        fallbackPublicValues,
        scheduledAtUTC,
        now,
      ),
      EventSourceReference: {
        create: {
          EventSourceType: 'ProcessItemAttachment',
          ProcessItemAttachment: {
            create: {
              Index: processTemplateItem.Index,
              CreatedAt: now,
              UpdatedAt: now,
              ProcessId: processId,
              IsActive: true,
              CalculatedItemOffsetInMinutes: calculatedOffsetInMinutes,
              ItemOffset: processTemplateItem.ItemOffset as any,
            },
          },
        },
      },
    },
  })
}

export const convertRecurringEventInstanceToEvent = async (
  pc: PrismaClientReusableInTransactions,
  recurringEventInstance: NonNullable<Awaited<ReturnType<typeof findRecurringEventInstanceById>>>,
  opts: ConvertRecurringEventInstanceOptions,
) => {
  const now = new Date()
  const {
    TransparencyScope,
    Title,
    Description,
    DescriptionFormat,
    ProtectedTitle,
    ProtectedDescription,
    ProtectedDescriptionFormat,
    PublicTitle,
    PublicDescription,
    PublicDescriptionFormat,
    EventTagId,
    RecurringEventSourceReference,
    Duration,
  } = recurringEventInstance.RecurringEvent
  const eventState = opts.eventState
  const resolvedDuration = opts.type === 'reschedule' ? opts.duration : Duration
  const resolvedScheduledAt = opts.type === 'reschedule' ? opts.scheduledAtUTC : recurringEventInstance.ScheduledAtUTC
  const resolvedEndsAt =
    opts.type === 'reschedule'
      ? duration.calculateEndsAtFromBeginAndDuration(resolvedScheduledAt, resolvedDuration)
      : recurringEventInstance.EndsAtUTC
  return pc.event.create({
    include: {
      EventSourceReference: {
        include: {
          RecurringEventInstanceConversion: true,
        },
      },
    },
    data: {
      CreatedAt: now,
      UpdatedAt: now,
      EventSourceReference: {
        create: {
          EventSourceType: 'RecurringEventInstanceConversion' as const,
          RecurringEventInstanceConversion: {
            create: {
              ConvertedAt: now,
              InheritedRecurringEventSourceType: RecurringEventSourceReference.RecurringEventSourceType,
              InheritedEventTemplateId: RecurringEventSourceReference.EventTemplateId,
            },
          },
        },
      },
      EventState: eventState,
      TransparencyScope,
      Title,
      Description,
      DescriptionFormat,
      ProtectedTitle,
      ProtectedDescription,
      ProtectedDescriptionFormat,
      PublicTitle,
      PublicDescription,
      PublicDescriptionFormat,
      ...(!!EventTagId
        ? {
            EventTag: {
              connect: {
                Id: EventTagId,
              },
            },
          }
        : {}),
      Duration: resolvedDuration,
      ScheduledAtUTC: resolvedScheduledAt,
      EndsAtUTC: resolvedEndsAt,
    },
  })
}

export const updateEventSchedule = async (
  pc: PrismaClientReusableInTransactions,
  event: CalendarEvent,
  forbiddenEventSourceTypes: EventSourceType[],
  newScheduledAtUTC: Date,
  newDuration: number,
) => {
  const now = new Date()
  return pc.event.update({
    include: {
      EventSourceReference: true,
    },
    where: {
      Id: event.Id,
      EventSourceReference: {
        EventSourceType: {
          notIn: forbiddenEventSourceTypes,
        },
      },
    },
    data: {
      UpdatedAt: now,
      Duration: newDuration,
      ScheduledAtUTC: newScheduledAtUTC,
      EndsAtUTC: duration.calculateEndsAtFromBeginAndDuration(newScheduledAtUTC, newDuration),
    },
  })
}

export const updateProcessEventSchedule = async (
  pc: PrismaClientReusableInTransactions,
  eventId: number,
  newScheduledAtUTC: Date,
  newDuration: number,
  now: Date,
) => {
  return pc.event.update({
    where: {
      EventSourceReference: {
        EventSourceType: 'ProcessItemAttachment',
      },
      Id: eventId,
    },
    data: {
      UpdatedAt: now,
      Duration: newDuration,
      ScheduledAtUTC: newScheduledAtUTC,
      EndsAtUTC: duration.calculateEndsAtFromBeginAndDuration(newScheduledAtUTC, newDuration),
    },
  })
}

export const bulkUpdateProcessEventSchedules = async (
  pc: PrismaClientReusableInTransactions,
  processEventRescheduleUpdates: ProcessEventRescheduleUpdate[],
  now: Date,
) => {
  return Promise.all(
    processEventRescheduleUpdates.map(async ({ Id, ScheduledAtUTC, Duration }) => {
      return updateProcessEventSchedule(pc, Id, ScheduledAtUTC, Duration, now)
    }),
  )
}

export const cancelEvent = async (
  pc: PrismaClientReusableInTransactions,
  event: CalendarEvent,
  forbiddenEventSourceTypes: EventSourceType[],
) => {
  const now = new Date()
  return pc.event.update({
    where: {
      Id: event.Id,
      EventSourceReference: {
        EventSourceType: {
          notIn: forbiddenEventSourceTypes,
        },
      },
    },
    data: {
      UpdatedAt: now,
      EventState: 'Cancelled',
    },
  })
}

export const cancelProcessEvent = async (pc: PrismaClientReusableInTransactions, processItemAttachmentId: number) => {
  const now = new Date()
  return pc.event.updateMany({
    where: {
      EventSourceReference: {
        EventSourceType: 'ProcessItemAttachment',
        ProcessItemAttachment: {
          Id: processItemAttachmentId,
        },
      },
    },
    data: {
      UpdatedAt: now,
      EventState: 'Cancelled',
    },
  })
}

export const bulkCancelEvents = async (
  pc: PrismaClientReusableInTransactions,
  eventIds: number[],
  forbiddenEventSourceTypes: EventSourceType[],
  now: Date,
) => {
  return pc.event.updateMany({
    where: {
      Id: {
        in: eventIds,
      },
      EventSourceReference: {
        EventSourceType: {
          notIn: forbiddenEventSourceTypes,
        },
      },
    },
    data: {
      UpdatedAt: now,
      EventState: 'Cancelled',
    },
  })
}

export const bulkCancelProcessEvents = async (
  pc: PrismaClientReusableInTransactions,
  eventIds: number[],
  now: Date,
) => {
  return pc.event.updateMany({
    where: {
      Id: {
        in: eventIds,
      },
      EventSourceReference: {
        EventSourceType: 'ProcessItemAttachment',
      },
    },
    data: {
      UpdatedAt: now,
      EventState: 'Cancelled',
    },
  })
}

export const bulkCancelRecurringEventInstanceConversions = async (
  pc: PrismaClientReusableInTransactions,
  recurringEventConversionIds: number[],
  now: Date,
) => {
  return pc.event.updateMany({
    where: {
      EventSourceReference: {
        EventSourceType: 'RecurringEventInstanceConversion',
        RecurringEventInstanceConversion: {
          Id: {
            in: recurringEventConversionIds,
          },
        },
      },
    },
    data: {
      UpdatedAt: now,
      EventState: 'Cancelled',
    },
  })
}

export const findFirstEventEndingEarlierThan = async (pc: PrismaClientReusableInTransactions, untilUTC: Date) => {
  return pc.event.findFirst({
    where: {
      EndsAtUTC: {
        lt: untilUTC,
      },
    },
  })
}

export const listEventsWithEventSourceTypeEndingEarlierThan = async (
  pc: PrismaClientReusableInTransactions,
  eventSourceTypes: EventSourceType[],
  untilUTC: Date,
) => {
  return pc.event.findMany({
    include: {
      EventTag: true,
      EventSourceReference: true,
    },
    where: {
      EventSourceReference: {
        EventSourceType: {
          in: eventSourceTypes,
        },
      },
      EndsAtUTC: {
        lt: untilUTC,
      },
    },
  })
}

export const listEventsFromProcessItemAttachmentEndingEarlierThan = async (
  pc: PrismaClientReusableInTransactions,
  untilUTC: Date,
) => {
  return pc.event.findMany({
    include: {
      EventTag: true,
      EventSourceReference: {
        include: {
          ProcessItemAttachment: {
            include: {
              Process: true,
            },
          },
        },
      },
    },
    where: {
      EventSourceReference: {
        EventSourceType: 'ProcessItemAttachment',
      },
      EndsAtUTC: {
        lt: untilUTC,
      },
    },
  })
}

export const bulkRemoveEventsByIds = async (pc: PrismaClientReusableInTransactions, ids: number[]) => {
  return pc.event.deleteMany({
    where: {
      Id: {
        in: ids,
      },
    },
  })
}
