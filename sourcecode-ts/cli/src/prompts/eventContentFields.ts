import { types } from '@calendar-from-cli/validation-lib'
import inquirer from 'inquirer'
import { getConfig } from '../globals/config'
import { optionalPrompt } from './generic/optionalPrompt'
import { selectEnumPrompt } from './generic/selectEnum'
import { descriptionFormatOptions } from '../options/descriptionFormatOptions'

type PromptTitleDescriptionOpts = {
  promptTitleMessage: string
  promptDescriptionMessage: string
  defaultValues: null | {
    defaultTitle: string
    defaultDescription: string
  }
}

const { maxTitleLength, maxDescriptionLength } = getConfig().inputValidation.stringLimits.event

export const promptTitleDescription = async ({
  promptTitleMessage,
  promptDescriptionMessage,
  defaultValues,
}: PromptTitleDescriptionOpts) => {
  const { title } = await inquirer.prompt<{ title: string; descriptionFormat: types.DescriptionFormat }>([
    {
      type: 'input',
      name: 'title',
      message: promptTitleMessage,
      validate: (input: string) => {
        return input.length < maxTitleLength || `Title can be at most ${maxTitleLength} chars long`
      },
      ...(defaultValues ? { default: defaultValues.defaultTitle } : {}),
    },
  ])
  const { choice: descriptionFormat } = await selectEnumPrompt(descriptionFormatOptions, 'Select description format')
  const { description } = await inquirer.prompt<{ description: string }>([
    {
      type: 'editor',
      name: 'description',
      message: promptDescriptionMessage,
      validate: (input: string) => {
        return input.length < maxDescriptionLength || `Description can be at most ${maxDescriptionLength} chars long`
      },
      ...(defaultValues ? { default: defaultValues.defaultDescription } : {}),
    },
  ])
  return {
    title,
    description,
    descriptionFormat,
  }
}

export const promptEventContentFields = async () => {
  const { title, description, descriptionFormat } = await promptTitleDescription({
    promptTitleMessage: `Enter Event Title (${getConfig().inputValidation.stringLimits.event.maxTitleLength} chars)`,
    promptDescriptionMessage: `Enter Event Description (${
      getConfig().inputValidation.stringLimits.event.maxDescriptionLength
    } chars)`,
    defaultValues: null,
  })
  const {
    title: protectedTitle,
    description: protectedDescription,
    descriptionFormat: protectedDescriptionFormat,
  } = await optionalPrompt(
    async () => {
      return promptTitleDescription({
        promptTitleMessage: `Enter Protected Event Title (${
          getConfig().inputValidation.stringLimits.event.maxTitleLength
        } chars)`,
        promptDescriptionMessage: `Enter Protected Event Description (${
          getConfig().inputValidation.stringLimits.event.maxDescriptionLength
        } chars)`,
        defaultValues: {
          defaultTitle: title,
          defaultDescription: description,
        },
      })
    },
    {
      defaultValue: {
        title: null,
        description: null,
        descriptionFormat: null,
      },
      message: 'Do you want to modify visible event title and description for trusted viewer?',
    },
  )
  const {
    title: publicTitle,
    description: publicDescription,
    descriptionFormat: publicDescriptionFormat,
  } = await optionalPrompt(
    async () => {
      return promptTitleDescription({
        promptTitleMessage: `Enter Public Event Title (${
          getConfig().inputValidation.stringLimits.event.maxTitleLength
        } chars)`,
        promptDescriptionMessage: `Enter Public Event Description (${
          getConfig().inputValidation.stringLimits.event.maxDescriptionLength
        } chars)`,
        defaultValues: {
          defaultTitle: title,
          defaultDescription: description,
        },
      })
    },
    {
      defaultValue: {
        title: null,
        description: null,
        descriptionFormat: null,
      },
      message: 'Do you want to modify visible event title and description for public viewer?',
    },
  )
  return {
    title,
    description,
    descriptionFormat,
    protectedTitle,
    protectedDescription,
    protectedDescriptionFormat,
    publicTitle,
    publicDescription,
    publicDescriptionFormat,
  }
}
