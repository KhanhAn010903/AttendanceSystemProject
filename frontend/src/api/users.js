import http from './http'

export const usersApi = {
  async list() {
    const { data } = await http.get('/users')
    return data
  },

  async get(id) {
    const { data } = await http.get(`/users/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await http.post('/users', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await http.put(`/users/${id}`, payload)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(`/users/${id}`)
    return data
  },

  async assignRole(userId, roleId) {
    const { data } = await http.post(`/users/${userId}/roles`, { role_id: roleId })
    return data
  },

  async assignRoles(userId, roleId) {
    const { data } = await http.post(`/users/${userId}/roles`, { role_id: roleId })
    return data
  },
}
