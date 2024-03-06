// WebApp configuration (since used by webapp) is inherently public, it is managed by bundlers, that take care of bundling it with rest of the application
// Configration workflow is split into 2 parts
// 1. Script (generateMergedConfig.ts) - accessed by yarn commands - `yarn config:prebundle:*`
//   * produces merged configuration from universal config, publicly scoped config and application config (overridden by env specific config)
//   * this preprocesses all of mentioned configs in previous bullet point into a single JSON, that is loaded and validated during runtime
// 2. App config - loading already preproessed config

// Workflow - script
// 1. load scoped config (includes validation)
// 2. load application config
// 3. merge
// 4. validate
// 5. write into .config folder
// Workflow - webapp
// 1. load bundled config
// 2. validate

import { zWebAppConfig } from './configValidator'
import rawWebAppConfig from '../../.config/config.bundled.json'

const config = zWebAppConfig.parse(rawWebAppConfig)

export const getConfig = () => config
