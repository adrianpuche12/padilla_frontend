// Funciones de la Ayuda (sin componentes): catálogo de videos, visibilidad por rol y búsqueda.

export const CARPETA_DE_VIDEOS = '/ayuda/';

/** Saca tildes y mayúsculas para buscar: «edicion» encuentra «Edición». */
export const normalizar = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const minutosYSegundos = (s) => {
  const n = Math.round(s || 0);
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
};

/** El catálogo de videos (public/ayuda/videos.json). Si falta o está roto, la ayuda queda solo con texto. */
export async function cargarVideos() {
  try {
    const r = await fetch(`${CARPETA_DE_VIDEOS}videos.json`, { cache: 'no-cache' });
    if (!r.ok) return [];
    const lista = await r.json();
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export const temasVisibles = (temas, roles) => {
  const mios = (roles || []).map((r) => String(r).toUpperCase());
  return temas.filter((t) => !t.roles || t.roles.some((r) => mios.includes(r)));
};

export const buscarTemas = (temas, consulta) => {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  return temas.filter((t) => {
    const texto = normalizar([t.titulo, t.resumen, ...t.pasos, ...t.consejos].join(' '));
    return palabras.every((p) => texto.includes(p));
  });
};
