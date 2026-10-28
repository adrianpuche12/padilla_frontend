import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import settingsService from '../services/settingsService';
import { errorMessage } from '../services/api';
import './Modules.css';

const VACIO = { name: '', slug: '', plan: 'STARTER', adminName: '', adminEmail: '' };

/** PRO-100: alta de inmobiliarias (personal de plataforma de Nilo, rol PLATFORM_ADMIN). */
function Platform() {
  const [agencias, setAgencias] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [saving, setSaving] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const cargar = () => settingsService.listAgencies().then(setAgencias).catch(err => setError(errorMessage(err)));
  useEffect(() => { cargar(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const alta = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null); setResultado(null);
    try {
      const r = await settingsService.onboardAgency(form);
      setResultado(r);
      setForm(VACIO);
      cargar();
    } catch (err) {
      const campos = err?.response?.data?.fields;
      setError(campos ? Object.values(campos).join(' · ') : errorMessage(err));
    } finally { setSaving(false); }
  };

  return (
    <Layout title="Plataforma">
      <div className="module-page">
        <form className="module-card" onSubmit={alta}>
          <h3>Dar de alta una inmobiliaria</h3>
          <div className="module-grid">
            <label className="module-field">Nombre<input value={form.name} onChange={e => set('name', e.target.value)} required /></label>
            <label className="module-field">Identificador (minúsculas y guiones)
              <input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase())} pattern="[a-z0-9-]{3,60}" required />
            </label>
            <label className="module-field">Plan
              <select value={form.plan} onChange={e => set('plan', e.target.value)}>
                <option value="STARTER">Starter</option><option value="PRO">Pro</option><option value="SCALE">Scale</option>
              </select>
            </label>
            <label className="module-field">Administrador (nombre)<input value={form.adminName} onChange={e => set('adminName', e.target.value)} required /></label>
            <label className="module-field">Administrador (email)<input type="email" value={form.adminEmail} onChange={e => set('adminEmail', e.target.value)} required /></label>
          </div>
          {error && <div className="error-banner"><span>{error}</span></div>}
          {resultado && (
            <p className="module-ok">
              Inmobiliaria <strong>{resultado.agency.name}</strong> creada. Se envió el mail de bienvenida al administrador.
              Contraseña temporal (válida 24 h): <code>{resultado.temporaryPassword}</code>
            </p>
          )}
          <div className="module-actions"><button className="btn-primary" disabled={saving}>{saving ? 'Creando...' : 'Crear inmobiliaria'}</button></div>
        </form>

        <div className="module-card">
          <h3>Inmobiliarias</h3>
          <table className="module-table">
            <thead><tr><th>Nombre</th><th>Identificador</th><th>Plan</th><th>Estado</th></tr></thead>
            <tbody>
              {agencias.map(a => (
                <tr key={a.id}><td>{a.name}</td><td>{a.slug}</td><td>{a.plan}</td><td>{a.active ? 'Activa' : 'Inactiva'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default Platform;
