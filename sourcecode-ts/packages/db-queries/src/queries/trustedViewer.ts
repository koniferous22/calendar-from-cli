import { prisma } from '@calendar-from-cli/prisma'
import { v4 } from 'uuid'
import { CreateTrustedViewerInput } from '../types/input/trustedViewer.js'
import { transactional } from './index.js'

export const findTrustedViewerByViewerUuid = async (viewerUuid: string) => {
  return prisma.trustedViewer.findUnique({
    include: {
      TrustedViewerCalendarPermissions: true,
      TrustedViewerEventTagPermission: {
        include: {
          EventTag: true,
        },
      },
    },
    where: {
      ViewerUuid: viewerUuid,
    },
  })
}

export const findTrustedViewerByViewerUuidOrThrow = async (viewerUuid: string) => {
  return prisma.trustedViewer.findUniqueOrThrow({
    include: {
      TrustedViewerCalendarPermissions: true,
      TrustedViewerEventTagPermission: {
        include: {
          EventTag: true,
        },
      },
    },
    where: {
      ViewerUuid: viewerUuid,
    },
  })
}

export const listActiveTrustedViewers = async () => {
  const now = new Date()
  return prisma.trustedViewer.findMany({
    where: {
      Active: true,
      OR: [
        {
          GrantExpiresAt: {
            gt: now,
          },
        },
        {
          GrantExpiresAt: null,
        },
      ],
    },
  })
}

export const createTrustedViewerAccess = async ({
  fields,
  eventTagRelations,
  passwordHash,
  calendarPermissions,
  webAppSettings,
}: CreateTrustedViewerInput) => {
  const viewerUuid = v4()
  return prisma.trustedViewer.create({
    data: {
      ...fields,
      WebAppSettings: webAppSettings ?? undefined,
      ViewerUuid: viewerUuid,
      PasswordHash: passwordHash,
      DefaultEventTagAccess: eventTagRelations.defaultEventTagAccess,
      TrustedViewerCalendarPermissions: {
        create: calendarPermissions,
      },
      TrustedViewerEventTagPermission: {
        createMany: {
          data: eventTagRelations.eventTagAccess.map(({ eventTag, eventTagAccess }) => ({
            EventTagId: eventTag.Id,
            EventTagAccess: eventTagAccess,
          })),
        },
      },
    },
  })
}

export const revokeTrustedViewerAccess = async (viewerUuid: string) => {
  return prisma.trustedViewer.update({
    where: {
      ViewerUuid: viewerUuid,
    },
    data: {
      Active: false,
    },
  })
}

export const updateRefreshTokenHash = (viewerUuid: string, refreshTokenRandomHash: string) =>
  transactional.updateRefreshTokenHash(prisma, viewerUuid, refreshTokenRandomHash)
