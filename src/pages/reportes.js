import { ROLES, STAFF, SUPERVISION } from '../auth/roles';

/**
 * PRO-106: reportes del backend (PRO-072) con filtros universales y exportación a Excel o PDF.
 * Cada reporte declara qué roles lo ven (mismas reglas que ReportService) y qué filtros usa.
 */
export const REPORTES = [
  { tipo: 'tickets', titulo: 'Tickets', roles: STAFF, filtros: ['periodo', 'categoria', 'costo', 'puntuacion'] },
  { tipo: 'costos', titulo: 'Costos de mantenimiento', roles: STAFF, filtros: ['periodo', 'categoria'] },
  { tipo: 'proveedores', titulo: 'Desempeño de proveedores', roles: STAFF, filtros: ['periodo', 'categoria', 'puntuacion'] },
  { tipo: 'eficiencia', titulo: 'Eficiencia operativa', roles: SUPERVISION, filtros: ['periodo'] },
  { tipo: 'propietario-anual', titulo: 'Informe anual del propietario', roles: [...STAFF, ROLES.OWNER], filtros: ['anio', 'propietario'] },
];

export const CATEGORIAS = { PLOMERIA: 'Plomería', ELECTRICIDAD: 'Electricidad', PINTURA: 'Pintura', CERRAJERIA: 'Cerrajería',
  GAS: 'Gas', ALBANILERIA: 'Albañilería', JARDINERIA: 'Jardinería', OTRO: 'Otro' };

/** Arma los parámetros de la consulta sin mandar filtros vacíos. */
export function reportParams(filtros, format = 'json') {
  const p = { format };
  Object.entries(filtros).forEach(([k, v]) => { if (v !== '' && v != null) p[k] = v; });
  return p;
}
