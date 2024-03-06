import { prisma } from '@calendar-from-cli/prisma'
import { Event as CalendarEvent, EventSourceType, EventTemplate } from '@prisma/client'
import { transactional } from './index.js'
import { CommonEventFields, ScheduleEventFallbackPublicValues } from '../types/input/event.js'

export const findEventById = async (id: number) => {
  return prisma.event.findFirst({
    include: {
      EventSourceReference: true,
    },
    where: {
      Id: id,
    },
  })
}

export const findEventByProcessItemAttachmentId = async (processItemAttachmentId: number) => {
  return prisma.event.findFirst({
    include: {
      EventSourceReference: true,
    },
    where: {
      EventSourceReference: {
        EventSourceType: 'ProcessItemAttachment',
        ProcessItemAttachmentId: processItemAttachmentId,
      },
    },
  })
}

export const findFirstEventEndingEarlierThan = async (untilUTC: Date) =>
  transactional.findFirstEventEndingEarlierThan(prisma, untilUTC)

export const listActiveEvents = async (fromUTC: Date, toUTC: Date) => {
  return prisma.event.findMany({
    orderBy: {
      ScheduledAtUTC: 'asc',
    },
    include: {
      EventSourceReference: true,
      EventTag: true,
    },
    where: {
      EventState: 'Active',
      ScheduledAtUTC: {
        lte: toUTC,
      },
      EndsAtUTC: {
        gte: fromUTC,
      },
    },
  })
}

export const scheduleEventFromAdHocInput = async (
  adHocInput: CommonEventFields,
  fallbackPublicValues: ScheduleEventFallbackPublicValues,
  eventTagId: number | null,
) => transactional.scheduleEventFromAdHocInput(prisma, adHocInput, fallbackPublicValues, eventTagId)

export const scheduleEventFromEventTemplate = async (
  eventTemplate: EventTemplate,
  fallbackPublicValues: ScheduleEventFallbackPublicValues,
  at: Date,
) => transactional.scheduleEventFromTemplate(prisma, eventTemplate, fallbackPublicValues, at)

export const cancelEvent = async (event: CalendarEvent, forbiddenEventSourceTypes: EventSourceType[]) =>
  transactional.cancelEvent(prisma, event, forbiddenEventSourceTypes)

export const updateEventSchedule = async (
  event: CalendarEvent,
  forbiddenEventSourceTypes: EventSourceType[],
  newScheduledAtUTC: Date,
  newDuration: number,
) => transactional.updateEventSchedule(prisma, event, forbiddenEventSourceTypes, newScheduledAtUTC, newDuration)
