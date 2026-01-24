import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { setupInterceptors } from '../services/apiService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
    setRoles([]);
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  const getAccessToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  // Configurar interceptores al montar
  useEffect(() => {
    const onUnauthorized = () => {
      setAuthError({ type: 'unauthorized', message: 'Sesion expirada. Por favor inicia sesion nuevamente.' });
      handleLogout();
    };

    const onForbidden = () => {
      setAuthError({ type: 'forbidden', message: 'No tienes permisos para acceder a este recurso.' });
    };

    setupInterceptors(getAccessToken, onUnauthorized, onForbidden);
  }, [getAccessToken, handleLogout]);

  // Verificar si hay sesion guardada al cargar
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (token && !authService.isTokenExpired(token)) {
        const username = authService.getUsernameFromToken(token);
        const userRoles = authService.getRolesFromToken(token);

        setUser({ username });
        setRoles(userRoles);
        setIsAuthenticated(true);
      } else if (refreshToken) {
        // Intentar renovar el token
        handleRefresh(refreshToken);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleRefresh = async (refreshToken) => {
    try {
      const data = await authService.refresh(refreshToken);
      saveTokens(data);
    } catch (error) {
      console.error('Error renovando token:', error);
      handleLogout();
    }
  };

  const saveTokens = (data) => {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

    const username = authService.getUsernameFromToken(data.access_token);
    const userRoles = authService.getRolesFromToken(data.access_token);

    setUser({ username });
    setRoles(userRoles);
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    saveTokens(data);
    return data;
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

  const clearAuthError = () => {
    setAuthError(null);
  };

  const hasRole = (role) => {
    return roles.some(r => r.toLowerCase() === role.toLowerCase());
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const isUser = () => {
    return hasRole('user');
  };

  const value = {
    user,
    roles,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    getAccessToken,
    hasRole,
    isAdmin,
    isUser,
    clearAuthError,
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
