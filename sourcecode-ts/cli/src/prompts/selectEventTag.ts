import { client } from '../globals/client'
import { fuzzyMultiselectEnumPrompt } from './generic/fuzzyMultiselectEnum'
import { fuzzySelect } from './generic/fuzzySelect'

export const promptSelectEventTag = async () => {
  const availableEventTags = await client.eventTag.list.query()
  if (availableEventTags.length === 0) {
    throw new Error('No event tags found')
  }
  const { choice: eventTag } = await fuzzySelect(availableEventTags, {
    getValue: (obj) => obj,
    getFuzzyIndex: ({ Alias }) => Alias,
    getDescription: ({ Alias }) => Alias,
    defaultDescription: 'No description provided',
    messages: {
      fuzzySelectMessage: 'Select event tag',
    },
  })
  return eventTag
}

type MultiselectEventTagOpts = {
  promptMessage: string
}

export const promptMultiSelectEventTags = async ({ promptMessage }: MultiselectEventTagOpts) => {
  const availableEventTags = await client.eventTag.list.query()
  if (availableEventTags.length === 0) {
    throw new Error('No event tags found')
  }
  const choices = availableEventTags.map(({ Alias }) => ({
    value: Alias,
    name: Alias,
  }))
  const selected = (await fuzzyMultiselectEnumPrompt(choices, promptMessage)).choices
  const notSelected = availableEventTags.filter(({ Alias }) => !selected.includes(Alias)).map(({ Alias }) => Alias)
  return {
    selected,
    notSelected,
  }
}
