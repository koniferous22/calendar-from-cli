import { getConfig } from './config/config.js'
import { jobs } from '@calendar-from-cli/backend-lib'
import { createServer } from './server.js'

const start = async () => {
  await jobs.prepareEnvironment()
  createServer().listen(getConfig().server.port)
}

start()
