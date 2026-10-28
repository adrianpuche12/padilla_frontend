import { useEffect, useRef, useState } from 'react';
import api, { errorMessage } from '../services/api';
import '../pages/Modules.css';

/**
 * PRO-102 / PRO-103: adjuntos de una entidad (TICKET, CONTRATO, PROPIEDAD, CLIENTE, PROVEEDOR, RESERVA).
 * Imagenes y PDF hasta 10 MB. El backend decide quien ve y quien sube (misma regla que la entidad).
 */
function Attachments({ entityType, entityId, canUpload = true, withExpiry = false, title = 'Archivos adjuntos' }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [vence, setVence] = useState('');
  const fileRef = useRef();

  const cargar = () => api.get('/api/attachments', { params: { entityType, entityId } })
    .then(r => setItems(r.data)).catch(err => setError(errorMessage(err)));

  useEffect(() => { cargar(); }, [entityType, entityId]); // eslint-disable-line react-hooks/exhaustive-deps

  const subir = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('El archivo supera los 10 MB'); return; }
    const data = new FormData();
    data.append('file', file);
    data.append('entityType', entityType);
    data.append('entityId', entityId);
    if (withExpiry && vence) data.append('vence', vence);
    setUploading(true); setError(null);
    try {
      await api.post('/api/attachments', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setVence('');
      cargar();
    } catch (err) { setError(errorMessage(err, 'No se pudo subir el archivo')); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const abrir = async (a) => {
    try {
      const res = await api.get(`/api/attachments/${a.id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) { setError(errorMessage(err)); }
  };

  const borrar = async (a) => {
    try { await api.delete(`/api/attachments/${a.id}`); cargar(); }
    catch (err) { setError(errorMessage(err)); }
  };

  return (
    <div className="detail-section">
      <h3 className="detail-section-title">{title}</h3>
      {items.length === 0 ? <p className="module-muted">Sin archivos.</p> : (
        <ul className="module-list">
          {items.map(a => (
            <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <button className="link-btn" onClick={() => abrir(a)}>{a.nombre}</button>
              <span className="module-muted">{a.vence ? `vence ${a.vence}` : `${Math.ceil(a.sizeBytes / 1024)} KB`}</span>
              <button className="action-btn danger" onClick={() => borrar(a)} title="Borrar adjunto">✕</button>
            </li>
          ))}
        </ul>
      )}
      {canUpload && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {withExpiry && <label className="module-field">Vence<input type="date" value={vence} onChange={e => setVence(e.target.value)} /></label>}
          <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={subir} disabled={uploading} aria-label="Subir archivo" />
          {uploading && <span className="module-muted">Subiendo...</span>}
        </div>
      )}
      {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError(null)}>×</button></div>}
    </div>
  );
}

export default Attachments;
