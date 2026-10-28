import api from './api';

/** PRO-031 / PRO-042: datos propios del usuario (perfil, mis propiedades, mis contratos). */
const meService = {
  async getMe() {
    return (await api.get('/api/me')).data;
  },
  async updateMe(data) {
    return (await api.put('/api/me', data)).data;
  },
  async changePassword(currentPassword, newPassword) {
    return (await api.put('/api/me/password', { currentPassword, newPassword })).data;
  },
  async getMyProperties() {
    return (await api.get('/api/me/properties')).data;
  },
  async getMyContracts() {
    return (await api.get('/api/me/contracts')).data;
  },
};

export default meService;
