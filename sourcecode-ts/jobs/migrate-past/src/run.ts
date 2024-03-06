import { jobs } from '@calendar-from-cli/backend-lib'

export const run = async () => {
  await jobs.migratePast({
    shouldCheckForCorruptDbState: true,
  })
}
