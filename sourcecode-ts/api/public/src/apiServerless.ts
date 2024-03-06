import serverless from 'serverless-http'
import { createServer } from './server.js'

// Nodejs logging
// https://docs.aws.amazon.com/lambda/latest/dg/nodejs-logging.html
// Production note: NODE_ENV needs to be set to "production" for correct TRPC error handling, otherwise it'll leak stacktraces
// https://trpc.io/docs/server/error-handling
export const handler = serverless(createServer() as any)
