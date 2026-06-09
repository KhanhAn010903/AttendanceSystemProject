export const AUTH_TOKEN_KEY = 'attendance_auth_token'
export const AUTH_USER_KEY = 'attendance_auth_user'
export const LEGACY_AUTH_STORAGE_KEY = 'attendance_auth'

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY)

export const getAuthUser = () => {
  const rawUser = localStorage.getItem(AUTH_USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    localStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export const setAuthSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  }

  localStorage.setItem(LEGACY_AUTH_STORAGE_KEY, 'true')
}

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)
}

export const isAuthenticated = () =>
  Boolean(getAuthToken()) || localStorage.getItem(LEGACY_AUTH_STORAGE_KEY) === 'true'
