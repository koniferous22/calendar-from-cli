const refreshTokenKey = 'refreshToken'
export const storeRefreshToken = (refreshToken: string) => localStorage.setItem(refreshTokenKey, refreshToken)
export const clearRefreshToken = () => localStorage.removeItem(refreshTokenKey)
export const retrieveRefreshToken = () => localStorage.getItem(refreshTokenKey)
