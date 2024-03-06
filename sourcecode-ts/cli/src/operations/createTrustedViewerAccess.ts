import inquirer from 'inquirer'
import { getConfig } from '../globals/config'
import { passwordSetupPrompt } from '../prompts/generic/password'
import { client } from '../globals/client'
import { selectEnumPrompt } from '../prompts/generic/selectEnum'
import {
  trustedViewerCalendarPermissionsOptions,
  trustedViewerEventTagPermissionTypeOptions,
} from '../options/trustedViewer'
import { webAppThemeOptions } from '../options/webAppTheme'
import { optionalPrompt } from '../prompts/generic/optionalPrompt'
import { promptFutureDatetime } from '../prompts/generic/futureDatetime'
import { multiselectEnumIntoBooleanMap } from '../prompts/generic/multiselectEnum'
import { promptMultiSelectEventTags } from '../prompts/selectEventTag'
import { calendarRangeViewTypeOptions } from '../options/calendarRangeViewType'

const { maxTrustedViewerAliasLength } = getConfig().inputValidation.stringLimits.trustedViewer

const promptTrustedViewerAlias = async () => {
  return (
    await inquirer.prompt<{ alias: string }>([
      {
        type: 'input',
        name: 'alias',
        message: 'Enter Access Grant Alias',
        validate: (input) => {
          return (
            input.length < maxTrustedViewerAliasLength ||
            `Trusted Viewer Alias can be at most ${maxTrustedViewerAliasLength} chars long`
          )
        },
      },
    ])
  ).alias
}

export const createTrustedViewerAccess = async () => {
  const alias = await promptTrustedViewerAlias()
  const password = await passwordSetupPrompt()
  const calendarPermissions = await multiselectEnumIntoBooleanMap(
    trustedViewerCalendarPermissionsOptions,
    'Define Calendar Permissions for Access Grant',
  )
  const { selected, notSelected } = await promptMultiSelectEventTags({
    promptMessage: 'Select Event Tags accessed by Trusted Viewer',
  })
  const eventTagPermissionsType = (
    await selectEnumPrompt(
      trustedViewerEventTagPermissionTypeOptions,
      'Select Event Tag Permission Configuration Type\nNote: selected event tags are perceived as allowed to access for the user',
    )
  ).choice
  const eventTags = eventTagPermissionsType === 'denyList' ? selected : notSelected
  const grantExpiresAt = await optionalPrompt(
    async () => {
      return promptFutureDatetime({
        pastInputErrorMessage: 'Cannot set expiration date to past value',
        promptMessage: 'Enter access grant expiration date',
      })
    },
    {
      defaultValue: undefined,
      message: 'Do you want to assign expiration period on access grant?',
    },
  )
  const webAppSettings = await optionalPrompt(
    async () => {
      const { choice: theme } = await selectEnumPrompt(webAppThemeOptions, 'Select Theme Preference')
      const { secretLinkText } = await inquirer.prompt<{ secretLinkText: string }>([
        {
          type: 'input',
          name: 'secretLinkText',
          message: 'Enter Secret Link Text',
          default: getConfig().defaultWebAppSettings.secretLinkText,
        },
      ])
      const { choice: smHomeRedirect } = await selectEnumPrompt(
        calendarRangeViewTypeOptions,
        'Select Default Calendar View',
      )
      const { choice: homeRedirect } = await selectEnumPrompt(
        calendarRangeViewTypeOptions,
        'Select Default Calendar View for small devices',
      )
      return { theme, secretLinkText, homeRedirect, smHomeRedirect }
    },
    {
      defaultValue: undefined,
      message: 'Do you want to personalize web app settings?',
    },
  )
  return client.trustedViewer.createAccess.mutate({
    alias,
    password,
    eventTagPermissionsType,
    calendarPermissions,
    eventTags,
    grantExpiresAt: grantExpiresAt?.toISOString?.(),
    webAppSettings,
  })
}
