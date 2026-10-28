import { useEffect, useState } from 'react';
import settingsService from '../services/settingsService';
import { errorMessage } from '../services/api';
import '../pages/Modules.css';

const CAMPOS = [
  ['razonSocial', 'Razón social'], ['nombreComercial', 'Nombre comercial'], ['cuit', 'CUIT'],
  ['corredorNombre', 'Corredor responsable'], ['corredorMatricula', 'Matrícula'], ['colegio', 'Colegio'],
  ['emailContratos', 'Email de contratos'], ['telefono', 'Teléfono'], ['domicilio', 'Domicilio'],
  ['ciudad', 'Ciudad'], ['provincia', 'Provincia'], ['jurisdiccion', 'Jurisdicción (tribunales)'],
  ['plataformaPago', 'Plataforma de pago'], ['logoUrl', 'URL del logo'],
];

/**
 * PRO-100: datos legales y de marca de la inmobiliaria (los usan los documentos de reserva y los mails),
 * reglas operativas y plan. Solo el SUPER_ADMIN edita.
 */
function AgencySettingsSection({ canEdit }) {
  const [form, setForm] = useState(null);
  const [rules, setRules] = useState(null);
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([settingsService.getAgency(), settingsService.getRules(), settingsService.getPlan()])
      .then(([a, r, p]) => { setForm(a); setRules(r); setPlan(p); })
      .catch(err => setError(errorMessage(err, 'No se pudo cargar la configuración')));
  }, []);

  if (error && !form) return <div className="error-banner"><span>{error}</span></div>;
  if (!form) return <p className="module-muted">Cargando configuración...</p>;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setR = (k, v) => setRules(r => ({ ...r, [k]: v }));

  const guardar = async () => {
    setSaving(true); setMsg(null); setError(null);
    try {
      const saved = await settingsService.updateAgency({
        ...form,
        comisionPct: form.comisionPct === '' ? null : form.comisionPct,
        slaHoras: Number(rules.slaHoras), montoCritico: rules.montoCritico === '' ? null : rules.montoCritico,
        emailDesdeHora: Number(rules.emailDesdeHora), emailHastaHora: Number(rules.emailHastaHora),
      });
      setForm(saved);
      setMsg('Configuración guardada. Los documentos de reserva ya usan estos datos.');
    } catch (err) {
      const campos = err?.response?.data?.fields;
      setError(campos ? Object.entries(campos).map(([k, v]) => `${k}: ${v}`).join(' · ') : errorMessage(err));
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="module-card">
        <h3>Datos de la inmobiliaria</h3>
        <p className="module-muted">{form.agencyName} · Plan {plan?.plan}
          {plan?.maxProperties ? ` (hasta ${plan.maxProperties} propiedades y ${plan.maxAdmins} administradores)` : ' (sin límites)'}</p>
        <div className="module-grid">
          {CAMPOS.map(([k, label]) => (
            <label key={k} className="module-field">{label}
              <input value={form[k] ?? ''} onChange={e => set(k, e.target.value)} disabled={!canEdit} />
            </label>
          ))}
          <label className="module-field">Comisión (%)
            <input type="number" step="0.01" min="0" max="100" value={form.comisionPct ?? ''} onChange={e => set('comisionPct', e.target.value)} disabled={!canEdit} />
          </label>
          <label className="module-field">Comisión + IVA
            <select value={form.comisionIva ? 'si' : 'no'} onChange={e => set('comisionIva', e.target.value === 'si')} disabled={!canEdit}>
              <option value="si">Sí</option><option value="no">No</option>
            </select>
          </label>
          <label className="module-field">Color de marca
            <input type="color" value={form.colorPrimario || '#1A6B5A'} onChange={e => set('colorPrimario', e.target.value.toUpperCase())} disabled={!canEdit} />
          </label>
        </div>
      </div>

      <div className="module-card">
        <h3>Reglas operativas</h3>
        <div className="module-grid">
          <label className="module-field">SLA: horas para tomar un ticket
            <input type="number" min="1" max="720" value={rules.slaHoras ?? 48} onChange={e => setR('slaHoras', e.target.value)} disabled={!canEdit} />
          </label>
          <label className="module-field">Monto crítico de presupuestos ($)
            <input type="number" min="0" value={rules.montoCritico ?? ''} onChange={e => setR('montoCritico', e.target.value)} disabled={!canEdit}
                   placeholder="Sin límite" />
          </label>
          <label className="module-field">Mails desde (hora)
            <input type="number" min="0" max="23" value={rules.emailDesdeHora ?? 8} onChange={e => setR('emailDesdeHora', e.target.value)} disabled={!canEdit} />
          </label>
          <label className="module-field">Mails hasta (hora)
            <input type="number" min="1" max="24" value={rules.emailHastaHora ?? 20} onChange={e => setR('emailHastaHora', e.target.value)} disabled={!canEdit} />
          </label>
        </div>
        <p className="module-muted">Avisos que no se pueden silenciar: {(rules.tiposObligatorios || []).join(', ')}</p>
      </div>

      {error && <div className="error-banner"><span>{error}</span></div>}
      {msg && <p className="module-ok">{msg}</p>}
      {canEdit && (
        <div className="module-actions">
          <button className="btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando...' : 'Guardar configuración'}</button>
        </div>
      )}
    </>
  );
}

export default AgencySettingsSection;
