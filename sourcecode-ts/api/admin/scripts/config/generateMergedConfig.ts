// NOTE - before running this script make sure that following dependencies are built
// * '@calendar-from-cli/common-config'
// * '@calendar-from-cli/validation-lib'

import { getScopedConfig, loadApplicationConfig } from '@calendar-from-cli/common-config'
import path from 'path'
import { fileURLToPath } from 'url'
import _ from 'lodash'
import { getEnvVariables } from '../../src/config/envVariables.js'
import { zApiAdminConfig } from '../../src/config/configValidator.js'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

const resolveMonorepoRoot = () => path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

const resolveGlobalConfigDirectoryPath = () => path.join(resolveMonorepoRoot(), 'config')

const apiAdminDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

const apiAdminConfigDirectory = path.join(apiAdminDirectory, 'config')

const mergedApiAdminConfigDirectory = path.join(apiAdminDirectory, '.config')

const mergedApiAdminConfigFilePath = path.join(mergedApiAdminConfigDirectory, 'config.merged.json')

const main = () => {
  const { nodeEnv, runtime } = getEnvVariables()
  const apiAdminPackageConfig = loadApplicationConfig(apiAdminConfigDirectory, `${nodeEnv}.${runtime}`)
  const mergedConfig = zApiAdminConfig.parse(
    _.merge(getScopedConfig(resolveGlobalConfigDirectoryPath(), 'backend'), apiAdminPackageConfig),
  )
  if (!existsSync(mergedApiAdminConfigDirectory)) {
    mkdirSync(mergedApiAdminConfigDirectory)
  }
  writeFileSync(mergedApiAdminConfigFilePath, JSON.stringify(mergedConfig, null, 2))
}

main()
