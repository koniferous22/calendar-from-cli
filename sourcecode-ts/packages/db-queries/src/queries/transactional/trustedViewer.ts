import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'

export const updateRefreshTokenHash = async (
  pc: PrismaClientReusableInTransactions,
  viewerUuid: string,
  refreshTokenRandomHash: string,
) => {
  return pc.trustedViewer.update({
    where: {
      ViewerUuid: viewerUuid,
    },
    data: {
      RefreshTokenRandomHash: refreshTokenRandomHash,
    },
  })
}

export const bulkRemoveExpiredTrustedViewers = async (pc: PrismaClientReusableInTransactions, now: Date) => {
  return pc.trustedViewer.deleteMany({
    where: {
      OR: [
        {
          GrantExpiresAt: {
            not: null,
            lt: now,
          },
        },
        {
          Active: false,
        },
      ],
    },
  })
}
