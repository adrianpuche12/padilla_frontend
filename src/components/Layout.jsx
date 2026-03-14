import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout({ children, title }) {
  const { user, roles, logout, isSuperAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    <div className={`app-layout${sidebarCollapsed ? ' sidebar-is-collapsed' : ''}`}>
      <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-brand">
          {!sidebarCollapsed && <span className="sidebar-brand-text">Padilla</span>}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Dashboard">
            <span className="sidebar-icon">⊞</span>
            {!sidebarCollapsed && 'Dashboard'}
          </NavLink>

          {canManageUsers() && (
            <>
              <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Usuarios">
                <span className="sidebar-icon">👥</span>
                {!sidebarCollapsed && 'Usuarios'}
              </NavLink>

              <NavLink to="/properties" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Propiedades">
                <span className="sidebar-icon">🏠</span>
                {!sidebarCollapsed && 'Propiedades'}
              </NavLink>

              <NavLink to="/contracts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Contratos">
                <span className="sidebar-icon">📄</span>
                {!sidebarCollapsed && 'Contratos'}
              </NavLink>
            </>
          )}

          <NavLink to="/tickets" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Tickets">
            <span className="sidebar-icon">🔧</span>
            {!sidebarCollapsed && 'Tickets'}
          </NavLink>

          {isSuperAdmin() && (
            <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Configuración">
              <span className="sidebar-icon">⚙️</span>
              {!sidebarCollapsed && 'Configuración'}
            </NavLink>
          )}
        </nav>

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(prev => !prev)}
          title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
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
