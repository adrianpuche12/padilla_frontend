import { useCallback, useState } from 'react';
import NotificationBell from './NotificationBell';
import SidebarIcon from './SidebarIcon';
import { NavLink, useLocation } from 'react-router-dom';
import PanelDeAyuda from '../ayuda/PanelDeAyuda';
import { useAuth } from '../context/AuthContext';
import ProperoLogo from '../brand/ProperoLogo';
import { BRAND } from '../brand/brand';
import './Layout.css';

/** PRO-107: link del menú con ícono; con el menú achicado se ve solo el ícono (el nombre queda en el tooltip). */
function SideLink({ to, icon, label }) {
  return (
    <NavLink to={to} title={label} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <SidebarIcon name={icon} />
      <span className="sidebar-label">{label}</span>
    </NavLink>
  );
}

function Layout({ children, title }) {
  const { user, roles, logout, isSuperAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const cerrarAyuda = useCallback(() => setAyudaAbierta(false), []);
  const pantallaActual = useLocation().pathname.split('/')[1] || 'dashboard';

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

        <nav className="sidebar-nav">
            <SideLink to="/dashboard" icon="dashboard" label="Dashboard" />

            {canManageUsers() && (
              <>
                <SideLink to="/users" icon="users" label="Usuarios" />

                <SideLink to="/clients" icon="clients" label="Clientes" />

                <SideLink to="/providers" icon="providers" label="Proveedores" />

                <SideLink to="/properties" icon="properties" label="Propiedades" />

                <SideLink to="/contracts" icon="contracts" label="Contratos" />
              </>
            )}

            {roles.some(r => ['OWNER', 'TENANT'].includes(String(r).toUpperCase())) && (
              <SideLink to="/my-home" icon="myHome" label={roles.some(r => String(r).toUpperCase() === 'OWNER') ? 'Mis propiedades' : 'Mi vivienda'} />
            )}

            <SideLink to="/tickets" icon="tickets" label="Tickets" />

            {canManageUsers() && (
              <SideLink to="/reservas" icon="reservas" label="Reservas" />
            )}

            {roles.some(r => ['SUPER_ADMIN', 'MANAGER', 'ADMIN', 'OWNER'].includes(String(r).toUpperCase())) && (
              <SideLink to="/reports" icon="reports" label="Reportes" />
            )}

            {roles.some(r => ['SUPER_ADMIN', 'MANAGER'].includes(String(r).toUpperCase())) && (
              <SideLink to="/audit" icon="audit" label="Auditoría" />
            )}

            {roles.some(r => String(r).toUpperCase() === 'PLATFORM_ADMIN') && (
              <SideLink to="/platform" icon="platform" label="Plataforma" />
            )}

            {isSuperAdmin() && (
              <SideLink to="/settings" icon="settings" label="Configuración" />
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
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(prev => !prev)} aria-label="Abrir menú">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="3" width="20" height="2" rx="1" fill="currentColor"/>
              <rect y="9" width="20" height="2" rx="1" fill="currentColor"/>
              <rect y="15" width="20" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
          <h1 className="app-header-title">{title}</h1>
          <div className="app-header-right">
            <NotificationBell />
            <NavLink to="/profile" className="header-profile-link" title="Mi perfil" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'inherit', textDecoration: 'none' }}>
              <div className="user-avatar">{getInitials(user?.username)}</div>
              <span className="header-username">{user?.username}</span>
            </NavLink>
            <button
              type="button"
              className="ayuda-boton"
              onClick={() => setAyudaAbierta((a) => !a)}
              aria-expanded={ayudaAbierta}
              title="Ayuda: cómo se usa cada pantalla, con videos paso a paso"
            >
              Ayuda
            </button>
            <button onClick={handleLogout} className="logout-button">
              Cerrar Sesion
            </button>
          </div>
        </header>

        <main className="app-content">
          {children}
        </main>
        {ayudaAbierta && <PanelDeAyuda actual={pantallaActual} roles={roles} onCerrar={cerrarAyuda} />}
      </div>
    </div>
  );
}

export default Layout;
