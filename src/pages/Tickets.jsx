import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';
import userService from '../services/userService';
import propertyService from '../services/propertyService';
import meService from '../services/meService';
import { errorMessage } from '../services/api';
import { statusActions } from './ticketActions';
import TicketExtras from '../components/TicketExtras';
import VoiceTicketWizard from '../components/VoiceTicketWizard';
import './Tickets.css';

const STATUS_LABEL = {
  ABIERTA: 'Abierta',
  EN_PROCESO: 'En proceso',
  RESUELTA: 'Resuelta',
  CERRADA: 'Cerrada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
};

const CATEGORY_LABEL = {
  PLOMERIA: 'Plomeria',
  ELECTRICIDAD: 'Electricidad',
  PINTURA: 'Pintura',
  CERRAJERIA: 'Cerrajeria',
  GAS: 'Gas',
  ALBANILERIA: 'Albañilería',
  JARDINERIA: 'Jardinería',
  OTRO: 'Otro',
};

const PRIORITY_LABEL = { BAJA: 'Baja', NORMAL: 'Normal', URGENTE: 'Urgente' };

const ALL_STATUSES = ['ABIERTA', 'EN_PROCESO', 'RESUELTA', 'CERRADA', 'RECHAZADA', 'CANCELADA'];

const CATEGORIES = ['PLOMERIA', 'ELECTRICIDAD', 'PINTURA', 'CERRAJERIA', 'GAS', 'ALBANILERIA', 'JARDINERIA', 'OTRO'];
const PRIORITIES = ['BAJA', 'NORMAL', 'URGENTE'];

function Tickets() {
  const { hasRole, getAccessToken } = useAuth();
  const isTenant = hasRole('TENANT') || hasRole('tenant');
  const isProvider = hasRole('PROVIDER') || hasRole('provider');
  const isOwner = hasRole('OWNER') || hasRole('owner');
  const isAdmin = hasRole('SUPER_ADMIN') || hasRole('MANAGER') || hasRole('ADMIN');
  const userId = (() => {
    try { return JSON.parse(atob(getAccessToken().split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub; } catch { return null; }
  })();
  const canCreate = isTenant || isAdmin;

  const [tickets, setTickets] = useState([]);
  const [providers, setProviders] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('');

  // Create ticket modal
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', category: 'PLOMERIA', priority: 'NORMAL', propertyId: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail / action modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [providerHistory, setProviderHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commentSending, setCommentSending] = useState(false);

  // Assign modal
  const [assignTicket, setAssignTicket] = useState(null);
  const [assignProviderId, setAssignProviderId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Confirm provider change modal
  const [confirmChange, setConfirmChange] = useState(null);

  // PRO-092: cambio de estado (con motivo cuando corresponde)
  const [statusChange, setStatusChange] = useState(null);
  const [statusReason, setStatusReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Reject modal
  const [rejectTicket, setRejectTicket] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const loadTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketService.getTickets(filteredStatus || null);
      setTickets(data);
    } catch {
      setError('Error al cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  };

  // PRO-092: cada rol carga solo lo que puede ver (antes el inquilino pedia /api/users, recibia 403
  // y se quedaba sin propiedades: no podia crear tickets).
  const loadReferenceData = async () => {
    try {
      const [provData, propData] = await Promise.all([
        isAdmin ? userService.getUsers('PROVIDER') : Promise.resolve([]),
        isAdmin ? propertyService.getProperties() : (isTenant || isOwner ? meService.getMyProperties() : Promise.resolve([])),
      ]);
      setProviders(provData);
      setProperties(propData);
      // Si el tenant tiene una sola propiedad, pre-seleccionarla
      if (propData.length === 1) {
        setCreateForm(prev => ({ ...prev, propertyId: propData[0].id }));
      }
    } catch {
      // silencioso
    }
  };

  useEffect(() => { loadTickets(); }, [filteredStatus]);
  useEffect(() => { loadReferenceData(); }, []);

  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.description.trim() || !createForm.propertyId) {
      setCreateError('Completá todos los campos obligatorios');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      await ticketService.createTicket(createForm);
      setShowCreateForm(false);
      setCreateForm({ title: '', description: '', category: 'PLOMERIA', priority: 'NORMAL', propertyId: '' });
      loadTickets();
    } catch (err) {
      setCreateError(errorMessage(err, 'Error al crear el ticket'));
    } finally {
      setCreateLoading(false);
    }
  };

  const openDetail = async (ticket) => {
    setSelectedTicket(ticket);
    setComments([]);
    setProviderHistory([]);

    setCommentsLoading(true);
    ticketService.getComments(ticket.id)
      .then(data => setComments(data))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));

    if (isAdmin) {
      setHistoryLoading(true);
      ticketService.getProviderHistory(ticket.id)
        .then(data => setProviderHistory(data))
        .catch(() => setProviderHistory([]))
        .finally(() => setHistoryLoading(false));
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setCommentSending(true);
    try {
      const comment = await ticketService.addComment(selectedTicket.id, newComment.trim(), isInternal);
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setIsInternal(false);
    } catch (err) {
      // p. ej. el backend rechaza mensajes con telefonos o emails (PRO-064)
      setError(errorMessage(err, 'No se pudo enviar el comentario'));
    } finally {
      setCommentSending(false);
    }
  };

  const doAssign = async (ticketId, providerId) => {
    setAssignLoading(true);
    try {
      const updated = await ticketService.assignProvider(ticketId, providerId);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      setAssignTicket(null);
      setAssignProviderId('');
      setConfirmChange(null);
    } catch (err) {
      setError(errorMessage(err, 'No se pudo asignar el proveedor'));
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssign = () => {
    if (!assignProviderId) return;
    if (assignTicket.providerId && assignTicket.providerId !== assignProviderId) {
      setConfirmChange({ ticket: assignTicket, oldProviderId: assignTicket.providerId, newProviderId: assignProviderId });
      return;
    }
    doAssign(assignTicket.id, assignProviderId);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setRejectLoading(true);
    try {
      const updated = await ticketService.rejectTicket(rejectTicket.id, rejectReason.trim());
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      setRejectTicket(null);
      setRejectReason('');
    } catch (err) {
      setError(errorMessage(err, 'No se pudo rechazar el ticket'));
    } finally {
      setRejectLoading(false);
    }
  };

  const doStatusChange = async (ticket, action, reason) => {
    setStatusLoading(true);
    try {
      const updated = await ticketService.updateStatus(ticket.id, action.to, reason);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      if (selectedTicket?.id === updated.id) setSelectedTicket(updated);
      setStatusChange(null);
      setStatusReason('');
    } catch (err) {
      setError(errorMessage(err, 'No se pudo cambiar el estado'));
    } finally {
      setStatusLoading(false);
    }
  };

  const onStatusAction = (ticket, action) => {
    if (action.reason) {
      setStatusChange({ ticket, action });
      return;
    }
    doStatusChange(ticket, action);
  };

  const getPropertyAddress = (id) => properties.find(p => p.id === id)?.address || id?.slice(0, 8) + '...';
  const getProviderName = (id) => providers.find(p => p.id === id)?.name || '-';

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '-';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '-';

  return (
    <Layout title="Tickets">
      <div className="tickets-page">
        <div className="tickets-toolbar">
          <select className="status-filter" value={filteredStatus} onChange={e => setFilteredStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          {canCreate && (
            <button className="btn-primary" onClick={() => setShowCreateForm(true)}>+ Nuevo ticket</button>
          )}
          {isTenant && properties.length > 0 && (
            <button className="btn-secondary" onClick={() => setShowVoice(true)} style={{ fontSize: 16 }}>🎙️ Pedir por voz</button>
          )}
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>x</button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state"><p>No hay tickets para mostrar.</p></div>
        ) : (
          <div className="table-container">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Titulo</th>
                  <th>Categoria</th>
                  <th>Prioridad</th>
                  <th>Propiedad</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, idx) => (
                  <tr key={t.id}>
                    <td data-label="Nº">{t.ticketNumber || idx + 1}</td>
                    <td data-label="Título">
                      <button className="link-btn" onClick={() => openDetail(t)}>{t.title}</button>
                    </td>
                    <td data-label="Categoría">{CATEGORY_LABEL[t.category] || t.category}</td>
                    <td data-label="Prioridad">
                      <span className={`priority-badge priority-${t.priority?.toLowerCase()}`}>
                        {PRIORITY_LABEL[t.priority] || t.priority}
                      </span>
                    </td>
                    <td data-label="Propiedad">{getPropertyAddress(t.propertyId)}</td>
                    <td data-label="Proveedor">{t.providerId ? getProviderName(t.providerId) : <span className="text-muted">Sin asignar</span>}</td>
                    <td data-label="Estado">
                      <span className={`status-badge status-${t.status?.toLowerCase()}`}>
                        {STATUS_LABEL[t.status] || t.status}
                      </span>
                    </td>
                    <td data-label="Creado">{formatDate(t.createdAt)}</td>
                    <td data-label="Acciones">
                      <div className="row-actions">
                        {statusActions(t, { isAdmin, isTenant, isProvider, userId }).map(a => (
                          <button key={a.to} className={`action-btn${a.danger ? ' danger' : ''}`} disabled={statusLoading}
                                  onClick={() => onStatusAction(t, a)}>
                            {a.label}
                          </button>
                        ))}
                        {isAdmin && (t.status === 'ABIERTA' || t.status === 'EN_PROCESO') && (
                          <button className="action-btn" onClick={() => { setAssignTicket(t); setAssignProviderId(t.providerId || ''); }} title="Asignar proveedor">
                            Asignar
                          </button>
                        )}
                        {isAdmin && t.status === 'ABIERTA' && (
                          <button className="action-btn danger" onClick={() => setRejectTicket(t)} title="Rechazar">
                            Rechazar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showVoice && (
        <VoiceTicketWizard propertyId={createForm.propertyId || properties[0]?.id} onClose={() => setShowVoice(false)}
                           onCreated={() => { setShowVoice(false); loadTickets(); }} />
      )}

      {/* Modal crear ticket */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal confirm-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo ticket</h2>
              <button className="modal-close" onClick={() => setShowCreateForm(false)}>x</button>
            </div>
            <div className="confirm-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {createError && <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{createError}</div>}
              <div className="form-field">
                <label>Titulo *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ej: Canilla rota en baño"
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <label>Descripcion *</label>
                <textarea
                  value={createForm.description}
                  onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describí el problema con detalle..."
                  rows={3}
                  className="form-input"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-field">
                  <label>Categoria *</label>
                  <select value={createForm.category} onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))} className="status-filter" style={{ width: '100%' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Prioridad</label>
                  <select value={createForm.priority} onChange={e => setCreateForm(p => ({ ...p, priority: e.target.value }))} className="status-filter" style={{ width: '100%' }}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Propiedad</label>
                {isAdmin && <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>El ticket queda a nombre del inquilino del contrato vigente.</p>}
                {properties.length === 0 ? (
                  <p className="no-property-msg">No tenés una propiedad asignada. Contactá al administrador.</p>
                ) : properties.length === 1 ? (
                  <p className="property-fixed">{properties[0].address}</p>
                ) : (
                  <select value={createForm.propertyId} onChange={e => setCreateForm(p => ({ ...p, propertyId: e.target.value }))} className="status-filter" style={{ width: '100%' }}>
                    <option value="">-- Seleccionar propiedad --</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                  </select>
                )}
              </div>
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-secondary" onClick={() => setShowCreateForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate} disabled={createLoading || properties.length === 0}>
                {createLoading ? 'Creando...' : 'Crear ticket'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle / comentarios */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal ticket-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTicket.title}</h2>
              <button className="modal-close" onClick={() => setSelectedTicket(null)}>x</button>
            </div>
            <div className="ticket-detail-body">
              <div className="ticket-meta">
                <span><strong>Estado:</strong> {STATUS_LABEL[selectedTicket.status]}</span>
                <span><strong>Categoria:</strong> {CATEGORY_LABEL[selectedTicket.category]}</span>
                <span><strong>Prioridad:</strong> {PRIORITY_LABEL[selectedTicket.priority]}</span>
                <span><strong>Propiedad:</strong> {getPropertyAddress(selectedTicket.propertyId)}</span>
                {selectedTicket.providerId && <span><strong>Proveedor:</strong> {getProviderName(selectedTicket.providerId)}</span>}
                {selectedTicket.rejectionReason && <span className="rejection-reason"><strong>Razon rechazo:</strong> {selectedTicket.rejectionReason}</span>}
              </div>
              <p className="ticket-description">{selectedTicket.description}</p>

              {/* PRO-103: fotos, visita, presupuestos y costo final */}
              <TicketExtras ticket={selectedTicket} isAdmin={isAdmin} isOwner={isOwner} isTenant={isTenant}
                            isProvider={isProvider} userId={userId}
                            onTicketUpdated={(u) => { setSelectedTicket(u); setTickets(prev => prev.map(x => x.id === u.id ? u : x)); }} />

              {isAdmin && (
                <div className="comments-section">
                  <h3>Historial de proveedores</h3>
                  {historyLoading ? (
                    <div className="loading-container"><div className="loading-spinner"></div></div>
                  ) : providerHistory.length === 0 ? (
                    <p className="no-comments">Sin cambios de proveedor registrados.</p>
                  ) : (
                    <ul className="comments-list">
                      {providerHistory.map(h => (
                        <li key={h.id} className="comment-item">
                          <div className="comment-header">
                            <span className="comment-author">{h.changedBy?.slice(0, 8)}...</span>
                            <span className="comment-date">{formatDateTime(h.changedAt)}</span>
                          </div>
                          <p>
                            <span className="text-muted">{h.oldProviderId ? getProviderName(h.oldProviderId) : 'Sin proveedor'}</span>
                            {' → '}
                            <strong>{h.newProviderId ? getProviderName(h.newProviderId) : 'Sin proveedor'}</strong>
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="comments-section">
                <h3>Comentarios</h3>
                {commentsLoading ? (
                  <div className="loading-container"><div className="loading-spinner"></div></div>
                ) : comments.length === 0 ? (
                  <p className="no-comments">Sin comentarios aun.</p>
                ) : (
                  <ul className="comments-list">
                    {comments.map(c => (
                      <li key={c.id} className={`comment-item${c.internal ? ' internal' : ''}`}>
                        <div className="comment-header">
                          <span className="comment-author">{c.authorId?.slice(0, 8)}...</span>
                          {c.internal && <span className="internal-badge">Interno</span>}
                          <span className="comment-date">{formatDate(c.createdAt)}</span>
                        </div>
                        <p>{c.content}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="comment-form">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Agregar comentario..."
                    rows={3}
                  />
                  <div className="comment-actions">
                    {isAdmin && (
                      <label className="internal-check">
                        <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                        Interno
                      </label>
                    )}
                    <button className="btn-primary" onClick={handleSendComment} disabled={commentSending || !newComment.trim()}>
                      {commentSending ? 'Enviando...' : 'Comentar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal asignar proveedor */}
      {assignTicket && (
        <div className="modal-overlay" onClick={() => setAssignTicket(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Asignar proveedor</h2>
              <button className="modal-close" onClick={() => setAssignTicket(null)}>x</button>
            </div>
            <div className="confirm-body">
              <p>Ticket: <strong>{assignTicket.title}</strong></p>
              <select
                value={assignProviderId}
                onChange={e => setAssignProviderId(e.target.value)}
                className="status-filter"
                style={{ width: '100%', marginTop: '8px' }}
              >
                <option value="">-- Seleccionar proveedor --</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-secondary" onClick={() => setAssignTicket(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAssign} disabled={assignLoading || !assignProviderId}>
                {assignLoading ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar cambio de proveedor */}
      {confirmChange && (
        <div className="modal-overlay" onClick={() => setConfirmChange(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar cambio de proveedor</h2>
              <button className="modal-close" onClick={() => setConfirmChange(null)}>x</button>
            </div>
            <div className="confirm-body">
              <p>Ticket <strong>#{confirmChange.ticket.ticketNumber || confirmChange.ticket.id?.slice(0, 6)}</strong>: {confirmChange.ticket.title}</p>
              <p style={{ marginTop: '12px' }}>
                <span className="text-muted">Proveedor actual:</span> <strong>{getProviderName(confirmChange.oldProviderId)}</strong>
              </p>
              <p>
                <span className="text-muted">Nuevo proveedor:</span> <strong>{getProviderName(confirmChange.newProviderId)}</strong>
              </p>
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirmChange(null)}>Cancelar</button>
              <button className="btn-primary" onClick={() => doAssign(confirmChange.ticket.id, confirmChange.newProviderId)} disabled={assignLoading}>
                {assignLoading ? 'Cambiando...' : 'Confirmar cambio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRO-092: modal de motivo para cancelar */}
      {statusChange && (
        <div className="modal-overlay" onClick={() => setStatusChange(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{statusChange.action.label}</h2>
              <button className="modal-close" onClick={() => setStatusChange(null)}>x</button>
            </div>
            <div className="confirm-body">
              <p>Ticket: <strong>{statusChange.ticket.title}</strong></p>
              <textarea value={statusReason} onChange={e => setStatusReason(e.target.value)} placeholder="Motivo..."
                        rows={3} style={{ width: '100%', marginTop: '8px', resize: 'vertical' }} />
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-secondary" onClick={() => setStatusChange(null)}>Volver</button>
              <button className="btn-danger" disabled={statusLoading || !statusReason.trim()}
                      onClick={() => doStatusChange(statusChange.ticket, statusChange.action, statusReason.trim())}>
                {statusLoading ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal rechazar */}
      {rejectTicket && (
        <div className="modal-overlay" onClick={() => setRejectTicket(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rechazar ticket</h2>
              <button className="modal-close" onClick={() => setRejectTicket(null)}>x</button>
            </div>
            <div className="confirm-body">
              <p>Ticket: <strong>{rejectTicket.title}</strong></p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Motivo del rechazo..."
                rows={3}
                style={{ width: '100%', marginTop: '8px', resize: 'vertical' }}
              />
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-secondary" onClick={() => setRejectTicket(null)}>Cancelar</button>
              <button className="btn-danger" onClick={handleReject} disabled={rejectLoading || !rejectReason.trim()}>
                {rejectLoading ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Tickets;
