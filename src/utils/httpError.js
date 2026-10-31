/**
 * PRO-111 (A-04): traduce un error de axios a un mensaje entendible. Antes un 500, un 403 o un
 * rechazo de CORS se mostraban todos como "Error al conectar con el servidor".
 *
 * @param {unknown} err
 * @param {Record<number, string | ((data:any) => string | undefined)>} [byStatus] mensajes por status
 */
export function describeHttpError(err, byStatus = {}) {
  if (!err?.response) {
    if (err?.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder. Intentá de nuevo.';
    return 'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.';
  }

  const { status, data } = err.response;
  const custom = byStatus[status];
  const customMsg = typeof custom === 'function' ? custom(data) : custom;
  if (customMsg) return customMsg;

  if (status === 429) return 'Demasiados intentos. Esperá un momento y volvé a intentar.';
  if (status >= 500) return 'El servidor tuvo un problema. Intentá de nuevo en unos minutos.';
  return (typeof data === 'object' && data?.message) || 'Ocurrió un error inesperado. Intentá de nuevo.';
}
