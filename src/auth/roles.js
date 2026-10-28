/**
 * PRO-091: roles de Propero y grupos que usan las rutas y las acciones.
 * Misma jerarquía que el backend: SUPER_ADMIN > MANAGER > ADMIN > OWNER / TENANT / PROVIDER.
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  TENANT: 'TENANT',
  PROVIDER: 'PROVIDER',
};

/** Personal de la inmobiliaria. */
export const STAFF = [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.ADMIN];
/** Supervisión (reportes globales, auditoría). */
export const SUPERVISION = [ROLES.SUPER_ADMIN, ROLES.MANAGER];
export const ALL = Object.values(ROLES);

/** true si alguno de los roles del usuario está en la lista (acepta mayúsculas o minúsculas). */
export function hasAnyRole(userRoles, allowed) {
  const set = new Set((userRoles || []).map((r) => String(r).toUpperCase()));
  return allowed.some((r) => set.has(r));
}
