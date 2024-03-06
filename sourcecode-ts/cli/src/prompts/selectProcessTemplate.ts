import { client } from '../globals/client'
import { fuzzySelect } from './generic/fuzzySelect'

export const promptSelectProcessTemplate = async () => {
  const availableProcessTemplates = await client.processTemplate.list.query()
  if (availableProcessTemplates.length === 0) {
    throw new Error('No process templates found')
  }
  const { choice: processTemplate } = await fuzzySelect(availableProcessTemplates, {
    getValue: (obj) => obj,
    getFuzzyIndex: (obj) => `"${obj.Alias}" - ${obj.Title}`,
    getDescription: (obj) => obj.Description ?? undefined,
    defaultDescription: 'No description provided',
    messages: {
      fuzzySelectMessage: 'Select process template',
    },
  })
  return processTemplate
}
