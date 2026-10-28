import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api, { errorMessage } from '../services/api';
import clientService from '../services/clientService';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole, ROLES, STAFF } from '../auth/roles';
import { CATEGORIAS, REPORTES, reportParams } from './reportes';
import './Modules.css';

/** PRO-106: reportes con filtros universales y exportación a Excel o PDF. */
function Reports() {
  const { roles } = useAuth();
  const esPropietario = hasAnyRole(roles, [ROLES.OWNER]) && !hasAnyRole(roles, STAFF);
  const disponibles = REPORTES.filter(r => hasAnyRole(roles, r.roles));
  const [tipo, setTipo] = useState(disponibles[0]?.tipo || '');
  const [filtros, setFiltros] = useState({});
  const [propietarios, setPropietarios] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const def = REPORTES.find(r => r.tipo === tipo);
  const usa = (f) => def?.filtros.includes(f);

  useEffect(() => {
    if (usa('propietario') && !esPropietario && propietarios.length === 0) {
      clientService.getClients('OWNER').then(setPropietarios).catch(() => {});
    }
  }, [tipo]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setFiltros(f => ({ ...f, [k]: e.target.value }));
  const cambiarTipo = (t) => { setTipo(t); setReporte(null); setError(null); };

  const ver = async () => {
    setCargando(true); setError(null);
    try { setReporte((await api.get(`/api/reports/${tipo}`, { params: reportParams(filtros) })).data); }
    catch (err) { setError(errorMessage(err, 'No se pudo generar el reporte')); setReporte(null); }
    finally { setCargando(false); }
  };

  const exportar = async (format) => {
    try {
      const res = await api.get(`/api/reports/${tipo}`, { params: reportParams(filtros, format), responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propero-${tipo}-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) { setError(errorMessage(err, 'No se pudo exportar el reporte')); }
  };

  if (disponibles.length === 0) {
    return <Layout title="Reportes"><div className="module-page"><p className="module-muted">Tu rol no tiene reportes.</p></div></Layout>;
  }

  return (
    <Layout title="Reportes">
      <div className="module-page">
        <div className="module-card">
          <div className="module-grid">
            <label className="module-field">Reporte
              <select value={tipo} onChange={e => cambiarTipo(e.target.value)}>
                {disponibles.map(r => <option key={r.tipo} value={r.tipo}>{r.titulo}</option>)}
              </select>
            </label>
            {usa('periodo') && <>
              <label className="module-field">Desde<input type="date" value={filtros.from || ''} onChange={set('from')} /></label>
              <label className="module-field">Hasta<input type="date" value={filtros.to || ''} onChange={set('to')} /></label>
            </>}
            {usa('categoria') && (
              <label className="module-field">Tipo de servicio
                <select value={filtros.category || ''} onChange={set('category')}>
                  <option value="">Todos</option>
                  {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            )}
            {usa('costo') && <>
              <label className="module-field">Costo mínimo<input type="number" min="0" value={filtros.minCost || ''} onChange={set('minCost')} /></label>
              <label className="module-field">Costo máximo<input type="number" min="0" value={filtros.maxCost || ''} onChange={set('maxCost')} /></label>
            </>}
            {usa('puntuacion') && (
              <label className="module-field">Puntuación mínima
                <select value={filtros.minRating || ''} onChange={set('minRating')}>
                  <option value="">Cualquiera</option>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} ★</option>)}
                </select>
              </label>
            )}
            {usa('anio') && (
              <label className="module-field">Año<input type="number" min="2000" max="2100" placeholder={String(new Date().getFullYear())}
                value={filtros.year || ''} onChange={set('year')} /></label>
            )}
            {usa('propietario') && !esPropietario && (
              <label className="module-field">Propietario
                <select value={filtros.ownerId || ''} onChange={set('ownerId')}>
                  <option value="">Elegí un propietario</option>
                  {propietarios.map(p => <option key={p.id} value={p.id}>{p.name || p.username}</option>)}
                </select>
              </label>
            )}
          </div>
          {usa('periodo') && <p className="module-muted">Sin fechas, el reporte toma los últimos 90 días.</p>}
          <div className="module-actions">
            <button className="btn-primary" onClick={ver} disabled={cargando}>{cargando ? 'Generando…' : 'Ver reporte'}</button>
            <button className="btn-secondary" onClick={() => exportar('xlsx')}>Exportar Excel</button>
            <button className="btn-secondary" onClick={() => exportar('pdf')}>Exportar PDF</button>
          </div>
          {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError(null)}>×</button></div>}
        </div>

        {reporte && (
          <div className="module-card">
            <h3>{reporte.title}</h3>
            {reporte.subtitle && <p className="module-muted">{reporte.subtitle}</p>}
            {reporte.rows.length === 0 ? <p className="module-muted">No hay datos para estos filtros.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table className="module-table">
                  <thead><tr>{reporte.columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
                  <tbody>
                    {reporte.rows.map((row, i) => (
                      <tr key={i}>{reporte.columns.map(c => <td key={c.key}>{row[c.key] == null ? '-' : String(row[c.key])}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="module-muted">{reporte.rows.length} fila{reporte.rows.length === 1 ? '' : 's'}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Reports;
