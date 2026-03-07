import api from './api';

const userService = {
  async getUsers(role = null) {
    const params = role ? { role } : {};
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  async getUser(id) {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  async createUser(data) {
    const response = await api.post('/api/users', data);
    return response.data;
  },

  async updateUser(id, data) {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  async deactivateUser(id) {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};

export default userService;
