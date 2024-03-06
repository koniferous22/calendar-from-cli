import { program } from 'commander'
import { z } from 'zod'
import { trpcClient } from './trpc'
import { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '../../../api/admin/src'
import { writeFileSync } from 'fs'

type CalendarListingOutput = inferRouterOutputs<AppRouter>['calendar']['listEventsInDay']

program
  .description('Retrieve metadata from scheduled events')
  .option('-d, --date <dateArg>')
  .option('-o, --output <filepath>')

program.parse()

const zOpts = z.object({
  // Note - the --date input from CLI is expected to be `date -I`, i.e. is sanitized by a "workaround" to simply convert it to nodejs date
  date: z
    .string()
    .transform((val) => new Date(val).toISOString())
    .pipe(z.coerce.date()),
  output: z.optional(z.string()),
})

const { date, output } = zOpts.parse(program.opts())

const main = async () => {
  const eventsInSpecifiedDay: CalendarListingOutput = await trpcClient.calendar.listEventsInDay.query({
    year: date.getFullYear(),
    month: date.getMonth() as 0,
    dayOfMonth: date.getDate(),
    clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const metadata = [] as {}[]
  eventsInSpecifiedDay.forEach((calendarItem) => {
    switch (calendarItem.type) {
      case 'historicEvent':
      case 'historicProcessEvent':
      case 'concealedItem':
        break
      case 'event':
      case 'processEvent':
        // @ts-expect-error type instantiation possibly infinite
        metadata.push(calendarItem.event.Metadata)
        break
      case 'recurringEvent':
        metadata.push(calendarItem.recurringEvent.RecurringEvent.Metadata as any)
        break
      default:
        break
    }
  })
  if (output) {
    writeFileSync(output, JSON.stringify(metadata, null, 2), 'utf-8')
  } else {
    console.log(JSON.stringify(metadata, null, 2))
  }
}

main()
