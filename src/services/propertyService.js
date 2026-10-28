import api from './api';

const propertyService = {
  async getProperties(status = null) {
    const params = status ? { status } : {};
    const response = await api.get('/api/properties', { params });
    return response.data;
  },

  /** PRO-094: pagina server-side con busqueda por direccion o ciudad. */
  async getPropertiesPage({ page = 0, size = 25, status, q, ownerId } = {}) {
    const params = { page, size };
    if (status) params.status = status;
    if (q) params.q = q;
    if (ownerId) params.ownerId = ownerId;
    const response = await api.get('/api/properties', { params });
    return response.data;
  },

  async getProperty(id) {
    const response = await api.get(`/api/properties/${id}`);
    return response.data;
  },

  async createProperty(data) {
    const response = await api.post('/api/properties', data);
    return response.data;
  },

  async updateProperty(id, data) {
    const response = await api.put(`/api/properties/${id}`, data);
    return response.data;
  },

  async deactivateProperty(id) {
    await api.delete(`/api/properties/${id}`);
  },

  async reactivateProperty(id) {
    await api.patch(`/api/properties/${id}/reactivate`);
  },
};

export default propertyService;
