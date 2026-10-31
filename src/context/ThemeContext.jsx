import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

const STORAGE_KEY = (userId) => `padilla_theme_${userId ?? 'default'}`;
// PRO-111 (B-10): último tema usado, lo lee index.html antes de pintar (evita el parpadeo)
const LAST_KEY = 'padilla_theme_last';

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState('light');

  // Carga preferencia del usuario al montar o cambiar de usuario
  useEffect(() => {
    if (!user?.username) return; // antes de autenticar se respeta el tema que puso index.html
    const stored = localStorage.getItem(STORAGE_KEY(user.username));
    const resolved = stored === 'dark' ? 'dark' : 'light';
    setThemeState(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem(LAST_KEY, resolved);
  }, [user?.username]);

  const setTheme = (value) => {
    setThemeState(value);
    document.documentElement.setAttribute('data-theme', value);
    localStorage.setItem(STORAGE_KEY(user?.username), value);
    localStorage.setItem(LAST_KEY, value);
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
