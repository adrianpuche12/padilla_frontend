import api from './api';

/** PRO-100: configuracion de la inmobiliaria, reglas, plan y alta de inmobiliarias (plataforma). */
const settingsService = {
  async getAgency() {
    return (await api.get('/api/settings/agency')).data;
  },
  async updateAgency(data) {
    return (await api.put('/api/settings/agency', data)).data;
  },
  async getRules() {
    return (await api.get('/api/settings/rules')).data;
  },
  async updateRules(data) {
    return (await api.put('/api/settings/rules', data)).data;
  },
  async getPlan() {
    return (await api.get('/api/settings/plan')).data;
  },
  async listAgencies() {
    return (await api.get('/api/platform/agencies')).data;
  },
  async onboardAgency(data) {
    return (await api.post('/api/platform/agencies', data)).data;
  },
};

export default settingsService;
