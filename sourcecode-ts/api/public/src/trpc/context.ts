import { webUtils } from '@calendar-from-cli/backend-lib'
import { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import { getConfig } from '../config/config.js'
import { getEnvVariables } from '../config/envVariables.js'
import { getSecretReaders } from '../config/secrets.js'

export const createContext = ({ req, res }: CreateHTTPContextOptions) => {
  return {
    config: getConfig(),
    envVariables: getEnvVariables(),
    secretReaders: getSecretReaders(),
    requestInput: {
      bearerToken: webUtils.parseAuthorizationHeader(req.headers.authorization),
      cookies: webUtils.parseCookies(req.headers),
    },
    setResponseHeader: (...args: Parameters<typeof res.setHeader>) => {
      res.setHeader(...args)
    },
  }
}
