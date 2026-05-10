import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};

const reservaService = {
  async getReservas(status = null) {
    const params = {};
    if (status) params.status = status;
    const response = await axios.get(`${API_URL}/api/reservas`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },

  async getReserva(id) {
    const response = await axios.get(`${API_URL}/api/reservas/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async createReserva(data) {
    const response = await axios.post(`${API_URL}/api/reservas`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await axios.patch(`${API_URL}/api/reservas/${id}/status`, { status }, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async deleteReserva(id) {
    await axios.delete(`${API_URL}/api/reservas/${id}`, {
      headers: getAuthHeader(),
    });
  },

  async readDni(base64, mimeType = 'image/jpeg') {
    const response = await axios.post(
      `${API_URL}/api/reservas/read-dni`,
      { base64, mimeType },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default reservaService;
