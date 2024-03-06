import { z } from 'zod'
import { loadEnvVariableSecret } from './loadSecret/env.js'
import { primitives } from '@calendar-from-cli/validation-lib'

type GenericSecretReaderOptions = z.infer<typeof primitives.zGenericSecretReaderOptions>

// Note - function returns callback in order to to adapt to application lifecycle particualy for events such as secret rotation
// Consists of 2 phases
// 1. config reading phase - i.e. phase when it should be specified how the secret will be loaded
// 2. secret reading phase - actual secret retrieval

export const createGenericSecretReader = (options: GenericSecretReaderOptions) => () => {
  switch (options.type) {
    case 'env':
      return loadEnvVariableSecret(options.envVariable)
  }
}
