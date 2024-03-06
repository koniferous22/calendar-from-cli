import { z } from 'zod'
import { zUniversalConfig } from './universal.js'
import { zApiAdminClientFetchingOptions } from '../primitives/apiAdminClientFetchingOptions.js'

export const zAdminConfig = z.intersection(
  zUniversalConfig,
  z.object({
    apiAdminFetchingOptions: zApiAdminClientFetchingOptions,
  }),
)
