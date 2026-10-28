import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import api, { errorMessage } from '../services/api';
import './Modules.css';

const ENTIDADES = { TICKET: 'Tickets', USUARIO: 'Usuarios', CONTRATO: 'Contratos', RESERVA: 'Reservas', AGENCIA: 'Configuración' };

const ACCIONES = {
  TICKET_CREADO: 'Ticket creado', TICKET_ESTADO: 'Cambio de estado', TICKET_ASIGNADO: 'Proveedor asignado',
  USUARIO_CREADO: 'Usuario creado', USUARIO_DESACTIVADO: 'Usuario desactivado', USUARIO_REACTIVADO: 'Usuario reactivado',
  USUARIO_ELIMINADO: 'Usuario eliminado', PASSWORD_RESETEADA: 'Contraseña reseteada', ACTORES_REASIGNADOS: 'Reasignación',
  CONTRATO_RESCINDIDO: 'Contrato rescindido', RESERVA_ESTADO: 'Cambio de estado de reserva', CONFIGURACION_EDITADA: 'Configuración editada',
};

/** PRO-106: log de auditoría (PRO-073), solo SUPER_ADMIN y MANAGER. Quién hizo qué y cuándo. */
function Audit() {
  const [page, setPage] = useState(0);
  const [filtros, setFiltros] = useState({ entidad: '', from: '', to: '' });
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = { page, size: 25 };
    Object.entries(filtros).forEach(([k, v]) => { if (v) params[k] = v; });
    api.get('/api/audit', { params }).then(r => setData(r.data)).catch(err => setError(errorMessage(err, 'No se pudo cargar la auditoría')));
  }, [page, filtros]);

  const set = (k) => (e) => { setPage(0); setFiltros(f => ({ ...f, [k]: e.target.value })); };

  return (
    <Layout title="Auditoría">
      <div className="module-page">
        <div className="module-card">
          <div className="module-grid">
            <label className="module-field">Sección
              <select value={filtros.entidad} onChange={set('entidad')}>
                <option value="">Todas</option>
                {Object.entries(ENTIDADES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="module-field">Desde<input type="date" value={filtros.from} onChange={set('from')} /></label>
            <label className="module-field">Hasta<input type="date" value={filtros.to} onChange={set('to')} /></label>
          </div>
          {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError(null)}>×</button></div>}
          {data.content.length === 0 ? <p className="module-muted">No hay movimientos registrados.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="module-table">
                <thead><tr><th>Fecha</th><th>Quién</th><th>Rol</th><th>Acción</th><th>Sección</th><th>Detalle</th></tr></thead>
                <tbody>
                  {data.content.map(a => (
                    <tr key={a.id}>
                      <td>{new Date(a.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td>{a.actorNombre || 'Sistema'}</td>
                      <td>{a.actorRol || '-'}</td>
                      <td>{ACCIONES[a.accion] || a.accion}</td>
                      <td>{ENTIDADES[a.entidad] || a.entidad}</td>
                      <td>{a.detalle || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />
        </div>
      </div>
    </Layout>
  );
}

export default Audit;
