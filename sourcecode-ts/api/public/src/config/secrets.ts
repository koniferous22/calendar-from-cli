import { createGenericSecretReader } from '@calendar-from-cli/secrets'
import { getConfig } from './config.js'

const resolveSecretReaders = () => ({
  getJwtSecret: createGenericSecretReader(getConfig().secrets.jwtSecret),
})

let secretReaders = null as null | ReturnType<typeof resolveSecretReaders>

export const getSecretReaders = () => {
  if (secretReaders === null) {
    secretReaders = resolveSecretReaders()
  }
  return secretReaders
}
