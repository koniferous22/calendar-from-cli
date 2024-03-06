import { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import { getConfig } from '../config/config.js'
import { getEnvVariables } from '../config/envVariables.js'

export const createContext = ({ req, res }: CreateHTTPContextOptions) => {
  return {
    config: getConfig(),
    envVariables: getEnvVariables(),
  }
}
