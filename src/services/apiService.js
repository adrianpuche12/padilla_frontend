import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Instancia de axios configurada para llamadas autenticadas
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Configura el interceptor de autenticacion
 * @param {function} getToken - Funcion que retorna el access token
 * @param {function} onUnauthorized - Callback cuando hay error 401
 * @param {function} onForbidden - Callback cuando hay error 403
 */
export const setupInterceptors = (getToken, onUnauthorized, onForbidden) => {
  // Interceptor de request - agrega el token
  apiClient.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de response - maneja errores
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status } = error.response;

        if (status === 401) {
          console.error('Error 401: No autenticado');
          onUnauthorized?.();
        } else if (status === 403) {
          console.error('Error 403: Sin permisos');
          onForbidden?.(error.response.data);
        }
      }
      return Promise.reject(error);
    }
  );
};

const apiService = {
  /**
   * Obtiene el dashboard del usuario (USER y ADMIN)
   */
  async getUserDashboard() {
    const response = await apiClient.get('/api/user/dashboard');
    return response.data;
  },

  /**
   * Obtiene el perfil del usuario (USER y ADMIN)
   */
  async getUserProfile() {
    const response = await apiClient.get('/api/user/profile');
    return response.data;
  },

  /**
   * Obtiene el dashboard de admin (solo ADMIN)
   */
  async getAdminDashboard() {
    const response = await apiClient.get('/api/admin/dashboard');
    return response.data;
  },

  /**
   * Verifica la conexion con el endpoint seguro
   */
  async checkSecure() {
    const response = await apiClient.get('/api/secure');
    return response.data;
  },
};

export default apiService;
