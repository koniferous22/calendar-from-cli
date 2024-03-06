import { readFileSync } from 'fs'
import _ from 'lodash'

export const loadConfigFromFS = (path: string) => {
  const fileContents = readFileSync(path, 'utf-8')
  const jsonData = JSON.parse(fileContents)
  return jsonData
}
