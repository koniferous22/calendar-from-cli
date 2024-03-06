import { getScopedConfig, loadApplicationConfig } from '@calendar-from-cli/common-config'
import { config } from '@calendar-from-cli/validation-lib'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'
import { nodeEnv } from './envVariables'
import _ from 'lodash'

const zSyncEventTagsConfig = z.intersection(config.zAdminConfig, z.object({}))

let scriptConfig = null as null | z.infer<typeof zSyncEventTagsConfig>

const resolveConfigDirectoryPath = () => {
  // https://www.decodingweb.dev/dirname-is-not-defined-in-es-module-scope-fix
  const currentModulePath = fileURLToPath(import.meta.url)
  return path.join(path.dirname(currentModulePath), '../config')
}

const resolveGlobalConfigDirectoryPath = () => {
  const currentModulePath = fileURLToPath(import.meta.url)
  return path.join(path.dirname(currentModulePath), '../../../../config')
}

export const getConfig = (): z.infer<typeof zSyncEventTagsConfig> => {
  if (scriptConfig === null) {
    const syncEventTagsPackageConfig = loadApplicationConfig(resolveConfigDirectoryPath(), nodeEnv)
    const mergedConfig = _.merge(
      getScopedConfig(resolveGlobalConfigDirectoryPath(), 'admin'),
      syncEventTagsPackageConfig,
    )
    scriptConfig = zSyncEventTagsConfig.parse(mergedConfig)
  }
  return scriptConfig
}
