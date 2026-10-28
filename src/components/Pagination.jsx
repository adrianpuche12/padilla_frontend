/**
 * PRO-094: paginación reutilizable para las respuestas {content, totalElements, totalPages, page, size}
 * del backend. page empieza en 0.
 */
function Pagination({ page, totalPages, totalElements, onChange, disabled }) {
  if (!totalPages || totalPages <= 1) {
    return totalElements ? <p className="pagination-info">{totalElements} resultado{totalElements === 1 ? '' : 's'}</p> : null;
  }
  return (
    <nav className="pagination" aria-label="Paginación" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', margin: '16px 0' }}>
      <button className="btn-secondary" disabled={disabled || page <= 0} onClick={() => onChange(page - 1)} aria-label="Página anterior">
        ‹ Anterior
      </button>
      <span className="pagination-info">
        Página {page + 1} de {totalPages} · {totalElements} resultados
      </span>
      <button className="btn-secondary" disabled={disabled || page >= totalPages - 1} onClick={() => onChange(page + 1)} aria-label="Página siguiente">
        Siguiente ›
      </button>
    </nav>
  );
}

export default Pagination;
