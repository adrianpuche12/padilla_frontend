import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, Moon, Sun, ChevronsLeft, ChevronsRight, Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import PanelDeAyuda from '../ayuda/PanelDeAyuda';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { hasAnyRole } from '../auth/roles';
import ProperoLogo from '../brand/ProperoLogo';
import { BRAND } from '../brand/brand';
import { NAV_ITEMS, navLabel } from '../config/navConfig';
import './Layout.css';

/**
 * PRO-111: layout de la revisión 01 de Claude Design (íconos lucide, menú colapsable que se
 * recuerda, botón de tema para todos, drawer mobile accesible) sumado a lo que ya tenía Propero:
 * campana de notificaciones (PRO-104), acceso a Mi perfil (PRO-101) y panel de Ayuda.
 */
const COLLAPSE_KEY = 'propero_sidebar_collapsed';

const getInitials = (username) => {
  if (!username) return '?';
  const parts = username.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.substring(0, 2).toUpperCase();
};

const leerColapsado = () => {
  try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
};

function Layout({ children, title }) {
  const { user, roles, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(leerColapsado);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const cerrarAyuda = useCallback(() => setAyudaAbierta(false), []);
  const pantallaActual = location.pathname.split('/')[1] || 'dashboard';

  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, sidebarCollapsed ? '1' : '0'); } catch { /* sin storage */ }
  }, [sidebarCollapsed]);

  // B-06: el drawer mobile se cierra al navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // B-12: Esc cierra el drawer y el fondo no scrollea mientras está abierto
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  const items = NAV_ITEMS.filter((item) => !item.roles || hasAnyRole(roles, item.roles));

  return (
    <div className={`app-layout${sidebarCollapsed ? ' sidebar-is-collapsed' : ''}`}>
      {mobileMenuOpen && <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />}

      <aside
        id="app-sidebar"
        className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}${mobileMenuOpen ? ' mobile-open' : ''}`}
        aria-label="Navegación principal"
      >
        <div className="sidebar-brand">
          <ProperoLogo size={32} className="sidebar-brand-logo" />
          <span className="sidebar-brand-text">{BRAND.name}</span>
        </div>

        {/* B-04: la navegación siempre se dibuja; colapsado solo se ocultan los textos */}
        <nav className="sidebar-nav">
          {items.map((item) => {
            const label = navLabel(item, roles);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                title={sidebarCollapsed ? label : undefined}
                aria-label={sidebarCollapsed ? label : undefined}
              >
                <Icon size={18} className="sidebar-link-icon" aria-hidden="true" />
                <span className="sidebar-link-label">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {sidebarCollapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <ChevronsLeft size={18} aria-hidden="true" />}
        </button>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Abrir menú"
            aria-expanded={mobileMenuOpen}
            aria-controls="app-sidebar"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          <h1 className="app-header-title">{title}</h1>

          <div className="app-header-right">
            <NotificationBell />
            <button
              type="button"
              className="header-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <NavLink to="/profile" className="header-profile-link" title="Mi perfil">
              <div className="user-avatar" aria-hidden="true">{getInitials(user?.username)}</div>
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
            <button type="button" onClick={logout} className="logout-button" aria-label="Cerrar sesión">
              <LogOut size={16} aria-hidden="true" />
              <span className="logout-label">Cerrar sesión</span>
            </button>
          </div>
        </header>

        <main className="app-content">{children}</main>
        {ayudaAbierta && <PanelDeAyuda actual={pantallaActual} roles={roles} onCerrar={cerrarAyuda} />}
      </div>
    </div>
  );
}

export default Layout;
