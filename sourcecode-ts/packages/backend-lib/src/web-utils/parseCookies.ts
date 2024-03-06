import { parse } from 'cookie'
import { IncomingHttpHeaders } from 'http'

export const parseCookies = (reqHeaders: IncomingHttpHeaders) => {
  const cookieHeader = reqHeaders.cookie
  if (!cookieHeader) {
    return {}
  }
  return parse(cookieHeader)
}
