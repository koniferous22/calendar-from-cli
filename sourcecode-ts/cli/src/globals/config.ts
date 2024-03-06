import { getScopedConfig, loadApplicationConfig } from '@calendar-from-cli/common-config'
import { config } from '@calendar-from-cli/validation-lib'
import _ from 'lodash'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'
import { nodeEnv } from './envVariables'

const zCliAdminConfig = z.intersection(
  config.zAdminConfig,
  z.object({
    apiAdminUrl: z.string().url(),
    webAppDomain: z.string().url(),
  }),
)

let cliConfig = null as null | z.infer<typeof zCliAdminConfig>

const resolveConfigDirectoryPath = () => {
  // https://www.decodingweb.dev/dirname-is-not-defined-in-es-module-scope-fix
  const currentModulePath = fileURLToPath(import.meta.url)
  return path.join(path.dirname(currentModulePath), '../../config')
}

const resolveGlobalConfigDirectoryPath = () => {
  const currentModulePath = fileURLToPath(import.meta.url)
  return path.join(path.dirname(currentModulePath), '../../../../config')
}

export const getConfig = (): z.infer<typeof zCliAdminConfig> => {
  if (cliConfig === null) {
    const apiAdminPackageConfig = loadApplicationConfig(resolveConfigDirectoryPath(), nodeEnv)
    const mergedConfig = _.merge(getScopedConfig(resolveGlobalConfigDirectoryPath(), 'admin'), apiAdminPackageConfig)
    cliConfig = zCliAdminConfig.parse(mergedConfig)
  }
  return cliConfig
}
