import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import Attachments from './Attachments';
import '../pages/Modules.css';

const money = (n) => n == null ? '-' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

/**
 * PRO-103: dentro del detalle de un ticket: fotos, presupuestos (el proveedor envia; la inmobiliaria o
 * el propietario aprueban), fecha de visita y costo final. El backend valida permisos y transiciones.
 */
function TicketExtras({ ticket, isAdmin, isOwner, isTenant, isProvider, userId, onTicketUpdated }) {
  const asignado = isProvider && ticket.providerId === userId;
  const terminado = ['CERRADA', 'RECHAZADA', 'CANCELADA'].includes(ticket.status);
  const [budgets, setBudgets] = useState([]);
  const [nuevo, setNuevo] = useState({ monto: '', detalle: '' });
  const [visita, setVisita] = useState('');
  const [costo, setCosto] = useState(ticket.costoFinal ?? '');
  const [error, setError] = useState(null);

  const verPresupuestos = isAdmin || isOwner || asignado;
  const cargar = () => verPresupuestos && api.get(`/api/tickets/${ticket.id}/budgets`).then(r => setBudgets(r.data)).catch(() => setBudgets([]));
  useEffect(() => { cargar(); }, [ticket.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (fn) => { setError(null); try { await fn(); } catch (err) { setError(errorMessage(err)); } };

  const enviarPresupuesto = () => run(async () => {
    await api.post(`/api/tickets/${ticket.id}/budgets`, { monto: Number(nuevo.monto), detalle: nuevo.detalle });
    setNuevo({ monto: '', detalle: '' });
    cargar();
  });
  const decidir = (b, aprobar) => run(async () => {
    if (aprobar) await api.patch(`/api/budgets/${b.id}/approve`);
    else {
      const motivo = window.prompt('Motivo del rechazo');
      if (!motivo) return;
      await api.patch(`/api/budgets/${b.id}/reject`, { motivo });
    }
    cargar();
  });
  const coordinar = () => run(async () => {
    const r = await api.patch(`/api/tickets/${ticket.id}/schedule`, { scheduledAt: new Date(visita).toISOString() });
    onTicketUpdated?.(r.data);
  });
  const guardarCosto = () => run(async () => {
    const r = await api.patch(`/api/tickets/${ticket.id}/cost`, { costoFinal: Number(costo) });
    onTicketUpdated?.(r.data);
  });

  return (
    <>
      <Attachments entityType="TICKET" entityId={ticket.id} title="Fotos y archivos"
                   canUpload={!terminado && (isAdmin || (isTenant && ticket.tenantId === userId) || asignado)} />

      {ticket.scheduledAt && <p><strong>Visita coordinada:</strong> {new Date(ticket.scheduledAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</p>}
      {(isAdmin || asignado) && !terminado && (
        <div className="detail-section">
          <h3 className="detail-section-title">Coordinar visita</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="datetime-local" value={visita} onChange={e => setVisita(e.target.value)} aria-label="Fecha de visita" />
            <button className="btn-primary" disabled={!visita} onClick={coordinar}>Guardar fecha</button>
          </div>
        </div>
      )}

      {verPresupuestos && (
        <div className="detail-section">
          <h3 className="detail-section-title">Presupuestos</h3>
          {budgets.length === 0 ? <p className="module-muted">Sin presupuestos.</p> : (
            <ul className="module-list">
              {budgets.map(b => (
                <li key={b.id}>
                  <strong>{money(b.monto)}</strong> · {b.detalle} · <span className="module-badge">{b.status}</span>
                  {b.requiereManager && b.status === 'PENDIENTE' && <span className="module-muted"> · requiere aprobación de un gerente</span>}
                  {b.motivo && <span className="module-muted"> · {b.motivo}</span>}
                  {b.status === 'PENDIENTE' && (isAdmin || isOwner) && (
                    <span style={{ marginLeft: 8 }}>
                      <button className="action-btn" onClick={() => decidir(b, true)}>Aprobar</button>
                      <button className="action-btn danger" onClick={() => decidir(b, false)}>Rechazar</button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {asignado && !terminado && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <input type="number" min="1" placeholder="Monto" value={nuevo.monto} onChange={e => setNuevo(n => ({ ...n, monto: e.target.value }))} aria-label="Monto del presupuesto" />
              <input placeholder="Detalle del trabajo" value={nuevo.detalle} onChange={e => setNuevo(n => ({ ...n, detalle: e.target.value }))} aria-label="Detalle del presupuesto" style={{ flex: 1 }} />
              <button className="btn-primary" disabled={!nuevo.monto || !nuevo.detalle.trim()} onClick={enviarPresupuesto}>Enviar presupuesto</button>
            </div>
          )}
        </div>
      )}

      {(isAdmin || asignado) && (
        <div className="detail-section">
          <h3 className="detail-section-title">Costo final</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" min="0" value={costo} onChange={e => setCosto(e.target.value)} aria-label="Costo final" />
            <button className="btn-secondary" disabled={costo === ''} onClick={guardarCosto}>Guardar costo</button>
          </div>
        </div>
      )}

      {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError(null)}>×</button></div>}
    </>
  );
}

export default TicketExtras;
