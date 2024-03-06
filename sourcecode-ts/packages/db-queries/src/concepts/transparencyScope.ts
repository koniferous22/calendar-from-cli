import { TransparencyScope } from '@prisma/client'

// Note - Idea behind transparency scope
// i.e. Public scope setting means that private fields are exposed publicly, Protected means that they are exposed to enabled connections

// Resolution logic - what data should be displayed to what requested scope
// PRI - Private
// PRO - Protected
// PUB - Public
// +------------------------------------+-----+-----------------+------------------------+
// | Request Scope \ Transparency Scope | PUB | PRO             | PRI                    |
// +------------------------------------+-----+-----------------+------------------------+
// | PUB                                | PRI | Pub ?? fallback | Pub ?? fallback        |
// | PRO                                | PRI | PRI             | Pro ?? Pub ?? fallback |
// | PRI                                | PRI | PRI             | PRI                    |
// +------------------------------------+-----+-----------------+------------------------+
// Note - this function assumes, that incoming request through API has already been authorized
export const resolveValueByAccessScope = <T>(
  requestAccessScope: TransparencyScope,
  objectTransparencyScope: TransparencyScope,
  values: { Private: T } & Record<Exclude<TransparencyScope, 'Private'>, T | null>,
  fallbackPublicValue: T,
): T => {
  switch (requestAccessScope) {
    case 'Private':
      return values.Private
    case 'Protected':
      switch (objectTransparencyScope) {
        case 'Private':
          return values.Protected ?? values.Public ?? fallbackPublicValue
        default:
          return values.Private
      }
    case 'Public':
      switch (objectTransparencyScope) {
        case 'Private':
        case 'Protected':
          return values.Public ?? fallbackPublicValue
        case 'Public':
          return values.Private
      }
    default:
      throw new Error(`Invalid request access scope '${requestAccessScope}'`)
  }
}
