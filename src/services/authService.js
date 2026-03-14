import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const authService = {
  /**
   * Login con username y password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{access_token, refresh_token, expires_in}>}
   */
  async login(username, password) {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Renovar token usando refresh_token
   * @param {string} refreshToken
   * @returns {Promise<{access_token, refresh_token, expires_in}>}
   */
  async refresh(refreshToken) {
    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Cerrar sesion
   * @param {string} refreshToken
   */
  async logout(refreshToken) {
    await axios.post(`${API_URL}/api/auth/logout`, {
      refresh_token: refreshToken,
    });
  },

  /**
   * Decodifica el JWT para extraer los datos del usuario
   * @param {string} token
   * @returns {object} payload del token
   */
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  },

  /**
   * Extrae los roles del token JWT de Keycloak
   * @param {string} token
   * @returns {string[]} array de roles
   */
  getRolesFromToken(token) {
    const decoded = this.decodeToken(token);
    if (!decoded) return [];

    // Los roles de Keycloak estan en resource_access.{client_id}.roles
    const clientRoles = decoded.resource_access?.padilla_frontend?.roles || [];
    const realmRoles = decoded.realm_access?.roles || [];

    return [...new Set([...clientRoles, ...realmRoles])];
  },

  /**
   * Obtiene el username del token
   * @param {string} token
   * @returns {string}
   */
  getUsernameFromToken(token) {
    const decoded = this.decodeToken(token);
    return decoded?.preferred_username || '';
  },

  /**
   * Solicita restablecimiento de contraseña (flujo olvidé mi contraseña)
   * @param {string} email
   * @returns {Promise<void>}
   */
  async forgotPassword(email) {
    await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
  },

  /**
   * Cambia el password en el primer login obligatorio
   * @param {string} newPassword
   * @param {string} accessToken - token del primer login
   * @returns {Promise<void>}
   */
  async changePassword(newPassword, accessToken) {
    const response = await axios.put(`${API_URL}/api/auth/change-password`,
      { newPassword },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  },

  /**
   * Verifica si el token ha expirado
   * @param {string} token
   * @returns {boolean}
   */
  isTokenExpired(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expirationTime = decoded.exp * 1000; // convertir a milliseconds
    return Date.now() >= expirationTime;
  },
};

export default authService;
