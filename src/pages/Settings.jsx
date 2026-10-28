import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AgencySettingsSection from '../components/AgencySettingsSection';
import './Settings.css';

function Settings() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const { isSuperAdmin } = useAuth();

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
                >
                  Claro
                </button>
                <button
                  className={`theme-option ${isDark ? 'selected' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  Oscuro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PRO-100: datos de la inmobiliaria, reglas operativas y plan */}
        <div className="settings-section">
          <h3 className="settings-section-title">Inmobiliaria</h3>
          <AgencySettingsSection canEdit={isSuperAdmin()} />
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
