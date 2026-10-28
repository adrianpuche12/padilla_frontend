// PRO-090: usa el cliente HTTP unico (refresh de token incluido)
import api from './api';

const ticketService = {
  async getTickets(status = null) {
    const params = {};
    if (status) params.status = status;
    const response = await api.get(`/api/tickets`, {
      params,
    });
    return response.data;
  },

  async getTicket(id) {
    const response = await api.get(`/api/tickets/${id}`);
    return response.data;
  },

  async createTicket(data) {
    const response = await api.post(`/api/tickets`, data);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/api/tickets/${id}/status`, { status });
    return response.data;
  },

  async assignProvider(id, providerId) {
    const response = await api.patch(`/api/tickets/${id}/assign`,
      null,
      { params: { providerId } }
    );
    return response.data;
  },

  async rejectTicket(id, reason) {
    const response = await api.patch(`/api/tickets/${id}/reject`,
      null,
      { params: { reason } }
    );
    return response.data;
  },

  async getComments(ticketId) {
    const response = await api.get(`/api/tickets/${ticketId}/comments`);
    return response.data;
  },

  async addComment(ticketId, content, internal = false) {
    const response = await api.post(`/api/tickets/${ticketId}/comments`,
      { content, internal }
    );
    return response.data;
  },

  async getProviderHistory(ticketId) {
    const response = await api.get(`/api/tickets/${ticketId}/provider-history`);
    return response.data;
  },
};

export default ticketService;
