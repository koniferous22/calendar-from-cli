// Note - bcryptjs used instead of "bcrypt" library because of bundling issues through "@mapbox/node-pre-gyp" package
// https://github.com/mapbox/node-pre-gyp/issues/308
import bcrypt from 'bcryptjs'

export const bcryptHash = async (plainString: string, saltRounds: number) => {
  return bcrypt.hash(plainString, saltRounds)
}

export const bcryptCompare = async (plainString: string, encryptedString: string) => {
  return bcrypt.compare(plainString, encryptedString)
}
