import inquirer from 'inquirer'
import { optionalPrompt } from './generic/optionalPrompt'
import { promptFutureDatetime } from './generic/futureDatetime'

const promptScheduledAtUTC = () =>
  promptFutureDatetime({
    pastInputErrorMessage: 'Cannot schedule event in the past',
    promptMessage: 'Select new event schedule',
  })

export const promptEventSchedule = async () => {
  const scheduledAtUTC = await promptScheduledAtUTC()
  const duration = (
    await inquirer.prompt<{ duration: number }>([
      {
        type: 'number',
        name: 'duration',
        transformer: (value?: number) => value && `${value} minute${value === 1 ? '' : 's'}`,
      },
    ])
  ).duration
  return {
    scheduledAtUTC,
    duration,
  }
}

export const promptEventScheduleDefaultDuration = async (defaultDuration: number) => {
  const scheduledAtUTC = await promptScheduledAtUTC()
  const duration = await optionalPrompt(
    async () => {
      return (
        await inquirer.prompt<{ duration: number }>([
          {
            type: 'number',
            name: 'duration',
            default: defaultDuration,
            transformer: (value?: number) => value && `${value} minute${value === 1 ? '' : 's'}`,
          },
        ])
      ).duration
    },
    {
      defaultValue: defaultDuration,
      message: `Do you want to modify the scheduled event duration (${defaultDuration} minutes)?`,
    },
  )
  return {
    scheduledAtUTC,
    duration,
  }
}

type PromptOptionalEventScheduleUpdates = {
  timestampPromptMessage: string
  durationPromptMessage: string
}

export const promptOptionalEventScheduleUpdates = async ({
  timestampPromptMessage,
  durationPromptMessage,
}: PromptOptionalEventScheduleUpdates) => {
  const scheduledAtUTC = await optionalPrompt(async () => promptScheduledAtUTC(), {
    defaultValue: undefined,
    message: timestampPromptMessage,
  })
  const duration = await optionalPrompt(
    async () => {
      return (
        await inquirer.prompt<{ duration: number }>([
          {
            type: 'number',
            name: 'duration',
            default: undefined,
            transformer: (value?: number) => value && `${value} minute${value === 1 ? '' : 's'}`,
          },
        ])
      ).duration
    },
    {
      defaultValue: undefined,
      message: durationPromptMessage,
    },
  )
  return {
    scheduledAtUTC,
    duration,
  }
}
