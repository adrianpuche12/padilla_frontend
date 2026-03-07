import api from './api';

const propertyService = {
  async getProperties(status = null) {
    const params = status ? { status } : {};
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
    const response = await api.delete(`/api/properties/${id}`);
    return response.data;
  },
};

export default propertyService;
