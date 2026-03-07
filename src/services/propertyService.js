import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};

const propertyService = {
  async getProperties(status = null) {
    const params = status ? { status } : {};
    const response = await axios.get(`${API_URL}/api/properties`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },

  async getProperty(id) {
    const response = await axios.get(`${API_URL}/api/properties/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async createProperty(data) {
    const response = await axios.post(`${API_URL}/api/properties`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateProperty(id, data) {
    const response = await axios.put(`${API_URL}/api/properties/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async deactivateProperty(id) {
    await axios.delete(`${API_URL}/api/properties/${id}`, {
      headers: getAuthHeader(),
    });
  },
};

export default propertyService;
