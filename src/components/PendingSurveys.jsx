import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import '../pages/Modules.css';

/**
 * PRO-106: encuesta post-cierre. Al cerrar un ticket, el backend crea una encuesta para el
 * inquilino y el propietario (PRO-071). Acá se muestran las pendientes: estrellas de 1 a 5 y
 * un comentario opcional. Si no hay pendientes, no se muestra nada.
 */
function PendingSurveys() {
  const [pendientes, setPendientes] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [error, setError] = useState(null);
  const [gracias, setGracias] = useState(false);

  useEffect(() => { api.get('/api/surveys/pending').then(r => setPendientes(r.data || [])).catch(() => {}); }, []);

  const set = (id, campo, valor) => setRespuestas(r => ({ ...r, [id]: { ...r[id], [campo]: valor } }));

  const enviar = async (s) => {
    const r = respuestas[s.id] || {};
    if (!r.puntuacion) { setError('Elegí de 1 a 5 estrellas'); return; }
    try {
      await api.post(`/api/surveys/${s.id}/answer`, { puntuacion: r.puntuacion, comentario: r.comentario || null });
      setPendientes(p => p.filter(x => x.id !== s.id));
      setError(null);
      setGracias(true);
    } catch (err) { setError(errorMessage(err, 'No se pudo enviar la encuesta')); }
  };

  if (pendientes.length === 0) {
    return gracias ? <div className="module-card"><p className="module-ok">¡Gracias por tu opinión!</p></div> : null;
  }

  return (
    <div className="module-card" data-testid="pending-surveys">
      <h3>¿Cómo resolvimos tu pedido?</h3>
      {error && <div className="error-banner"><span>{error}</span></div>}
      {pendientes.map(s => {
        const r = respuestas[s.id] || {};
        return (
          <div key={s.id} style={{ borderTop: '1px solid #eee', padding: '10px 0' }}>
            <strong>Ticket #{s.ticketNumber}</strong> {s.title}
            <div role="radiogroup" aria-label={`Puntuación del ticket ${s.ticketNumber}`} style={{ fontSize: 26, margin: '6px 0' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" role="radio" aria-checked={r.puntuacion === n} aria-label={`${n} estrella${n === 1 ? '' : 's'}`}
                  onClick={() => set(s.id, 'puntuacion', n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: n <= (r.puntuacion || 0) ? '#f5a623' : '#ccc' }}>
                  ★
                </button>
              ))}
            </div>
            <textarea placeholder="Comentario (opcional)" value={r.comentario || ''} rows={2} style={{ width: '100%' }}
              onChange={e => set(s.id, 'comentario', e.target.value)} />
            <div className="module-actions"><button className="btn-primary" onClick={() => enviar(s)}>Enviar</button></div>
          </div>
        );
      })}
    </div>
  );
}

export default PendingSurveys;
