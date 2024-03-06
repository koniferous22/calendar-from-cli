import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { appRouter } from './appRouter.js'
import { createContext } from './trpc/context.js'
import { getConfig } from './config/config.js'
import bodyParser from 'body-parser'

export const createServer = () =>
  createHTTPServer({
    router: appRouter,
    createContext,
    batching: {
      enabled: true,
    },
    // Body parser middleware required for batching request in serverless environemnt, that don't work for some reason
    // https://github.com/trpc/trpc/discussions/1553
    ...(getConfig().server.bodyParserMiddleware
      ? {
          middleware: bodyParser.json(),
        }
      : {}),
    ...(getConfig().server.stderrLogging
      ? {
          onError: ({ error }) => {
            console.error(error)
          },
        }
      : {}),
  }).server
