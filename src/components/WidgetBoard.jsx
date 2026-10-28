import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import '../pages/Modules.css';

/**
 * PRO-105 (Widget Registry): el dashboard muestra los widgets que el usuario eligio entre los
 * permitidos para su rol. El backend arma los datos en paralelo; aca se dibujan de forma generica:
 * - objeto -> indicadores (numero grande por campo)
 * - lista  -> tabla chica
 */
const ETIQUETAS = {
  abiertos: 'Abiertos', enProceso: 'En proceso', total: 'Total', fueraDeSla: 'Fuera de SLA', slaHoras: 'SLA (h)',
  horas: 'Horas promedio', tickets: 'Tickets', activos: 'Activos', promedio: 'Promedio', respuestas: 'Respuestas',
  negativas: 'Negativas', evaluaciones: 'Evaluaciones', monto: 'Alquiler', vence: 'Vence', direccion: 'Dirección',
  moneda: 'Moneda', estado: 'Estado', cantidad: 'Cantidad', categoria: 'Tipo', nombre: 'Nombre',
};
const etiqueta = (k) => ETIQUETAS[k] || k;
const ocultas = new Set(['id']);

export function WidgetContent({ data }) {
  if (data == null) return <p className="module-muted">Sin datos</p>;
  if (data.error) return <p className="module-muted">{data.error}</p>;
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="module-muted">Sin datos</p>;
    const cols = Object.keys(data[0]).filter(k => !ocultas.has(k));
    return (
      <table className="module-table">
        <thead><tr>{cols.map(c => <th key={c}>{etiqueta(c)}</th>)}</tr></thead>
        <tbody>{data.map((row, i) => <tr key={row.id || i}>{cols.map(c => <td key={c}>{String(row[c] ?? '-')}</td>)}</tr>)}</tbody>
      </table>
    );
  }
  const keys = Object.keys(data).filter(k => !ocultas.has(k));
  if (keys.length === 0) return <p className="module-muted">Sin datos</p>;
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
      {keys.map(k => (
        <div key={k}><div className="module-kpi">{data[k] ?? '-'}</div><div className="module-muted">{etiqueta(k)}</div></div>
      ))}
    </div>
  );
}

function WidgetBoard() {
  const [available, setAvailable] = useState([]);
  const [data, setData] = useState({});
  const [config, setConfig] = useState(false);
  const [error, setError] = useState(null);

  const cargar = async () => {
    try {
      const [a, d] = await Promise.all([api.get('/api/dashboard/widgets/available'), api.get('/api/dashboard/data')]);
      setAvailable(a.data);
      setData(d.data);
    } catch (err) { setError(errorMessage(err, 'No se pudo cargar el dashboard')); }
  };
  useEffect(() => { cargar(); }, []);

  const activos = available.filter(w => w.isEnabled).sort((a, b) => a.position - b.position);

  const toggle = (code) => setAvailable(av => av.map(w => (w.code === code ? { ...w, isEnabled: !w.isEnabled } : w)));
  const mover = (code, delta) => setAvailable(av => {
    const orden = [...av].sort((a, b) => a.position - b.position);
    const i = orden.findIndex(w => w.code === code);
    const j = i + delta;
    if (j < 0 || j >= orden.length) return av;
    [orden[i], orden[j]] = [orden[j], orden[i]];
    return orden.map((w, idx) => ({ ...w, position: idx + 1 }));
  });
  const guardar = async () => {
    try {
      await api.put('/api/dashboard/widgets/preferences',
        available.map(w => ({ widgetCode: w.code, isEnabled: !!w.isEnabled, position: w.position })));
      setConfig(false);
      cargar();
    } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <div className="module-page" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={() => setConfig(c => !c)}>{config ? 'Cerrar' : '⚙️ Personalizar dashboard'}</button>
      </div>
      {error && <div className="error-banner"><span>{error}</span></div>}
      {config && (
        <div className="module-card">
          <h3>Elegí qué ver</h3>
          <ul className="module-list">
            {[...available].sort((a, b) => a.position - b.position).map(w => (
              <li key={w.code} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={!!w.isEnabled} onChange={() => toggle(w.code)} aria-label={w.title} />
                <span style={{ flex: 1 }}><strong>{w.title}</strong> <span className="module-muted">{w.description}</span></span>
                <button className="action-btn" onClick={() => mover(w.code, -1)} aria-label={`Subir ${w.title}`}>↑</button>
                <button className="action-btn" onClick={() => mover(w.code, 1)} aria-label={`Bajar ${w.title}`}>↓</button>
              </li>
            ))}
          </ul>
          <div className="module-actions"><button className="btn-primary" onClick={guardar}>Guardar</button></div>
        </div>
      )}
      <div className="module-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {activos.map(w => (
          <div key={w.code} className="module-card" data-testid={`widget-${w.code}`}>
            <h3>{w.title}</h3>
            <WidgetContent data={data[w.code]} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default WidgetBoard;
