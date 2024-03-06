import { queries } from '@calendar-from-cli/db-queries'

// Util that ensures that there's at least 1 calendar version
const checkCalendarViewVersion = async () => {
  const calendarViewVersion = await queries.getLatestCalendarViewVersion()
  if (!calendarViewVersion) {
    await queries.incrementCalendarViewVersion()
  }
}

export const prepareEnvironment = async () => {
  await checkCalendarViewVersion()
}
