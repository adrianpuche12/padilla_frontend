import api from './api';

const userService = {
  async getUsers(role = null) {
    const params = role ? { role } : {};
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  /** PRO-093: usuarios de sistema con canManage por fila. */
  async getSystemUsers() {
    const response = await api.get('/api/users', { params: { scope: 'system' } });
    return response.data;
  },

  /** PRO-101: los actores que gestionaba un usuario pasan a otro del mismo rol. */
  async reassign(fromId, toId) {
    const response = await api.patch(`/api/users/${fromId}/reassign`, null, { params: { to: toId } });
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
    await api.delete(`/api/users/${id}`);
  },

  async reactivateUser(id) {
    const response = await api.patch(`/api/users/${id}/activate`, {});
    return response.data;
  },

  async resetPassword(id) {
    const response = await api.post(`/api/users/${id}/reset-password`, {});
    return response.data;
  },

  async resendAccess(id) {
    const response = await api.patch(`/api/users/${id}/resend-access`, {});
    return response.data;
  },

  async deleteUserPermanently(id) {
    await api.delete(`/api/users/${id}/permanent`);
  },
};

export default userService;
