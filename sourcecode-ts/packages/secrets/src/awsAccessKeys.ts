import { z } from 'zod'
import { loadEnvVariableSecret } from './loadSecret/env.js'
import { primitives } from '@calendar-from-cli/validation-lib'

type AwsAccessKeysSecretOptions = z.infer<typeof primitives.zAwsAccessKeysSecretReaderOptions>

export const createAwsAccessKeysSecretReader = (options: AwsAccessKeysSecretOptions) => () => {
  let awsAccessKeyId: string | undefined
  let awsSecretAccessKey: string | undefined
  switch (options.type) {
    case 'env':
      awsAccessKeyId = loadEnvVariableSecret('AWS_ACCESS_KEY_ID')
      awsSecretAccessKey = loadEnvVariableSecret('AWS_SECRET_ACCESS_KEY')
      break
  }
  return {
    awsAccessKeyId,
    awsSecretAccessKey,
  }
}
