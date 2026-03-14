import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

const STORAGE_KEY = (userId) => `padilla_theme_${userId ?? 'default'}`;

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState('light');

  // Carga preferencia del usuario al montar o cambiar de usuario
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY(user?.username));
    const resolved = stored === 'dark' ? 'dark' : 'light';
    setThemeState(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }, [user?.username]);

  const setTheme = (value) => {
    setThemeState(value);
    document.documentElement.setAttribute('data-theme', value);
    localStorage.setItem(STORAGE_KEY(user?.username), value);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}
