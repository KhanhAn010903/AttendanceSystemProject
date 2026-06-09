import http from './http'
import { clearAuthSession, getAuthUser, isAuthenticated, setAuthSession } from './authStorage'

export const authApi = {
  async login(credentials) {
    const { data } = await http.post('/login', credentials)
    setAuthSession(data)
    return data
  },

  async register(payload) {
    const { data } = await http.post('/register', payload)
    setAuthSession(data)
    return data
  },

  async logout() {
    try {
      await http.post('/logout')
    } finally {
      clearAuthSession()
    }
  },

  async me() {
    const { data } = await http.get('/user')
    return data
  },
}

export { clearAuthSession, getAuthUser, isAuthenticated }
