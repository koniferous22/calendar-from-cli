import { client } from '../globals/client'
import { promptFutureDatetime } from '../prompts/generic/futureDatetime'
import { promptSelectProcessTemplate } from '../prompts/selectProcessTemplate'

export const scheduleProcessFromProcessTemplate = async () => {
  const alias = (await promptSelectProcessTemplate()).Alias
  const scheduleBaselineUTC = await promptFutureDatetime({
    pastInputErrorMessage: 'Cannot schedule process in the past',
    promptMessage: 'Select date for the process',
  })
  return client.processTemplate.scheduleProcess.mutate({
    scheduleBaselineUTC: scheduleBaselineUTC.toISOString(),
    alias,
  })
}
