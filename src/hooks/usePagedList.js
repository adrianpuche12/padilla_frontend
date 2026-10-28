import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../services/api';

/**
 * PRO-094: listado paginado y con búsqueda del lado del servidor.
 * fetchPage({ page, size, q, ...filters }) tiene que devolver {content, totalElements, totalPages, page, size}.
 * La búsqueda espera 350 ms después de la última tecla (debounce) y vuelve a la página 0.
 */
export default function usePagedList(fetchPage, { size = 25, filters = {} } = {}) {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersKey = JSON.stringify(filters);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  useEffect(() => {
    const id = setTimeout(() => { setDebouncedQ(q.trim()); setPage(0); }, 350);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => { setPage(0); }, [filtersKey]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRef.current({ page, size, q: debouncedQ || undefined, ...JSON.parse(filtersKey) });
      setData(res);
    } catch (err) {
      setError(errorMessage(err, 'No se pudo cargar el listado'));
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedQ, filtersKey]);

  useEffect(() => { reload(); }, [reload]);

  /** Actualiza un elemento del listado sin recargar (después de editar o desactivar). */
  const updateItem = (id, changes) =>
    setData(d => ({ ...d, content: d.content.map(x => (x.id === id ? { ...x, ...changes } : x)) }));

  return { items: data.content, data, page, setPage, q, setQ, loading, error, setError, reload, updateItem };
}
