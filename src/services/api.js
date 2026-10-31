import axios from 'axios';

/**
 * PRO-090: cliente HTTP único de Propero.
 *
 * - Todos los services usan esta instancia (antes había tres formas distintas de llamar al API y
 *   tickets, reservas y el dashboard no renovaban el token: de ahí los 401 "sueltos").
 * - Refresh "single-flight": si varias requests encuentran el token vencido a la vez, se hace UN solo
 *   refresh y todas esperan la misma promesa (antes cada una refrescaba con el mismo refresh_token).
 * - Renovación proactiva 30 s antes del vencimiento.
 * - Si el API responde 401 igual, se intenta un refresh y se reintenta la request una sola vez.
 */
const API_URL = import.meta.env.VITE_API_URL ?? '';

export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
const MARGEN_MS = 30_000;

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export function tokenExpiresAt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.exp ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export function isTokenExpiring(token, margenMs = MARGEN_MS) {
  return !token || Date.now() >= tokenExpiresAt(token) - margenMs;
}

let refreshEnCurso = null;

/** Renueva el token una sola vez aunque lo pidan varias requests a la vez. */
export function refreshTokens() {
  if (!refreshEnCurso) {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    refreshEnCurso = (refreshToken
      ? axios.post(`${API_URL}/api/auth/refresh`, { refresh_token: refreshToken })
      : Promise.reject(new Error('Sin refresh token')))
      .then((res) => {
        localStorage.setItem(TOKEN_KEY, res.data.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refresh_token);
        window.dispatchEvent(new CustomEvent('propero:tokens', { detail: res.data }));
        return res.data.access_token;
      })
      .finally(() => {
        refreshEnCurso = null;
      });
  }
  return refreshEnCurso;
}

export function endSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // PRO-111 (B-08): sin recarga completa. AuthContext escucha el evento, cierra la sesión y
  // PrivateRoute manda al login recordando la pantalla (antes se perdía lo que se estaba cargando).
  window.dispatchEvent(new CustomEvent('propero:logout'));
}

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem(TOKEN_KEY);
  if (token && isTokenExpiring(token)) {
    try {
      token = await refreshTokens();
    } catch {
      endSession();
      return Promise.reject(new Error('Sesión expirada'));
    }
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._reintento) {
      original._reintento = true;
      try {
        const token = await refreshTokens();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        endSession();
      }
    }
    return Promise.reject(error);
  }
);

/** Mensaje legible de un error del API (formato ApiError del backend). */
export function errorMessage(error, fallback = 'Ocurrió un error inesperado. Intentá de nuevo.') {
  return error?.response?.data?.message || error?.message || fallback;
}

export default api;
