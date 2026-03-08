import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};

const ticketService = {
  async getTickets(status = null) {
    const params = {};
    if (status) params.status = status;
    const response = await axios.get(`${API_URL}/api/tickets`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },

  async getTicket(id) {
    const response = await axios.get(`${API_URL}/api/tickets/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async createTicket(data) {
    const response = await axios.post(`${API_URL}/api/tickets`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await axios.patch(`${API_URL}/api/tickets/${id}/status`, { status }, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async assignProvider(id, providerId) {
    const response = await axios.patch(
      `${API_URL}/api/tickets/${id}/assign`,
      null,
      { headers: getAuthHeader(), params: { providerId } }
    );
    return response.data;
  },

  async rejectTicket(id, reason) {
    const response = await axios.patch(
      `${API_URL}/api/tickets/${id}/reject`,
      null,
      { headers: getAuthHeader(), params: { reason } }
    );
    return response.data;
  },

  async getComments(ticketId) {
    const response = await axios.get(`${API_URL}/api/tickets/${ticketId}/comments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async addComment(ticketId, content, internal = false) {
    const response = await axios.post(
      `${API_URL}/api/tickets/${ticketId}/comments`,
      { content, internal },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default ticketService;
