import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const isTokenExpired = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return !payload.exp || Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('access_token');

  if (token && isTokenExpired(token)) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });
        token = response.data.access_token;
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(new Error('Sesión expirada'));
      }
    } else {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return Promise.reject(new Error('Sesión expirada'));
    }
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
