export const parseAuthorizationHeader = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader) {
    return undefined
  }
  const bearerTokenRegexp = /^Bearer\s+([A-Za-z0-9\-\._~\+\/]+)=*$/
  const found = authorizationHeader.match(bearerTokenRegexp)
  return found ? found[1] : undefined
}
