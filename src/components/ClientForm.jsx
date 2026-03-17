import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserForm.css';

const CLIENT_ROLES = ['OWNER', 'TENANT', 'PROVIDER'];
const ROLE_LEVEL = { SUPER_ADMIN: 0, MANAGER: 1, ADMIN: 2, OWNER: 3, TENANT: 3, PROVIDER: 3 };

const ROLE_LABELS = {
  OWNER: 'Propietario',
  TENANT: 'Inquilino',
  PROVIDER: 'Proveedor',
};

const PERSONA_TYPES = [
  { value: 'FISICA', label: 'Persona Física' },
  { value: 'JURIDICA', label: 'Persona Jurídica' },
];

const DOCUMENT_TYPES = ['DNI', 'CUIT', 'CUIL', 'PASAPORTE'];

const IVA_CONDITIONS = [
  'Consumidor Final',
  'Responsable Inscripto',
  'Monotributista',
  'Exento',
  'No Responsable',
];

function ClientForm({ client, onSubmit, onClose, isLoading, error }) {
  const { roles } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    personaType: 'FISICA',
    documentType: 'DNI',
    documentNumber: '',
    cuitCuil: '',
    address: '',
    city: '',
    province: '',
    ivaCondition: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const isEditing = !!client;

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        role: client.role || '',
        personaType: client.personaType || 'FISICA',
        documentType: client.documentType || 'DNI',
        documentNumber: client.documentNumber || '',
        cuitCuil: client.cuitCuil || '',
        address: client.address || '',
        city: client.city || '',
        province: client.province || '',
        ivaCondition: client.ivaCondition || '',
        notes: client.notes || '',
      });
    }
  }, [client]);

  const getCreatableRoles = () => {
    const callerLevel = Math.min(
      ...roles.map(r => r.toUpperCase()).filter(r => ROLE_LEVEL[r] !== undefined).map(r => ROLE_LEVEL[r]),
      99
    );
    return CLIENT_ROLES.filter(r => ROLE_LEVEL[r] > callerLevel);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!isEditing) {
      if (!form.email.trim()) newErrors.email = 'El email es obligatorio';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email inválido';
      if (!form.role) newErrors.role = 'El tipo de cliente es obligatorio';
    }
    if (!form.personaType) newErrors.personaType = 'El tipo de persona es obligatorio';
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
      ? {
          name: form.name,
          phone: form.phone,
          personaType: form.personaType,
          documentType: form.documentType,
          documentNumber: form.documentNumber,
          cuitCuil: form.cuitCuil,
          address: form.address,
          city: form.city,
          province: form.province,
          ivaCondition: form.ivaCondition,
          notes: form.notes,
        }
      : { ...form };

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">

          {/* Sección: Datos de acceso */}
          <div className="form-section-title">Datos de acceso</div>

          <div className="form-field">
            <label>Nombre / Razón Social *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Apellido y nombre o razón social"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-field">
            <label>Email *</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@ejemplo.com"
              disabled={isEditing}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-field">
            <label>Teléfono</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+54 341 123-4567"
            />
          </div>

          {!isEditing && (
            <div className="form-field">
              <label>Tipo de cliente *</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className={errors.role ? 'input-error' : ''}
              >
                <option value="">Seleccionar tipo...</option>
                {getCreatableRoles().map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              {errors.role && <span className="field-error">{errors.role}</span>}
            </div>
          )}

          {isEditing && (
            <div className="form-field">
              <label>Tipo de cliente</label>
              <input value={ROLE_LABELS[form.role] || form.role} disabled />
            </div>
          )}

          {/* Sección: Datos del cliente */}
          <div className="form-section-title">Datos del cliente</div>

          <div className="form-row">
            <div className="form-field">
              <label>Tipo de persona *</label>
              <select
                name="personaType"
                value={form.personaType}
                onChange={handleChange}
                className={errors.personaType ? 'input-error' : ''}
              >
                {PERSONA_TYPES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              {errors.personaType && <span className="field-error">{errors.personaType}</span>}
            </div>

            <div className="form-field">
              <label>Tipo de documento</label>
              <select name="documentType" value={form.documentType} onChange={handleChange}>
                <option value="">Sin documento</option>
                {DOCUMENT_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Número de documento</label>
              <input
                name="documentNumber"
                value={form.documentNumber}
                onChange={handleChange}
                placeholder="12345678"
              />
            </div>

            <div className="form-field">
              <label>CUIT / CUIL</label>
              <input
                name="cuitCuil"
                value={form.cuitCuil}
                onChange={handleChange}
                placeholder="20-12345678-9"
              />
            </div>
          </div>

          <div className="form-field">
            <label>Domicilio</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Calle 123, Piso 2, Dpto B"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Localidad</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Rosario"
              />
            </div>

            <div className="form-field">
              <label>Provincia</label>
              <input
                name="province"
                value={form.province}
                onChange={handleChange}
                placeholder="Santa Fe"
              />
            </div>
          </div>

          <div className="form-field">
            <label>Condición IVA</label>
            <select name="ivaCondition" value={form.ivaCondition} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              {IVA_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label>Notas</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Observaciones adicionales..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && <div className="form-error-banner">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientForm;
