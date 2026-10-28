import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import api, { errorMessage } from '../services/api';
import './Modules.css';

const RUTA = { TICKET: '/tickets', CONTRATO: '/contracts', PROPIEDAD: '/properties', RESERVA: '/reservas', PRESUPUESTO: '/tickets' };

/** PRO-104: bandeja de notificaciones y preferencias (mail on/off, resumen diario o semanal). */
function Notifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [prefs, setPrefs] = useState(null);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const cargar = () => api.get('/api/notifications', { params: { page, size: 20, unread: soloNoLeidas } })
    .then(r => setData(r.data)).catch(err => setError(errorMessage(err)));
  useEffect(() => { cargar(); }, [page, soloNoLeidas]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { api.get('/api/notifications/preferences').then(r => setPrefs(r.data)).catch(() => {}); }, []);

  const avisarCampana = () => window.dispatchEvent(new Event('propero:notifications'));

  const abrir = async (n) => {
    if (!n.leida) {
      await api.patch(`/api/notifications/${n.id}/read`).catch(() => {});
      avisarCampana();
    }
    if (RUTA[n.referenciaTipo]) navigate(RUTA[n.referenciaTipo]);
    else cargar();
  };

  const todasLeidas = async () => {
    await api.patch('/api/notifications/read-all').catch(err => setError(errorMessage(err)));
    avisarCampana();
    cargar();
  };

  const guardarPrefs = async () => {
    try { setPrefs((await api.put('/api/notifications/preferences', prefs)).data); setMsg('Preferencias guardadas'); }
    catch (err) { setError(errorMessage(err)); }
  };

  return (
    <Layout title="Notificaciones">
      <div className="module-page">
        <div className="module-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <label><input type="checkbox" checked={soloNoLeidas} onChange={e => { setPage(0); setSoloNoLeidas(e.target.checked); }} /> Solo sin leer</label>
            <button className="btn-secondary" onClick={todasLeidas}>Marcar todas como leídas</button>
          </div>
          {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError(null)}>×</button></div>}
          {data.content.length === 0 ? <p className="module-muted">No tenés notificaciones.</p> : (
            <ul className="module-list" style={{ marginTop: 12 }}>
              {data.content.map(n => (
                <li key={n.id} className={n.leida ? '' : 'unread'} style={{ cursor: 'pointer' }} onClick={() => abrir(n)}>
                  <strong>{n.titulo}</strong> {n.prioridad === 'URGENTE' && <span className="module-badge urgente">Urgente</span>}
                  <div>{n.mensaje}</div>
                  <div className="module-muted">{new Date(n.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</div>
                </li>
              ))}
            </ul>
          )}
          <Pagination page={page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />
        </div>

        {prefs && (
          <div className="module-card">
            <h3>Preferencias</h3>
            <p className="module-muted">Las notificaciones en la aplicación siempre están activas. Algunos avisos importantes llegan por mail aunque lo apagues.</p>
            <div className="module-grid">
              <label className="module-field">Avisos por mail
                <select value={prefs.emailEnabled ? 'si' : 'no'} onChange={e => setPrefs(p => ({ ...p, emailEnabled: e.target.value === 'si' }))}>
                  <option value="si">Sí</option><option value="no">No</option>
                </select>
              </label>
              <label className="module-field">Resumen
                <select value={prefs.resumen} onChange={e => setPrefs(p => ({ ...p, resumen: e.target.value }))}>
                  <option value="OFF">Sin resumen</option><option value="DIARIO">Diario</option><option value="SEMANAL">Semanal (lunes)</option>
                </select>
              </label>
            </div>
            {msg && <p className="module-ok">{msg}</p>}
            <div className="module-actions"><button className="btn-primary" onClick={guardarPrefs}>Guardar preferencias</button></div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Notifications;
