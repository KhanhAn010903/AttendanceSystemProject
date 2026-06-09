import http from './http'

export const permissionsApi = {
  async list() {
    const { data } = await http.get('/permissions')
    return data
  },

  async get(id) {
    const { data } = await http.get(`/permissions/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await http.post('/permissions', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await http.put(`/permissions/${id}`, payload)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(`/permissions/${id}`)
    return data
  },
}
