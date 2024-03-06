import { client } from '../globals/client'
import { fuzzySelect } from './generic/fuzzySelect'

export const promptSelectEventTemplate = async () => {
  const availableEventTemplates = await client.eventTemplate.list.query()
  if (availableEventTemplates.length === 0) {
    throw new Error('No event templates found')
  }
  const { choice: eventTemplate } = await fuzzySelect(availableEventTemplates, {
    getValue: (obj) => obj,
    getFuzzyIndex: (obj) => `"${obj.Alias}" - ${obj.Title}`,
    getDescription: (obj) => obj.Description ?? undefined,
    defaultDescription: 'No description provided',
    messages: {
      fuzzySelectMessage: 'Select event template',
    },
  })
  return eventTemplate
}
