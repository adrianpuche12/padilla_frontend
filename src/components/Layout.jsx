import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProperoLogo from '../brand/ProperoLogo';
import { BRAND } from '../brand/brand';
import './Layout.css';

function Layout({ children, title }) {
  const { user, roles, logout, isSuperAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}
      <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}${mobileMenuOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <ProperoLogo size={32} className="sidebar-brand-logo" />
          {!sidebarCollapsed && <span className="sidebar-brand-text">{BRAND.name}</span>}
        </div>

        {!sidebarCollapsed && (
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>

            {canManageUsers() && (
              <>
                <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Usuarios
                </NavLink>

                <NavLink to="/clients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Clientes
                </NavLink>

                <NavLink to="/providers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Proveedores
                </NavLink>

                <NavLink to="/properties" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Propiedades
                </NavLink>

                <NavLink to="/contracts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  Contratos
                </NavLink>
              </>
            )}

            <NavLink to="/tickets" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Tickets
            </NavLink>

            {isSuperAdmin() && (
              <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                Configuración
              </NavLink>
            )}
          </nav>
        )}

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
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(prev => !prev)} aria-label="Abrir menú">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="3" width="20" height="2" rx="1" fill="currentColor"/>
              <rect y="9" width="20" height="2" rx="1" fill="currentColor"/>
              <rect y="15" width="20" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
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
