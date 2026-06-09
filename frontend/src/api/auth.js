import http from './http'

export const authApi = {
  async login(credentials) {
    const { data } = await http.post('/login', credentials)
    return data
  },

  async logout() {
    const { data } = await http.post('/logout')
    return data
  },

  async me() {
    const { data } = await http.get('/user')
    return data
  },
}
