// PRO-090: usa el cliente HTTP unico (antes tenia su propia instancia sin refresh)
import api from './api';

const dataService = {
  // =====================
  // Sellers (Vendedores)
  // =====================
  async getSellers() {
    const response = await api.get('/api/sellers');
    return response.data;
  },

  async getSellerById(id) {
    const response = await api.get(`/api/sellers/${id}`);
    return response.data;
  },

  async getSellerStats(id) {
    const response = await api.get(`/api/sellers/${id}/stats`);
    return response.data;
  },

  // =====================
  // Sources (Fuentes)
  // =====================
  async getSources() {
    const response = await api.get('/api/sources');
    return response.data;
  },

  async getSourceById(id) {
    const response = await api.get(`/api/sources/${id}`);
    return response.data;
  },

  // =====================
  // Leads Portal
  // =====================
  async getPortalLeads() {
    const response = await api.get('/api/leads/portal');
    return response.data;
  },

  async getPortalLeadsByDate(date) {
    const response = await api.get(`/api/leads/portal/date/${date}`);
    return response.data;
  },

  async getPortalLeadsBySeller(sellerId) {
    const response = await api.get(`/api/leads/portal/seller/${sellerId}`);
    return response.data;
  },

  async getPortalLeadsBySource(sourceId) {
    const response = await api.get(`/api/leads/portal/source/${sourceId}`);
    return response.data;
  },

  // =====================
  // Leads Formulario
  // =====================
  async getFormularioLeads() {
    const response = await api.get('/api/leads/formulario');
    return response.data;
  },

  async getFormularioLeadsByDate(date) {
    const response = await api.get(`/api/leads/formulario/date/${date}`);
    return response.data;
  },

  // =====================
  // Daily Leads
  // =====================
  async getDailyLeads() {
    const response = await api.get('/api/leads/daily');
    return response.data;
  },

  async getDailyLeadsByDate(date) {
    const response = await api.get(`/api/leads/daily/${date}`);
    return response.data;
  },

  // =====================
  // Statistics
  // =====================
  async getLeadStats() {
    const response = await api.get('/api/leads/stats');
    return response.data;
  },

  async getLeadsSummary() {
    const response = await api.get('/api/leads/stats/summary');
    return response.data;
  },

  // =====================
  // User Dashboard
  // =====================
  async getUserDashboard() {
    const response = await api.get('/api/user/dashboard');
    return response.data;
  },
};

export default dataService;
