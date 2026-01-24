import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import './Dashboard.css';

function Dashboard() {
  const { user, roles, logout, isAdmin, authError, clearAuthError } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Obtener iniciales del usuario
  const getInitials = (username) => {
    if (!username) return '?';
    const parts = username.split(/[\s._-]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  // Verificar si es admin una sola vez
  const userIsAdmin = isAdmin();

  // Cargar datos al montar
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoadingData(true);
      setError(null);

      try {
        // Cargar dashboard de usuario
        const userData = await apiService.getUserDashboard();
        setDashboardData(userData);
      } catch (err) {
        // Si falla, continuamos sin datos del backend (mostramos datos locales)
        console.log('No se pudieron cargar datos del usuario desde el backend');
      }

      // Si es admin, cargar tambien el dashboard admin
      if (userIsAdmin) {
        try {
          const adminDashboard = await apiService.getAdminDashboard();
          setAdminData(adminDashboard);
        } catch (adminError) {
          console.log('No se pudieron cargar datos de admin desde el backend');
        }
      }

      setIsLoadingData(false);
    };

    loadDashboardData();
  }, [userIsAdmin]);

  const handleLogout = async () => {
    await logout();
  };

  const handleDismissError = () => {
    setError(null);
    clearAuthError();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="user-avatar">
            {getInitials(user?.username)}
          </div>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesion
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Mostrar errores de conexion (no mostramos 403 porque el UI ya maneja los permisos) */}
        {error && (
          <div className="error-banner error">
            <span>{error}</span>
            <button onClick={handleDismissError} className="error-dismiss">×</button>
          </div>
        )}

        <div className="welcome-card">
          <h2>Bienvenido, {user?.username}</h2>
          <p>
            {userIsAdmin
              ? 'Tienes acceso de administrador al sistema.'
              : 'Has iniciado sesion correctamente en el sistema.'}
          </p>
        </div>

        {isLoadingData ? (
          <div className="loading-data">
            <p>Cargando datos...</p>
          </div>
        ) : (
          <div className="info-grid">
            {/* Card de perfil */}
            <div className="info-card">
              <h3>Tu Perfil</h3>
              <p><strong>Usuario:</strong> {user?.username}</p>
              <p><strong>Roles:</strong> {dashboardData?.roles?.join(', ') || roles.join(', ') || 'Sin roles'}</p>
            </div>

            {/* Card de funcionalidades disponibles */}
            <div className="info-card">
              <h3>Funcionalidades</h3>
              {dashboardData?.features && (
                <>
                  {Object.entries(dashboardData.features).map(([key, enabled]) => (
                    <div key={key} className="status-item">
                      <span className={`status-dot ${enabled ? 'active' : ''}`}></span>
                      <span>{formatFeatureName(key)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Card de estado del sistema */}
            <div className="info-card">
              <h3>Estado del Sistema</h3>
              <div className="status-item">
                <span className="status-dot active"></span>
                <span>Frontend: Activo</span>
              </div>
              <div className="status-item">
                <span className={`status-dot ${dashboardData ? 'active' : ''}`}></span>
                <span>Backend: {dashboardData ? 'Conectado' : 'Desconectado'}</span>
              </div>
              <div className="status-item">
                <span className="status-dot active"></span>
                <span>Keycloak: Autenticado</span>
              </div>
            </div>

            {/* Panel de Admin - Solo visible para administradores */}
            {userIsAdmin && adminData && (
              <div className="info-card admin-card">
                <h3>Panel de Administracion</h3>
                <p>{adminData.message}</p>
                <div className="admin-features">
                  <h4>Opciones de Admin:</h4>
                  {adminData.features && (
                    <>
                      {Object.entries(adminData.features).map(([key, enabled]) => (
                        <div key={key} className="status-item">
                          <span className={`status-dot ${enabled ? 'active' : ''}`}></span>
                          <span>{formatFeatureName(key)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Funcion auxiliar para formatear nombres de features
function formatFeatureName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export default Dashboard;
