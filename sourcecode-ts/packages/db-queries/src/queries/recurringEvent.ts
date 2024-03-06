import { types } from '@calendar-from-cli/validation-lib'
import { prisma } from '@calendar-from-cli/prisma'
import { $Enums, EventTemplate } from '@prisma/client'
import { resolveValueByAccessScope } from '../concepts/transparencyScope.js'
import { ScheduleRecurringEventFallbackPublicValues } from '../types/input/recurringEvent.js'

export const listAllActiveRecurringEvents = async () => {
  return prisma.recurringEvent.findMany({
    where: {
      RecurringEventState: 'Active',
    },
  })
}

export const findRecurringEventById = async (id: number) => {
  return prisma.recurringEvent.findUnique({
    where: {
      Id: id,
    },
  })
}

export const scheduleRecurringEventFromEventTemplate = async (
  eventTemplate: EventTemplate,
  { fallbackPublicTitle, fallbackPublicDescription }: ScheduleRecurringEventFallbackPublicValues,
  baselineSchedule: Date,
  recurrence: types.RecurringEventScheduleSpec,
) => {
  const now = new Date()
  const titlesByScope = {
    Private: eventTemplate.Title,
    Protected: eventTemplate.ProtectedTitle,
    Public: eventTemplate.PublicTitle,
  }
  const descriptionsByScope = {
    Private: {
      content: eventTemplate.Description,
      format: eventTemplate.DescriptionFormat,
    },
    Protected:
      eventTemplate.ProtectedDescription !== null && eventTemplate.ProtectedDescriptionFormat !== null
        ? {
            content: eventTemplate.ProtectedDescription,
            format: eventTemplate.ProtectedDescriptionFormat,
          }
        : null,
    Public:
      eventTemplate.PublicDescription !== null && eventTemplate.PublicDescriptionFormat !== null
        ? {
            content: eventTemplate.PublicDescription,
            format: eventTemplate.PublicDescriptionFormat,
          }
        : null,
  }
  const resolvedPrivateDescription = resolveValueByAccessScope(
    'Private',
    eventTemplate.TransparencyScope,
    descriptionsByScope,
    fallbackPublicDescription,
  )
  const resolvedProtectedDescription = resolveValueByAccessScope(
    'Protected',
    eventTemplate.TransparencyScope,
    descriptionsByScope,
    fallbackPublicDescription,
  )
  const resolvedPublicDescription = resolveValueByAccessScope(
    'Public',
    eventTemplate.TransparencyScope,
    descriptionsByScope,
    fallbackPublicDescription,
  )
  await prisma.recurringEvent.create({
    include: {
      RecurringEventSourceReference: true,
    },
    data: {
      CreatedAt: now,
      UpdatedAt: now,
      RecurringEventSourceReference: {
        create: {
          RecurringEventSourceType: $Enums.RecurringEventSourceType.EventTemplate,
          EventTemplateId: eventTemplate.Id,
        },
      },
      RecurringEventState: $Enums.RecurringEventState.Active,
      TransparencyScope: eventTemplate.TransparencyScope,
      Title: eventTemplate.Title,
      Description: resolvedPrivateDescription.content,
      DescriptionFormat: resolvedPrivateDescription.format,
      ProtectedTitle: resolveValueByAccessScope(
        'Protected',
        eventTemplate.TransparencyScope,
        titlesByScope,
        fallbackPublicTitle,
      ),
      ProtectedDescription: resolvedProtectedDescription.content,
      ProtectedDescriptionFormat: resolvedProtectedDescription.format,
      PublicTitle: resolveValueByAccessScope(
        'Public',
        eventTemplate.TransparencyScope,
        titlesByScope,
        fallbackPublicTitle,
      ),
      PublicDescription: resolvedPublicDescription.content,
      PublicDescriptionFormat: resolvedPublicDescription.format,
      Notifications: eventTemplate.Notifications,
      ...(!!eventTemplate.EventTagId
        ? {
            EventTag: {
              connect: {
                Id: eventTemplate.EventTagId,
              },
            },
          }
        : {}),
      Duration: eventTemplate.Duration,
      Recurrence: recurrence,
      BaselineUTCSchedule: baselineSchedule,
      Metadata: eventTemplate.Metadata as any,
    },
  })
}
