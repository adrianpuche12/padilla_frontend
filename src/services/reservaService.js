// PRO-090: usa el cliente HTTP unico (refresh de token incluido)
import api from './api';

const reservaService = {
  async getReservas(status = null) {
    const params = {};
    if (status) params.status = status;
    const response = await api.get(`/api/reservas`, {
      params,
    });
    return response.data;
  },

  async getReserva(id) {
    const response = await api.get(`/api/reservas/${id}`);
    return response.data;
  },

  async createReserva(data) {
    const response = await api.post(`/api/reservas`, data);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/api/reservas/${id}/status`, { status });
    return response.data;
  },

  async deleteReserva(id) {
    await api.delete(`/api/reservas/${id}`);
  },

  async readDni(base64, mimeType = 'image/jpeg') {
    const response = await api.post(`/api/reservas/read-dni`,
      { base64, mimeType }
    );
    return response.data;
  },
};

export default reservaService;
