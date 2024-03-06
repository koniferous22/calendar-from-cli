import { datePreprocessing } from '@calendar-from-cli/calendar-utils'
import inquirer from 'inquirer'

type FutureDatetimeOpts = {
  pastInputErrorMessage: string
  promptMessage: string
}

export const promptFutureDatetime = async ({ pastInputErrorMessage, promptMessage }: FutureDatetimeOpts) => {
  const { futureDatetime } = await inquirer.prompt<{ futureDatetime: Date }>([
    {
      type: 'date',
      name: 'futureDatetime',
      validate: (t: Date) => {
        return t >= new Date() || pastInputErrorMessage
      },
      message: promptMessage,
    },
  ])
  return datePreprocessing.stripSecondsAndMilliseconds(futureDatetime)
}
