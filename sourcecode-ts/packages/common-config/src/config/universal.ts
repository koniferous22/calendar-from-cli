import { config } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'
import path from 'path'
import _ from 'lodash'
import { loadConfigFromFS } from '../loaders/fs.js'

let universalConfig = null as null | z.infer<typeof config.zUniversalConfig>

export const getUniversalConfig = (configDirectory: string) => {
  if (universalConfig === null) {
    const universalConfigFp = path.join(configDirectory, 'universal/universal.json')
    const universalConfigObj = loadConfigFromFS(universalConfigFp)
    universalConfig = config.zUniversalConfig.parse(universalConfigObj)
  }
  return universalConfig
}
