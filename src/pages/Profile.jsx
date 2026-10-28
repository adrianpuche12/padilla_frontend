import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import meService from '../services/meService';
import { errorMessage } from '../services/api';
import './Modules.css';

const ROL = { SUPER_ADMIN: 'Super administrador', MANAGER: 'Gerente', ADMIN: 'Administrador', OWNER: 'Propietario', TENANT: 'Inquilino', PROVIDER: 'Proveedor' };

/** PRO-101: "Mi perfil" para los 6 roles: datos de contacto y cambio de contraseña. */
function Profile() {
  const [me, setMe] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState(null);
  const [pwError, setPwError] = useState(null);

  useEffect(() => {
    meService.getMe().then(setMe).catch(err => setError(errorMessage(err)));
  }, []);

  if (!me) return <Layout title="Mi perfil"><p className="module-muted">{error || 'Cargando...'}</p></Layout>;

  const esCliente = ['OWNER', 'TENANT', 'PROVIDER'].includes(me.role);
  const set = (k, v) => setMe(m => ({ ...m, [k]: v }));

  const guardar = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null); setError(null);
    try {
      setMe(await meService.updateMe({ name: me.name, phone: me.phone, address: me.address, city: me.city, province: me.province }));
      setMsg('Datos actualizados');
    } catch (err) { setError(errorMessage(err)); } finally { setSaving(false); }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    setPwMsg(null); setPwError(null);
    if (pw.newPassword !== pw.confirm) { setPwError('Las contraseñas nuevas no coinciden'); return; }
    try {
      await meService.changePassword(pw.currentPassword, pw.newPassword);
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg('Contraseña actualizada');
    } catch (err) { setPwError(errorMessage(err)); }
  };

  return (
    <Layout title="Mi perfil">
      <div className="module-page">
        <form className="module-card" onSubmit={guardar}>
          <h3>Mis datos</h3>
          <p className="module-muted">{ROL[me.role] || me.role} · {me.agencyName} · {me.email}</p>
          <div className="module-grid">
            <label className="module-field">Nombre<input value={me.name || ''} onChange={e => set('name', e.target.value)} required /></label>
            <label className="module-field">Teléfono<input value={me.phone || ''} onChange={e => set('phone', e.target.value)} /></label>
            {esCliente && <>
              <label className="module-field">Domicilio<input value={me.address || ''} onChange={e => set('address', e.target.value)} /></label>
              <label className="module-field">Ciudad<input value={me.city || ''} onChange={e => set('city', e.target.value)} /></label>
              <label className="module-field">Provincia<input value={me.province || ''} onChange={e => set('province', e.target.value)} /></label>
            </>}
          </div>
          {error && <div className="error-banner"><span>{error}</span></div>}
          {msg && <p className="module-ok">{msg}</p>}
          <div className="module-actions"><button className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></div>
        </form>

        <form className="module-card" onSubmit={cambiarPassword}>
          <h3>Cambiar contraseña</h3>
          <p className="module-muted">Mínimo 8 caracteres, con una mayúscula, un número y un símbolo.</p>
          <div className="module-grid">
            <label className="module-field">Contraseña actual<input type="password" autoComplete="current-password" value={pw.currentPassword} onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))} required /></label>
            <label className="module-field">Contraseña nueva<input type="password" autoComplete="new-password" value={pw.newPassword} onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} required /></label>
            <label className="module-field">Repetir contraseña nueva<input type="password" autoComplete="new-password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required /></label>
          </div>
          {pwError && <div className="error-banner"><span>{pwError}</span></div>}
          {pwMsg && <p className="module-ok">{pwMsg}</p>}
          <div className="module-actions"><button className="btn-primary">Cambiar contraseña</button></div>
        </form>
      </div>
    </Layout>
  );
}

export default Profile;
