import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user, roles, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Obtener iniciales del usuario (máximo 2 caracteres)
  const getInitials = (username) => {
    if (!username) return '?';
    const parts = username.split(/[\s._-]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
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
        <div className="welcome-card">
          <h2>Bienvenido, {user?.username}</h2>
          <p>Has iniciado sesion correctamente en el sistema.</p>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h3>Tu Perfil</h3>
            <p><strong>Usuario:</strong> {user?.username}</p>
            <p><strong>Roles:</strong> {roles.length > 0 ? roles.join(', ') : 'Sin roles'}</p>
          </div>

          <div className="info-card">
            <h3>Estado del Sistema</h3>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>Frontend: Activo</span>
            </div>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>Backend: Conectado</span>
            </div>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>Keycloak: Autenticado</span>
            </div>
          </div>

          {isAdmin() && (
            <div className="info-card admin-card">
              <h3>Panel de Administracion</h3>
              <p>Tienes acceso de administrador.</p>
              <p>Aqui se mostraran las opciones de admin en T-05.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
