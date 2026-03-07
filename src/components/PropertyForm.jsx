import { useState, useEffect } from 'react';
import './UserForm.css';

const PROPERTY_TYPES = ['HOUSE', 'APARTMENT', 'COMMERCIAL', 'LAND'];
const PROPERTY_STATUSES = ['AVAILABLE', 'RENTED', 'FOR_SALE', 'MAINTENANCE'];

const TYPE_LABEL = { HOUSE: 'Casa', APARTMENT: 'Departamento', COMMERCIAL: 'Comercial', LAND: 'Terreno' };
const STATUS_LABEL = { AVAILABLE: 'Disponible', RENTED: 'Alquilada', FOR_SALE: 'En venta', MAINTENANCE: 'Mantenimiento' };

function PropertyForm({ property, owners, onSubmit, onClose, isLoading, error }) {
  const [form, setForm] = useState({
    address: '',
    type: '',
    squareMeters: '',
    rooms: '',
    ownerId: '',
    status: 'AVAILABLE',
  });
  const [errors, setErrors] = useState({});

  const isEditing = !!property;

  useEffect(() => {
    if (property) {
      setForm({
        address: property.address || '',
        type: property.type || '',
        squareMeters: property.squareMeters || '',
        rooms: property.rooms || '',
        ownerId: property.ownerId || '',
        status: property.status || 'AVAILABLE',
      });
    }
  }, [property]);

  const validate = () => {
    const newErrors = {};
    if (!form.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!form.type) newErrors.type = 'El tipo es obligatorio';
    if (!isEditing && !form.ownerId) newErrors.ownerId = 'El propietario es obligatorio';
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
          address: form.address,
          squareMeters: form.squareMeters ? parseFloat(form.squareMeters) : null,
          rooms: form.rooms ? parseInt(form.rooms) : null,
          status: form.status,
        }
      : {
          address: form.address,
          type: form.type,
          squareMeters: form.squareMeters ? parseFloat(form.squareMeters) : null,
          rooms: form.rooms ? parseInt(form.rooms) : null,
          ownerId: form.ownerId,
        };
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar propiedad' : 'Nueva propiedad'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Dirección *</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Ej: Av. Corrientes 1234, CABA" className={errors.address ? 'input-error' : ''} />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="form-field">
            <label>Tipo *</label>
            {isEditing ? (
              <input value={TYPE_LABEL[form.type] || form.type} disabled />
            ) : (
              <select name="type" value={form.type} onChange={handleChange} className={errors.type ? 'input-error' : ''}>
                <option value="">Seleccionar tipo...</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            )}
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>M²</label>
              <input name="squareMeters" type="number" value={form.squareMeters} onChange={handleChange} placeholder="Ej: 75" min="0" />
            </div>
            <div className="form-field">
              <label>Ambientes</label>
              <input name="rooms" type="number" value={form.rooms} onChange={handleChange} placeholder="Ej: 3" min="0" />
            </div>
          </div>

          {!isEditing && (
            <div className="form-field">
              <label>Propietario *</label>
              <select name="ownerId" value={form.ownerId} onChange={handleChange} className={errors.ownerId ? 'input-error' : ''}>
                <option value="">Seleccionar propietario...</option>
                {(owners || []).map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
              </select>
              {errors.ownerId && <span className="field-error">{errors.ownerId}</span>}
            </div>
          )}

          {isEditing && (
            <div className="form-field">
              <label>Estado</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
          )}

          {error && <div className="form-error-banner">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear propiedad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyForm;
