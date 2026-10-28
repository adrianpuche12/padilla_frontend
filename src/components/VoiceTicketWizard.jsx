import { useEffect, useRef, useState } from 'react';
import api, { errorMessage } from '../services/api';
import '../pages/Modules.css';

/**
 * PRO-103: modo de carga "voz guiada" (Saas/Modos de Carga de Incidencias, modo 2) pensado para
 * personas mayores: 4 pantallas, botones grandes, maximo 4 opciones, voz en el texto y confirmacion.
 *   1. Tipo de problema  2. Descripcion (mantener apretado para hablar, es-AR, texto editable)
 *   3. Foto opcional     4. Resumen y "Enviar"
 * El backend no depende del modo: es el mismo POST con modoCarga = VOZ_GUIADA.
 */
const TIPOS = [
  { cat: 'PLOMERIA', label: 'Agua / plomería', icon: '🚰' },
  { cat: 'ELECTRICIDAD', label: 'Luz / electricidad', icon: '💡' },
  { cat: 'PINTURA', label: 'Paredes / pintura', icon: '🎨' },
  { cat: 'OTRO', label: 'Otro problema', icon: '🛠️' },
];
const BIG = { fontSize: 20, padding: '18px 16px', minHeight: 64, borderRadius: 12 };

export function speechSupported() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function VoiceTicketWizard({ propertyId, onClose, onCreated }) {
  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState(null);
  const [texto, setTexto] = useState('');
  const [foto, setFoto] = useState(null);
  const [escuchando, setEscuchando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const inicio = useRef(Date.now());
  const reco = useRef(null);

  useEffect(() => () => reco.current?.stop?.(), []);

  const hablar = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'es-AR';
    r.interimResults = false;
    r.onresult = (e) => setTexto(t => (t ? t + ' ' : '') + Array.from(e.results).map(x => x[0].transcript).join(' '));
    r.onend = () => setEscuchando(false);
    r.onerror = () => setEscuchando(false);
    reco.current = r;
    setEscuchando(true);
    r.start();
  };
  const soltar = () => reco.current?.stop?.();

  const enviar = async () => {
    setEnviando(true); setError(null);
    try {
      const t = TIPOS.find(x => x.cat === tipo);
      const res = await api.post('/api/tickets', {
        title: t.label + (texto ? ': ' + texto.slice(0, 60) : ''),
        description: texto || t.label,
        category: tipo,
        priority: 'NORMAL',
        propertyId,
        modoCarga: 'VOZ_GUIADA',
        tiempoCargaSegundos: Math.round((Date.now() - inicio.current) / 1000),
        dispositivo: 'Web',
      });
      if (foto) {
        const data = new FormData();
        data.append('file', foto);
        await api.post(`/api/tickets/${res.data.id}/attachments`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onCreated?.(res.data);
    } catch (err) { setError(errorMessage(err, 'No se pudo enviar el pedido')); }
    finally { setEnviando(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, fontSize: 18 }} role="dialog" aria-label="Pedido por voz">
        <div className="modal-header">
          <h2 style={{ fontSize: 24 }}>Paso {paso} de 4</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {paso === 1 && <>
            <p style={{ fontSize: 22 }}>¿Qué problema tenés?</p>
            {TIPOS.map(t => (
              <button key={t.cat} className="btn-secondary" style={BIG} onClick={() => { setTipo(t.cat); setPaso(2); }}>
                {t.icon} {t.label}
              </button>
            ))}
          </>}
          {paso === 2 && <>
            <p style={{ fontSize: 22 }}>Contanos qué pasa</p>
            {speechSupported() ? (
              <button className="btn-primary" style={{ ...BIG, background: escuchando ? '#c0392b' : undefined }}
                      onMouseDown={hablar} onMouseUp={soltar} onTouchStart={hablar} onTouchEnd={soltar}>
                {escuchando ? '🎙️ Te escucho… soltá para terminar' : '🎙️ Mantené apretado para hablar'}
              </button>
            ) : <p className="module-muted">Tu navegador no permite dictar: escribilo acá abajo.</p>}
            <textarea rows={4} value={texto} onChange={e => setTexto(e.target.value)} style={{ fontSize: 18 }}
                      aria-label="Descripción del problema" placeholder="O escribilo acá" />
            <button className="btn-primary" style={BIG} disabled={!texto.trim()} onClick={() => setPaso(3)}>Siguiente</button>
          </>}
          {paso === 3 && <>
            <p style={{ fontSize: 22 }}>¿Querés sumar una foto?</p>
            <label className="btn-secondary" style={{ ...BIG, textAlign: 'center', cursor: 'pointer' }}>
              📷 {foto ? 'Foto lista: ' + foto.name : 'Sacar o elegir foto'}
              <input type="file" accept="image/*" capture="environment" hidden onChange={e => setFoto(e.target.files?.[0] || null)} />
            </label>
            <button className="btn-primary" style={BIG} onClick={() => setPaso(4)}>{foto ? 'Siguiente' : 'Saltar este paso'}</button>
          </>}
          {paso === 4 && <>
            <p style={{ fontSize: 22 }}>Revisá tu pedido</p>
            <p><strong>Problema:</strong> {TIPOS.find(t => t.cat === tipo)?.label}</p>
            <p><strong>Detalle:</strong> {texto}</p>
            <p><strong>Foto:</strong> {foto ? 'Sí' : 'No'}</p>
            {error && <div className="error-banner"><span>{error}</span></div>}
            <button className="btn-primary" style={BIG} disabled={enviando} onClick={enviar}>{enviando ? 'Enviando…' : '✅ Enviar pedido'}</button>
            <button className="btn-secondary" style={BIG} onClick={() => setPaso(2)}>✏️ Editar algo</button>
          </>}
        </div>
      </div>
    </div>
  );
}

export default VoiceTicketWizard;
