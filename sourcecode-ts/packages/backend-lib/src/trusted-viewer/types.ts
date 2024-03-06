import { types } from '@calendar-from-cli/validation-lib'

export type EventTagPermissions = Pick<types.AccessTokenPayload, 'eventTagPermissions' | 'eventTagPermissionsType'>
