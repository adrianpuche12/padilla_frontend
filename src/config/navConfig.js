/**
 * PRO-111 (revisión 01 de Claude Design): una sola definición del menú lateral: ruta, nombre,
 * ícono y roles que la ven. Los roles son los mismos que protegen cada ruta en App.jsx (PRO-091).
 */
import {
  LayoutDashboard, Users, Contact, Wrench, Building2, FileText, Home, Ticket, CalendarDays,
  BarChart3, ShieldCheck, Monitor, Settings,
} from 'lucide-react';
import { ROLES, STAFF, SUPERVISION } from '../auth/roles';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Usuarios', icon: Users, roles: STAFF },
  { to: '/clients', label: 'Clientes', icon: Contact, roles: STAFF },
  { to: '/providers', label: 'Proveedores', icon: Wrench, roles: STAFF },
  { to: '/properties', label: 'Propiedades', icon: Building2, roles: STAFF },
  { to: '/contracts', label: 'Contratos', icon: FileText, roles: STAFF },
  {
    to: '/my-home', icon: Home, roles: [ROLES.OWNER, ROLES.TENANT],
    label: (roles) => (roles.includes(ROLES.OWNER) ? 'Mis propiedades' : 'Mi vivienda'),
  },
  { to: '/tickets', label: 'Tickets', icon: Ticket },
  { to: '/reservas', label: 'Reservas', icon: CalendarDays, roles: STAFF },
  { to: '/reports', label: 'Reportes', icon: BarChart3, roles: [...STAFF, ROLES.OWNER] },
  { to: '/audit', label: 'Auditoría', icon: ShieldCheck, roles: SUPERVISION },
  { to: '/platform', label: 'Plataforma', icon: Monitor, roles: ['PLATFORM_ADMIN'] },
  { to: '/settings', label: 'Configuración', icon: Settings, roles: [ROLES.SUPER_ADMIN] },
];

/** Nombre visible de un ítem (algunos dependen del rol). */
export const navLabel = (item, roles) => {
  const upper = (roles || []).map((r) => String(r).toUpperCase());
  return typeof item.label === 'function' ? item.label(upper) : item.label;
};
