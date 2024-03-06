import { queries } from '@calendar-from-cli/db-queries'
import { TRPCError } from '@trpc/server'

type TrustedViewer = NonNullable<Awaited<ReturnType<typeof queries.findTrustedViewerByViewerUuid>>>

export const validateTrustedViewerAccess = (trustedViewer: TrustedViewer) => {
  if (!trustedViewer.Active) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Credentials expired',
    })
  }
  if (trustedViewer.GrantExpiresAt && trustedViewer.GrantExpiresAt < new Date()) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Credentials expired',
    })
  }
  return trustedViewer
}
