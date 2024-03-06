import { createHTTPServer } from '@trpc/server/adapters/standalone'
import connect from 'connect'
import corsMiddleware from 'cors'
import bodyParser from 'body-parser'
import { appRouter } from './appRouter.js'
import { createContext } from './trpc/context.js'
import { getConfig } from './config/config.js'

export const createServer = () => {
  const { cors, server: serverConfig } = getConfig()
  const middleware = connect()
  // Body parser middleware required for batching request in serverless environemnt, that don't work for some reason
  // https://github.com/trpc/trpc/discussions/1553
  if (serverConfig.bodyParserMiddleware) {
    middleware.use(bodyParser.json())
  }
  if (cors.enabled) {
    middleware.use(
      corsMiddleware({
        credentials: true,
        origin: cors.whitelist,
      }),
    )
  }
  return createHTTPServer({
    router: appRouter,
    createContext,
    middleware: middleware,
    ...(serverConfig.stderrLogging
      ? {
          onError: ({ error }) => {
            console.error(error)
          },
        }
      : {}),
  }).server
}
