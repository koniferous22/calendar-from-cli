// NOTE - before running this script make sure that following dependencies are built
// * '@calendar-from-cli/common-config'
// * '@calendar-from-cli/validation-lib'

import { getScopedConfig, loadApplicationConfig } from '@calendar-from-cli/common-config'
import path from 'path'
import { fileURLToPath } from 'url'
import _ from 'lodash'
import { getEnvVariables } from '../../src/config/envVariables.js'
import { zApiPublicConfig } from '../../src/config/configValidator.js'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

const resolveMonorepoRoot = () => path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

const resolveGlobalConfigDirectoryPath = () => path.join(resolveMonorepoRoot(), 'config')

const apiPublicDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

const apiPublicConfigDirectory = path.join(apiPublicDirectory, 'config')

const mergedApiPublicConfigDirectory = path.join(apiPublicDirectory, '.config')

const mergedApiPublicConfigFilePath = path.join(mergedApiPublicConfigDirectory, 'config.merged.json')

const main = () => {
  const { nodeEnv, runtime } = getEnvVariables()
  const apiPublicPackageConfig = loadApplicationConfig(apiPublicConfigDirectory, `${nodeEnv}.${runtime}`)
  const mergedConfig = zApiPublicConfig.parse(
    _.merge(getScopedConfig(resolveGlobalConfigDirectoryPath(), 'backend'), apiPublicPackageConfig),
  )
  if (!existsSync(mergedApiPublicConfigDirectory)) {
    mkdirSync(mergedApiPublicConfigDirectory)
  }
  writeFileSync(mergedApiPublicConfigFilePath, JSON.stringify(mergedConfig, null, 2))
}

main()
