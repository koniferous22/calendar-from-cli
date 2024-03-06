import { getConfig } from './config/config.js'
import { createServer } from './server.js'

const start = async () => {
  createServer().listen(getConfig().server.port)
}

start()
