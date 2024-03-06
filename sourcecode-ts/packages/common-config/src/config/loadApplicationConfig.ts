import path from 'path'
import _ from 'lodash'
import { loadConfigFromFS } from '../loaders/fs.js'

export const loadApplicationConfig = <SuffixT extends string>(
  configDirectoryPath: string,
  configOverrideSuffix?: SuffixT | undefined,
): any => {
  const defaultConfig = loadConfigFromFS(path.join(configDirectoryPath, 'default.json'))
  let configOverride = {}
  if (configOverrideSuffix) {
    const configOverrideFp = path.join(configDirectoryPath, `config.${configOverrideSuffix}.json`)
    configOverride = loadConfigFromFS(configOverrideFp)
  }
  return _.merge(defaultConfig, configOverride)
}
