import jwt from 'jsonwebtoken'

export const validateJwtToken = (token: string, jwtSecret: string) => {
  return new Promise((res, rej) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        rej(err)
      }
      res(decoded)
    })
  })
}

export const signJwtToken = <T>(payload: T, jwtSecret: string, expiresIn: number) => {
  return jwt.sign(
    {
      data: payload,
    },
    jwtSecret,
    {
      expiresIn,
    },
  )
}
