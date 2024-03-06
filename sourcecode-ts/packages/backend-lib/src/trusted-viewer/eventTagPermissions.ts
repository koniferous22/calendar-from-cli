import { EventTagPermissions } from './types.js'

export const resolveEventTagAccessFromPermissions = (permissions: EventTagPermissions, eventTagAlias: string) => {
  const eventTagPermissions = permissions.eventTagPermissions.filter(
    ({ eventTagAlias: aliasFromPermissions }) => aliasFromPermissions === eventTagAlias,
  )
  switch (permissions.eventTagPermissionsType) {
    case 'allowList':
      return (
        eventTagPermissions.length > 0 && eventTagPermissions.every(({ eventTagAccess }) => eventTagAccess === 'Allow')
      )
    case 'denyList':
      return (
        eventTagPermissions.length === 0 ||
        eventTagPermissions.every(({ eventTagAccess }) => eventTagAccess === 'Allow')
      )
  }
}
