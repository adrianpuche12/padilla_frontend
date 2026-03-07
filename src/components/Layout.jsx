import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout({ children, title }) {
  const { user, roles, logout } = useAuth();

  const canManageUsers = () => {
    return roles.some(r =>
      ['ADMIN', 'admin', 'MANAGER', 'manager', 'SUPER_ADMIN', 'super_admin'].includes(r)
    );
  };

  const getInitials = (username) => {
    if (!username) return '?';
    const parts = username.split(/[\s._-]+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return username.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-text">Padilla</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">⊞</span>
            Dashboard
          </NavLink>

          {canManageUsers() && (
            <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon">👥</span>
              Usuarios
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <h1 className="app-header-title">{title}</h1>
          <div className="app-header-right">
            <div className="user-avatar">{getInitials(user?.username)}</div>
            <span className="header-username">{user?.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Cerrar Sesion
            </button>
          </div>
        </header>

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
