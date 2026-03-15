import api from './api';

const contractService = {
  async getContracts(status = null, propertyId = null) {
    const params = {};
    if (status) params.status = status;
    if (propertyId) params.propertyId = propertyId;
    const response = await api.get('/api/contracts', { params });
    return response.data;
  },

  async getContract(id) {
    const response = await api.get(`/api/contracts/${id}`);
    return response.data;
  },

  async createContract(data) {
    const response = await api.post('/api/contracts', data);
    return response.data;
  },

  async updateContract(id, data) {
    const response = await api.put(`/api/contracts/${id}`, data);
    return response.data;
  },

  async terminateContract(id) {
    await api.delete(`/api/contracts/${id}`);
  },

  async getContractPeriods(id) {
    const response = await api.get(`/api/contracts/${id}/periods`);
    return response.data;
  },
};

export default contractService;
