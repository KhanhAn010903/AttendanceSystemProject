import http from './http'

export const rolesApi = {
  async list() {
    const { data } = await http.get('/roles')
    return data
  },

  async get(id) {
    const { data } = await http.get(`/roles/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await http.post('/roles', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await http.put(`/roles/${id}`, payload)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(`/roles/${id}`)
    return data
  },

  async assignPermissions(roleId, permissions) {
    const { data } = await http.post(`/roles/${roleId}/permissions`, { permissions })
    return data
  },
}
