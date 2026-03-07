import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};

const userService = {
  async getUsers(role = null) {
    const params = role ? { role } : {};
    const response = await axios.get(`${API_URL}/api/users`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },

  async getUser(id) {
    const response = await axios.get(`${API_URL}/api/users/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async createUser(data) {
    const response = await axios.post(`${API_URL}/api/users`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateUser(id, data) {
    const response = await axios.put(`${API_URL}/api/users/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async deactivateUser(id) {
    await axios.delete(`${API_URL}/api/users/${id}`, {
      headers: getAuthHeader(),
    });
  },
};

export default userService;
