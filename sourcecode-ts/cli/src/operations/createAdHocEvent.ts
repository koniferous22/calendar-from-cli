import { client } from '../globals/client'
import { transparencyScopeOptions } from '../options/transparencyScope'
import { promptEventContentFields } from '../prompts/eventContentFields'
import { promptEventSchedule } from '../prompts/eventSchedule'
import { optionalPrompt } from '../prompts/generic/optionalPrompt'
import { selectEnumPrompt } from '../prompts/generic/selectEnum'
import { promptSelectEventTag } from '../prompts/selectEventTag'

export const createAdHocEvent = async () => {
  const {
    title,
    description,
    descriptionFormat,
    protectedTitle,
    protectedDescription,
    protectedDescriptionFormat,
    publicTitle,
    publicDescription,
    publicDescriptionFormat,
  } = await promptEventContentFields()
  const { scheduledAtUTC, duration } = await promptEventSchedule()
  const transparencyScope = (await selectEnumPrompt(transparencyScopeOptions, 'Choose Event Transparency Scope')).choice
  const eventTag = await optionalPrompt(
    () => {
      return promptSelectEventTag()
    },
    {
      defaultValue: null,
      message: 'Do you want to attach event tag to new event?',
    },
  )
  return client.event.scheduleAdHoc.mutate({
    title,
    description,
    descriptionFormat,
    protectedTitle: protectedTitle ?? undefined,
    protectedDescription: protectedDescription ?? undefined,
    protectedDescriptionFormat: protectedDescriptionFormat ?? undefined,
    publicTitle: publicTitle ?? undefined,
    publicDescription: publicDescription ?? undefined,
    publicDescriptionFormat: publicDescriptionFormat ?? undefined,
    scheduledAtUTC: scheduledAtUTC.toISOString(),
    duration: duration,
    tagAlias: eventTag?.Alias ?? undefined,
    transparencyScope,
  })
}
