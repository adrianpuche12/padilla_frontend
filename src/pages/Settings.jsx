import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

function Settings() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Layout title="Configuración">
      <div className="settings-page">
        <h2 className="settings-page-title">Configuraciones generales del administrador</h2>

        <div className="settings-section">
          <h3 className="settings-section-title">Apariencia</h3>

          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Tema de la interfaz</span>
                <span className="settings-row-desc">
                  {isDark ? 'Modo oscuro activo' : 'Modo claro activo'}
                </span>
              </div>

              <div className="theme-toggle-group">
                <button
                  className={`theme-option ${!isDark ? 'selected' : ''}`}
                  onClick={() => setTheme('light')}
                  title="Modo claro"
                >
                  <span className="theme-option-icon">☀️</span>
                  <span className="theme-option-label">Claro</span>
                </button>
                <button
                  className={`theme-option ${isDark ? 'selected' : ''}`}
                  onClick={() => setTheme('dark')}
                  title="Modo oscuro"
                >
                  <span className="theme-option-icon">🌙</span>
                  <span className="theme-option-label">Oscuro</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
