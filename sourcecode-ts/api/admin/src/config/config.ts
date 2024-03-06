// Workflow - script
// 1. load scoped config (includes validation)
// 2. load application config
// 3. merge
// 4. validate
// 5. write into .config folder
// Workflow - api-admin
// 1. load merged config
// 2. validate

import { zApiAdminConfig } from './configValidator.js'
import rawApiAdminConfig from '../../.config/config.merged.json' with { type: 'json' }

const config = zApiAdminConfig.parse(rawApiAdminConfig)

export const getConfig = () => config
