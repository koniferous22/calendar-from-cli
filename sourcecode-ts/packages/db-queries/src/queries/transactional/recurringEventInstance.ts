import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'

type CreateRecurringEventInstanceInput = {
  recurringEventId: number
  offsetFromBaselineDays: number
  scheduledAtUTC: Date
  endsAtUTC: Date
}

export const bulkRemoveRecurringEventInstancesByIds = async (pc: PrismaClientReusableInTransactions, ids: number[]) => {
  return pc.recurringEventInstance.deleteMany({
    where: {
      Id: {
        in: ids,
      },
    },
  })
}

// Dangling = unconverted (i.e. not associated with conversion) && associated with older (unused) calendar view version
export const bulkRemoveDanglingRecurringEventInstances = async (
  pc: PrismaClientReusableInTransactions,
  olderThan: Date,
) => {
  return pc.recurringEventInstance.deleteMany({
    where: {
      AtomicCalendarViewVersion: {
        UpdatedAt: {
          lt: olderThan,
        },
      },
      RecurringEventInstanceConversionId: null,
    },
  })
}

export const createRecurringEventInstances = async (
  pc: PrismaClientReusableInTransactions,
  atomicCalendarViewVersionId: number,
  inputs: CreateRecurringEventInstanceInput[],
) => {
  return pc.recurringEventInstance.createMany({
    data: inputs.map(({ recurringEventId, offsetFromBaselineDays, scheduledAtUTC, endsAtUTC }) => ({
      AtomicCalendarViewVersionId: atomicCalendarViewVersionId,
      RecurringEventId: recurringEventId,
      OffsetFromBaselineDays: offsetFromBaselineDays,
      ScheduledAtUTC: scheduledAtUTC,
      EndsAtUTC: endsAtUTC,
    })),
  })
}

export const findRecurringEventInstanceById = async (pc: PrismaClientReusableInTransactions, id: number) => {
  return pc.recurringEventInstance.findUnique({
    include: {
      RecurringEvent: {
        include: {
          RecurringEventSourceReference: true,
        },
      },
      RecurringEventInstanceConversion: true,
    },
    where: {
      Id: id,
    },
  })
}

export const findRecurringEventInstaceConversionIds = async (
  pc: PrismaClientReusableInTransactions,
  calendarVersionId: number,
  recurringEventId: number,
) => {
  return (
    await pc.recurringEventInstance.findMany({
      where: {
        AtomicCalendarViewVersionId: calendarVersionId,
        RecurringEventId: recurringEventId,
        RecurringEventInstanceConversionId: {
          not: null,
        },
      },
      select: {
        RecurringEventInstanceConversionId: true,
      },
    })
  )
    .map(({ RecurringEventInstanceConversionId }) => RecurringEventInstanceConversionId)
    .filter((x) => x !== null) as number[]
}

export const findFirstUnconvertedRecurringEventInstanceEndingEarlierThan = async (
  pc: PrismaClientReusableInTransactions,
  untilUTC: Date,
) => {
  return pc.recurringEventInstance.findFirst({
    where: {
      RecurringEventInstanceConversionId: null,
      EndsAtUTC: {
        lt: untilUTC,
      },
    },
  })
}

export const listRecurringEventInstancesEndingEarlierThan = async (
  pc: PrismaClientReusableInTransactions,
  untilUTC: Date,
) => {
  return pc.recurringEventInstance.findMany({
    include: {
      RecurringEvent: {
        include: {
          EventTag: true,
        },
      },
      RecurringEventInstanceSetMembership: true,
      RecurringEventInstanceConversion: {
        include: {
          EventSourceReference: {
            include: {
              Event: true,
            },
          },
        },
      },
    },
    where: {
      EndsAtUTC: {
        lt: untilUTC,
      },
    },
  })
}

export const updateCalendarViewVersionForUnaffectedRecurringEventInstancesByRecurringEventId = async (
  pc: PrismaClientReusableInTransactions,
  oldCalendarVersionId: number,
  newCalendarVersionId: number,
  recurringEventId: number,
) => {
  return pc.recurringEventInstance.updateMany({
    where: {
      RecurringEventId: {
        not: recurringEventId,
      },
      AtomicCalendarViewVersionId: oldCalendarVersionId,
    },
    data: {
      AtomicCalendarViewVersionId: newCalendarVersionId,
    },
  })
}

export const updateCalendarViewVersionForUnaffectedRecurringEventInstancesByRecurringEventInstanceId = async (
  pc: PrismaClientReusableInTransactions,
  oldCalendarVersionId: number,
  newCalendarVersionId: number,
  recurringEventInstanceId: number,
) => {
  return pc.recurringEventInstance.updateMany({
    where: {
      Id: {
        not: recurringEventInstanceId,
      },
      AtomicCalendarViewVersionId: oldCalendarVersionId,
    },
    data: {
      AtomicCalendarViewVersionId: newCalendarVersionId,
    },
  })
}
