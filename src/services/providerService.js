import api from './api';

const providerService = {
  async getProviders() {
    const response = await api.get('/api/clients', { params: { role: 'PROVIDER' } });
    return response.data;
  },

  async getProvider(id) {
    const response = await api.get(`/api/clients/${id}`);
    return response.data;
  },

  async createProvider(data) {
    const response = await api.post('/api/clients', { ...data, role: 'PROVIDER' });
    return response.data;
  },

  async updateProvider(id, data) {
    const response = await api.put(`/api/clients/${id}`, data);
    return response.data;
  },

  async deactivateProvider(id) {
    await api.patch(`/api/clients/${id}/deactivate`, {});
  },

  async reactivateProvider(id) {
    const response = await api.patch(`/api/clients/${id}/reactivate`, {});
    return response.data;
  },

  async deleteProvider(id) {
    await api.delete(`/api/clients/${id}`);
  },
};

export default providerService;
