import { useState, useEffect } from 'react';
import './UserForm.css';

const PROPERTY_TYPES = [
  { value: 'CASA',             label: 'Casa' },
  { value: 'CASA_PLANTA_ALTA', label: 'Casa Planta Alta' },
  { value: 'COCHERA',          label: 'Cochera' },
  { value: 'DEPARTAMENTO',     label: 'Departamento' },
  { value: 'DEPTO_DUPLEX',     label: 'Depto. Duplex' },
  { value: 'DEPTO_PASILLO',    label: 'Depto. de pasillo' },
  { value: 'GALPON',           label: 'Galpón' },
  { value: 'LOCAL',            label: 'Local' },
  { value: 'OFICINA',          label: 'Oficina' },
  { value: 'TERRENO',          label: 'Terreno' },
  { value: 'SIN_INFORMAR',     label: 'Sin informar' },
];

const PROPERTY_STATUSES = [
  { value: 'AVAILABLE',   label: 'Disponible' },
  { value: 'RENTED',      label: 'Alquilada' },
  { value: 'FOR_SALE',    label: 'En venta' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
];

const RENTAL_STATUSES = [
  { value: 'ALQUILADA',              label: 'Alquilada' },
  { value: 'EN_ALQUILER',            label: 'En alquiler' },
  { value: 'CONTRATO_EN_CONFECCION', label: 'Contrato en confección' },
  { value: 'SUSPENDIDA',             label: 'Suspendida' },
  { value: 'ANULADA',                label: 'Anulada' },
  { value: 'NO_CORRESPONDE',         label: 'No corresponde' },
];

const SALE_STATUSES = [
  { value: 'EN_VENTA',       label: 'En venta' },
  { value: 'ANULADA',        label: 'Anulada' },
  { value: 'NO_CORRESPONDE', label: 'No corresponde' },
];

const TYPE_LABEL = Object.fromEntries(PROPERTY_TYPES.map(t => [t.value, t.label]));

function PropertyForm({ property, owners, onSubmit, onClose, isLoading, error }) {
  const [form, setForm] = useState({
    address:        '',
    type:           '',
    squareMeters:   '',
    rooms:          '',
    ownerId:        '',
    status:         'AVAILABLE',
    street:         '',
    streetNumber:   '',
    floor:          '',
    apartment:      '',
    city:           '',
    province:       '',
    rentalStatus:   '',
    saleStatus:     '',
    entryDate:      '',
    rentalProducer: '',
    saleProducer:   '',
  });
  const [errors, setErrors] = useState({});

  const isEditing = !!property;

  useEffect(() => {
    if (property) {
      setForm({
        address:        property.address        || '',
        type:           property.type           || '',
        squareMeters:   property.squareMeters   || '',
        rooms:          property.rooms          || '',
        ownerId:        property.ownerId        || '',
        status:         property.status         || 'AVAILABLE',
        street:         property.street         || '',
        streetNumber:   property.streetNumber   || '',
        floor:          property.floor          || '',
        apartment:      property.apartment      || '',
        city:           property.city           || '',
        province:       property.province       || '',
        rentalStatus:   property.rentalStatus   || '',
        saleStatus:     property.saleStatus     || '',
        entryDate:      property.entryDate      || '',
        rentalProducer: property.rentalProducer || '',
        saleProducer:   property.saleProducer   || '',
      });
    }
  }, [property]);

  const validate = () => {
    const newErrors = {};
    if (!form.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!form.type)           newErrors.type    = 'El tipo es obligatorio';
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
          address:      form.address,
          squareMeters: form.squareMeters ? parseFloat(form.squareMeters) : null,
          rooms:        form.rooms        ? parseInt(form.rooms)          : null,
          status:       form.status,
        }
      : {
          address:        form.address,
          type:           form.type,
          squareMeters:   form.squareMeters   ? parseFloat(form.squareMeters) : null,
          rooms:          form.rooms          ? parseInt(form.rooms)          : null,
          ownerId:        form.ownerId,
          street:         form.street         || null,
          streetNumber:   form.streetNumber   || null,
          floor:          form.floor          || null,
          apartment:      form.apartment      || null,
          city:           form.city           || null,
          province:       form.province       || null,
          rentalStatus:   form.rentalStatus   || null,
          saleStatus:     form.saleStatus     || null,
          entryDate:      form.entryDate      || null,
          rentalProducer: form.rentalProducer || null,
          saleProducer:   form.saleProducer   || null,
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

          {/* Dirección */}
          <div className="form-field">
            <label>Dirección *</label>
            <input name="address" value={form.address} onChange={handleChange}
              placeholder="Ej: Laprida 514 Piso 1 Dpto 2, Rosario" className={errors.address ? 'input-error' : ''} />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          {/* Desglose de dirección */}
          {!isEditing && (
            <>
              <div className="form-row">
                <div className="form-field">
                  <label>Calle</label>
                  <input name="street" value={form.street} onChange={handleChange} placeholder="Ej: Laprida" />
                </div>
                <div className="form-field">
                  <label>Número</label>
                  <input name="streetNumber" value={form.streetNumber} onChange={handleChange} placeholder="Ej: 514" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Piso</label>
                  <input name="floor" value={form.floor} onChange={handleChange} placeholder="Ej: 01" />
                </div>
                <div className="form-field">
                  <label>Departamento</label>
                  <input name="apartment" value={form.apartment} onChange={handleChange} placeholder="Ej: 02" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Localidad</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Ej: Rosario" />
                </div>
                <div className="form-field">
                  <label>Provincia</label>
                  <input name="province" value={form.province} onChange={handleChange} placeholder="Ej: Santa Fe" />
                </div>
              </div>
            </>
          )}

          {/* Tipo */}
          <div className="form-field">
            <label>Tipo *</label>
            {isEditing ? (
              <input value={TYPE_LABEL[form.type] || form.type} disabled />
            ) : (
              <select name="type" value={form.type} onChange={handleChange} className={errors.type ? 'input-error' : ''}>
                <option value="">Seleccionar tipo...</option>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            )}
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>

          {/* M² y ambientes */}
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

          {/* Propietario (solo creación) */}
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

          {/* Estados alquiler y venta */}
          {!isEditing && (
            <div className="form-row">
              <div className="form-field">
                <label>Estado alquiler</label>
                <select name="rentalStatus" value={form.rentalStatus} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  {RENTAL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Estado venta</label>
                <select name="saleStatus" value={form.saleStatus} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  {SALE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Productores */}
          {!isEditing && (
            <div className="form-row">
              <div className="form-field">
                <label>Productor alquiler</label>
                <input name="rentalProducer" value={form.rentalProducer} onChange={handleChange} placeholder="Ej: GAMA" />
              </div>
              <div className="form-field">
                <label>Productor venta</label>
                <input name="saleProducer" value={form.saleProducer} onChange={handleChange} placeholder="Ej: GAMA" />
              </div>
            </div>
          )}

          {/* Fecha de alta (solo creación) */}
          {!isEditing && (
            <div className="form-field">
              <label>Fecha de alta</label>
              <input name="entryDate" type="date" value={form.entryDate} onChange={handleChange} />
            </div>
          )}

          {/* Estado del sistema (solo edición) */}
          {isEditing && (
            <div className="form-field">
              <label>Estado</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {PROPERTY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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
