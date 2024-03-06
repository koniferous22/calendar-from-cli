// NOTE - before running this script make sure that following dependencies are built
// * '@calendar-from-cli/common-config'
// * '@calendar-from-cli/validation-lib'

import { getScopedConfig, loadApplicationConfig } from '@calendar-from-cli/common-config'
import path from 'path'
import { fileURLToPath } from 'url'
import _ from 'lodash'
import { getEnvVariables } from '../../src/config/envVariables'
import { zWebAppConfig } from '../../src/config/configValidator'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

const resolveMonorepoRoot = () => path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../..')

const resolveGlobalConfigDirectoryPath = () => path.join(resolveMonorepoRoot(), 'config')

const webAppDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

const webAppConfigDirectory = path.join(webAppDirectory, 'config')

const bundledWebAppConfigDirectory = path.join(webAppDirectory, '.config')

const bundledWebAppConfigFilePath = path.join(bundledWebAppConfigDirectory, 'config.bundled.json')

const main = () => {
  const { nodeEnv, runtime } = getEnvVariables()
  const webAppPackageConfig = loadApplicationConfig(webAppConfigDirectory, `${nodeEnv}.${runtime}`)
  const mergedConfig = zWebAppConfig.parse(
    _.merge(getScopedConfig(resolveGlobalConfigDirectoryPath(), 'viewer'), webAppPackageConfig),
  )
  if (!existsSync(bundledWebAppConfigDirectory)) {
    mkdirSync(bundledWebAppConfigDirectory)
  }
  writeFileSync(bundledWebAppConfigFilePath, JSON.stringify(mergedConfig, null, 2))
}

main()
