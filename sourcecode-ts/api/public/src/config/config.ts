// Workflow - script
// 1. load scoped config (includes validation)
// 2. load application config
// 3. merge
// 4. validate
// 5. write into .config folder
// Workflow - api-admin
// 1. load merged config
// 2. validate

import { zApiPublicConfig } from './configValidator.js'
import rawApiPublicConfig from '../../.config/config.merged.json' with { type: 'json' }

const config = zApiPublicConfig.parse(rawApiPublicConfig)

export const getConfig = () => config
