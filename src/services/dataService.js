import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Crear instancia de axios con configuracion base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a cada request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticacion
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o invalido
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const dataService = {
  // =====================
  // Sellers (Vendedores)
  // =====================
  async getSellers() {
    const response = await apiClient.get('/api/sellers');
    return response.data;
  },

  async getSellerById(id) {
    const response = await apiClient.get(`/api/sellers/${id}`);
    return response.data;
  },

  async getSellerStats(id) {
    const response = await apiClient.get(`/api/sellers/${id}/stats`);
    return response.data;
  },

  // =====================
  // Sources (Fuentes)
  // =====================
  async getSources() {
    const response = await apiClient.get('/api/sources');
    return response.data;
  },

  async getSourceById(id) {
    const response = await apiClient.get(`/api/sources/${id}`);
    return response.data;
  },

  // =====================
  // Leads Portal
  // =====================
  async getPortalLeads() {
    const response = await apiClient.get('/api/leads/portal');
    return response.data;
  },

  async getPortalLeadsByDate(date) {
    const response = await apiClient.get(`/api/leads/portal/date/${date}`);
    return response.data;
  },

  async getPortalLeadsBySeller(sellerId) {
    const response = await apiClient.get(`/api/leads/portal/seller/${sellerId}`);
    return response.data;
  },

  async getPortalLeadsBySource(sourceId) {
    const response = await apiClient.get(`/api/leads/portal/source/${sourceId}`);
    return response.data;
  },

  // =====================
  // Leads Formulario
  // =====================
  async getFormularioLeads() {
    const response = await apiClient.get('/api/leads/formulario');
    return response.data;
  },

  async getFormularioLeadsByDate(date) {
    const response = await apiClient.get(`/api/leads/formulario/date/${date}`);
    return response.data;
  },

  // =====================
  // Daily Leads
  // =====================
  async getDailyLeads() {
    const response = await apiClient.get('/api/leads/daily');
    return response.data;
  },

  async getDailyLeadsByDate(date) {
    const response = await apiClient.get(`/api/leads/daily/${date}`);
    return response.data;
  },

  // =====================
  // Statistics
  // =====================
  async getLeadStats() {
    const response = await apiClient.get('/api/leads/stats');
    return response.data;
  },

  async getLeadsSummary() {
    const response = await apiClient.get('/api/leads/stats/summary');
    return response.data;
  },

  // =====================
  // User Dashboard
  // =====================
  async getUserDashboard() {
    const response = await apiClient.get('/api/user/dashboard');
    return response.data;
  },
};

export default dataService;
