/**
 * PRO-092: acciones de estado que puede hacer cada rol sobre un ticket (misma maquina de estados que
 * el backend: ABIERTA -> EN_PROCESO -> RESUELTA -> CERRADA, rechazo, cancelacion y reapertura).
 */
export function statusActions(ticket, { isAdmin, isTenant, isProvider, userId }) {
  const s = ticket.status;
  if (isAdmin) {
    return {
      ABIERTA: [{ to: 'EN_PROCESO', label: 'Tomar' }, { to: 'CANCELADA', label: 'Cancelar', danger: true, reason: true }],
      EN_PROCESO: [{ to: 'RESUELTA', label: 'Resolver' }, { to: 'CANCELADA', label: 'Cancelar', danger: true, reason: true }],
      RESUELTA: [{ to: 'CERRADA', label: 'Cerrar' }, { to: 'EN_PROCESO', label: 'Reabrir' }],
    }[s] || [];
  }
  if (isProvider && ticket.providerId === userId) {
    return { ABIERTA: [{ to: 'EN_PROCESO', label: 'Comenzar' }], EN_PROCESO: [{ to: 'RESUELTA', label: 'Marcar resuelto' }] }[s] || [];
  }
  if (isTenant && s === 'ABIERTA') {
    return [{ to: 'CANCELADA', label: 'Cancelar pedido', danger: true, reason: true }];
  }
  return [];
}
