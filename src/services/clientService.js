import api from './api';

const clientService = {
  async getClients(role = null) {
    const params = role ? { role } : {};
    const response = await api.get('/api/clients', { params });
    return response.data;
  },

  /** PRO-094: pagina server-side ({content, totalElements, totalPages, page, size}). */
  async getClientsPage({ page = 0, size = 25, role, q, active } = {}) {
    const params = { page, size };
    if (role) params.role = role;
    if (q) params.q = q;
    if (active !== undefined) params.active = active;
    const response = await api.get('/api/clients', { params });
    return response.data;
  },

  async getClient(id) {
    const response = await api.get(`/api/clients/${id}`);
    return response.data;
  },

  async createClient(data) {
    const response = await api.post('/api/clients', data);
    return response.data;
  },

  async updateClient(id, data) {
    const response = await api.put(`/api/clients/${id}`, data);
    return response.data;
  },

  async deactivateClient(id) {
    await api.patch(`/api/clients/${id}/deactivate`, {});
  },

  async reactivateClient(id) {
    const response = await api.patch(`/api/clients/${id}/reactivate`, {});
    return response.data;
  },
};

export default clientService;
