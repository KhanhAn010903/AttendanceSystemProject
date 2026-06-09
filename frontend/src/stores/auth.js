import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  LEGACY_AUTH_STORAGE_KEY,
  setAuthSession,
} from '@/api/authStorage'

const defaultLoginMessage = 'Dang nhap khong thanh cong. Vui long thu lai.'
let fetchUserRequest = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getAuthToken(),
    user: getAuthUser(),
    legacyAuthenticated: localStorage.getItem(LEGACY_AUTH_STORAGE_KEY) === 'true',
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token) || state.legacyAuthenticated,
  },

  actions: {
    persistSession(payload) {
      console.log('Persisting session with payload:', payload);
      this.token = payload.token || this.token
      this.user = payload.user || this.user
      this.legacyAuthenticated = true

      setAuthSession({
        token: this.token,
        user: this.user,
      })
    },

    clearSession() {
      this.token = null
      this.user = null
      this.legacyAuthenticated = false
      this.error = null

      clearAuthSession()
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const data = await authApi.login(credentials)
        this.persistSession(data)
        return data
      } catch (error) {
        this.error = error.response?.data?.message || defaultLoginMessage
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true

      try {
        await authApi.logout()
      } catch {
        // Logging out locally should still complete if the token is already invalid.
      } finally {
        this.clearSession()
        this.loading = false
      }
    },

    async fetchUser() {
      const user = await authApi.me()
      this.persistSession({
        token: this.token,
        user,
      })
      return user
    },

    async ensureUser() {
      if (!this.token || this.user) {
        return this.user
      }

      if (!fetchUserRequest) {
        fetchUserRequest = this.fetchUser().finally(() => {
          fetchUserRequest = null
        })
      }

      return fetchUserRequest
    },
  },
})
