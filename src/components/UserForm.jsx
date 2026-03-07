import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserForm.css';

const ALL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ADMIN', 'OWNER', 'TENANT', 'PROVIDER'];

const ROLE_LEVEL = {
  SUPER_ADMIN: 0,
  MANAGER: 1,
  ADMIN: 2,
  OWNER: 3,
  TENANT: 3,
  PROVIDER: 3,
};

function UserForm({ user, onSubmit, onClose, isLoading, error }) {
  const { roles } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '' });
  const [errors, setErrors] = useState({});

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', role: user.role || '' });
    }
  }, [user]);

  const getCreatableRoles = () => {
    const callerLevel = Math.min(
      ...roles.map(r => r.toUpperCase()).filter(r => ROLE_LEVEL[r] !== undefined).map(r => ROLE_LEVEL[r])
    );
    return ALL_ROLES.filter(r => ROLE_LEVEL[r] > callerLevel);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.email.trim()) newErrors.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'El email no es válido';
    if (!isEditing && !form.role) newErrors.role = 'El rol es obligatorio';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    const payload = isEditing
      ? { name: form.name, phone: form.phone }
      : { name: form.name, email: form.email, phone: form.phone, role: form.role };
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar usuario' : 'Nuevo usuario'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Nombre *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre completo" className={errors.name ? 'input-error' : ''} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-field">
            <label>Email *</label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="email@ejemplo.com" disabled={isEditing} className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-field">
            <label>Teléfono</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+54 11 1234-5678" />
          </div>
          {!isEditing && (
            <div className="form-field">
              <label>Rol *</label>
              <select name="role" value={form.role} onChange={handleChange} className={errors.role ? 'input-error' : ''}>
                <option value="">Seleccionar rol...</option>
                {getCreatableRoles().map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.role && <span className="field-error">{errors.role}</span>}
            </div>
          )}
          {isEditing && (
            <div className="form-field">
              <label>Rol</label>
              <input value={form.role} disabled />
            </div>
          )}
          {error && <div className="form-error-banner">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
