import crypto from 'crypto'
import { bcryptHash } from './bcrypt.js'
import { queries } from '@calendar-from-cli/db-queries'

export const retrieveRefreshToken = async (viewerUuid: string, tokenLength: number, saltRounds: number) => {
  const newRefreshToken = crypto.randomBytes(tokenLength).toString('hex')
  const hash = await bcryptHash(newRefreshToken, saltRounds)
  await queries.updateRefreshTokenHash(viewerUuid, hash)
  return newRefreshToken
}
