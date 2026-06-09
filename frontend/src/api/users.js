import http from './http'

export const usersApi = {
  async assignRoles(userId, roles) {
    const { data } = await http.post(`/users/${userId}/roles`, { roles })
    return data
  },
}
