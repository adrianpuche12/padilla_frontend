import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { isTokenExpiring, refreshTokens } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
// PRO-111 (A-02): el cambio de contraseña del primer ingreso queda guardado; antes solo servía para el
// redirect inmediato y escribiendo /dashboard en la URL se salteaba.
const MUST_CHANGE_KEY = 'propero_must_change_password';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(() => localStorage.getItem(MUST_CHANGE_KEY) === '1');

  // Verificar si hay sesion guardada al cargar.
  // PRO-090: si el token vencio, se espera el refresh ANTES de terminar de cargar (antes isLoading pasaba
  // a false mientras el refresh seguia en curso y PrivateRoute mandaba a /login).
  useEffect(() => {
    let cancelado = false;
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      try {
        if (token && !isTokenExpiring(token)) {
          applyToken(token);
        } else if (refreshToken) {
          const nuevo = await refreshTokens();
          if (!cancelado) applyToken(nuevo);
        }
      } catch (error) {
        console.error('Error renovando token:', error);
        if (!cancelado) handleLogout();
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    };
    initAuth();

    // El cliente HTTP renueva tokens y cierra sesiones: el contexto se mantiene sincronizado
    const onTokens = (e) => applyToken(e.detail.access_token);
    const onLogout = () => handleLogout();
    window.addEventListener('propero:tokens', onTokens);
    window.addEventListener('propero:logout', onLogout);
    return () => {
      cancelado = true;
      window.removeEventListener('propero:tokens', onTokens);
      window.removeEventListener('propero:logout', onLogout);
    };
  }, []);

  const applyToken = (token) => {
    setUser({ username: authService.getUsernameFromToken(token) });
    setRoles(authService.getRolesFromToken(token));
    setIsAuthenticated(true);
  };

  const saveTokens = (data) => {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

    applyToken(data.access_token);
  };

  const login = async (username, password) => {
    const data = await authService.login(username.trim(), password);
    if (data.first_login) {
      localStorage.setItem(MUST_CHANGE_KEY, '1');
      setMustChangePassword(true);
    }
    saveTokens(data);
    return data;
  };

  /** Llamar después de cambiar la contraseña del primer ingreso. */
  const completePasswordChange = () => {
    localStorage.removeItem(MUST_CHANGE_KEY);
    setMustChangePassword(false);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(MUST_CHANGE_KEY);
    setMustChangePassword(false);
    setUser(null);
    setRoles([]);
    setIsAuthenticated(false);
  };

  const getAccessToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const hasRole = (role) => {
    return roles.includes(role);
  };

  const isAdmin = () => {
    return hasRole('admin') || hasRole('ADMIN');
  };

  const isSuperAdmin = () => {
    return hasRole('SUPER_ADMIN') || hasRole('super_admin');
  };

  const isManager = () => {
    return hasRole('MANAGER') || hasRole('manager');
  };

  const hasManagementRole = () => {
    return isSuperAdmin() || isManager() || isAdmin();
  };

  const value = {
    user,
    roles,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAccessToken,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isManager,
    hasManagementRole,
    mustChangePassword,
    completePasswordChange,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
