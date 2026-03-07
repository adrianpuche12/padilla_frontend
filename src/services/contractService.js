import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};

const contractService = {
  async getContracts(status = null, propertyId = null) {
    const params = {};
    if (status) params.status = status;
    if (propertyId) params.propertyId = propertyId;
    const response = await axios.get(`${API_URL}/api/contracts`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },

  async getContract(id) {
    const response = await axios.get(`${API_URL}/api/contracts/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async createContract(data) {
    const response = await axios.post(`${API_URL}/api/contracts`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateContract(id, data) {
    const response = await axios.put(`${API_URL}/api/contracts/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async terminateContract(id) {
    await axios.delete(`${API_URL}/api/contracts/${id}`, {
      headers: getAuthHeader(),
    });
  },
};

export default contractService;
