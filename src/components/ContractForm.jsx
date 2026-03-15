import { useState, useEffect } from 'react';
import './UserForm.css';

const CURRENCIES = ['ARS', 'USD'];

const CONTRACT_TYPES = [
  { value: 'PARTICULAR',              label: 'Particular' },
  { value: 'COMERCIAL',               label: 'Comercial' },
  { value: 'COMERCIAL_ICL_SEMESTRAL', label: 'Comercial ICL Semestral' },
  { value: 'ICL_TRIMESTRAL',          label: 'ICL Trimestral' },
  { value: 'ICL_CUATRIMESTRAL',       label: 'ICL Cuatrimestral' },
  { value: 'ICL_SEMESTRAL_VIVIENDA',  label: 'ICL Semestral Vivienda' },
  { value: 'SIN_ASIGNAR',             label: 'Sin asignar' },
];

function ContractForm({ contract, properties, owners, tenants, onSubmit, onClose, isLoading, error }) {
  const [form, setForm] = useState({
    propertyId:    '',
    ownerId:       '',
    tenantId:      '',
    startDate:     '',
    endDate:       '',
    signingDate:   '',
    monthlyAmount: '',
    currency:      'ARS',
    contractType:  '',
    commissionPct: '',
    adminFeePct:   '',
    coOwner:       '',
    coTenant:      '',
    notes:         '',
    producer:      '',
  });
  const [errors, setErrors] = useState({});

  const isEditing = !!contract;

  useEffect(() => {
    if (contract) {
      setForm({
        propertyId:    contract.propertyId    || '',
        ownerId:       contract.ownerId       || '',
        tenantId:      contract.tenantId      || '',
        startDate:     contract.startDate     || '',
        endDate:       contract.endDate       || '',
        signingDate:   contract.signingDate   || '',
        monthlyAmount: contract.monthlyAmount || '',
        currency:      contract.currency      || 'ARS',
        contractType:  contract.contractType  || '',
        commissionPct: contract.commissionPct || '',
        adminFeePct:   contract.adminFeePct   || '',
        coOwner:       contract.coOwner       || '',
        coTenant:      contract.coTenant      || '',
        notes:         contract.notes         || '',
        producer:      contract.producer      || '',
      });
    }
  }, [contract]);

  const validate = () => {
    const newErrors = {};
    if (!isEditing && !form.propertyId)    newErrors.propertyId    = 'La propiedad es obligatoria';
    if (!isEditing && !form.ownerId)       newErrors.ownerId       = 'El propietario es obligatorio';
    if (!isEditing && !form.tenantId)      newErrors.tenantId      = 'El inquilino es obligatorio';
    if (!isEditing && !form.startDate)     newErrors.startDate     = 'La fecha de inicio es obligatoria';
    if (!form.endDate)                     newErrors.endDate       = 'La fecha de fin es obligatoria';
    if (!form.monthlyAmount || parseFloat(form.monthlyAmount) <= 0)
                                           newErrors.monthlyAmount = 'El monto debe ser positivo';
    if (form.commissionPct && parseFloat(form.commissionPct) < 0)
                                           newErrors.commissionPct = 'El porcentaje debe ser positivo';
    if (form.adminFeePct && parseFloat(form.adminFeePct) < 0)
                                           newErrors.adminFeePct   = 'El porcentaje debe ser positivo';
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
          monthlyAmount: parseFloat(form.monthlyAmount),
          currency:      form.currency,
          endDate:       form.endDate,
        }
      : {
          propertyId:    form.propertyId,
          ownerId:       form.ownerId,
          tenantId:      form.tenantId,
          startDate:     form.startDate,
          endDate:       form.endDate,
          signingDate:   form.signingDate   || null,
          monthlyAmount: parseFloat(form.monthlyAmount),
          currency:      form.currency,
          contractType:  form.contractType  || null,
          commissionPct: form.commissionPct ? parseFloat(form.commissionPct) : null,
          adminFeePct:   form.adminFeePct   ? parseFloat(form.adminFeePct)   : null,
          coOwner:       form.coOwner       || null,
          coTenant:      form.coTenant      || null,
          notes:         form.notes         || null,
          producer:      form.producer      || null,
        };
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar contrato' : 'Nuevo contrato'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">

          {!isEditing && (
            <>
              {/* Propiedad */}
              <div className="form-field">
                <label>Propiedad *</label>
                <select name="propertyId" value={form.propertyId} onChange={handleChange} className={errors.propertyId ? 'input-error' : ''}>
                  <option value="">Seleccionar propiedad...</option>
                  {(properties || []).map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                </select>
                {errors.propertyId && <span className="field-error">{errors.propertyId}</span>}
              </div>

              {/* Propietario */}
              <div className="form-field">
                <label>Propietario *</label>
                <select name="ownerId" value={form.ownerId} onChange={handleChange} className={errors.ownerId ? 'input-error' : ''}>
                  <option value="">Seleccionar propietario...</option>
                  {(owners || []).map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
                </select>
                {errors.ownerId && <span className="field-error">{errors.ownerId}</span>}
              </div>

              {/* Socio del propietario */}
              <div className="form-field">
                <label>Socio del propietario</label>
                <input name="coOwner" type="text" value={form.coOwner} onChange={handleChange} placeholder="Ej: Juan García" />
              </div>

              {/* Inquilino */}
              <div className="form-field">
                <label>Inquilino *</label>
                <select name="tenantId" value={form.tenantId} onChange={handleChange} className={errors.tenantId ? 'input-error' : ''}>
                  <option value="">Seleccionar inquilino...</option>
                  {(tenants || []).map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                </select>
                {errors.tenantId && <span className="field-error">{errors.tenantId}</span>}
              </div>

              {/* Socio del inquilino */}
              <div className="form-field">
                <label>Socio del inquilino</label>
                <input name="coTenant" type="text" value={form.coTenant} onChange={handleChange} placeholder="Ej: María López" />
              </div>

              {/* Tipo de contrato */}
              <div className="form-field">
                <label>Tipo de contrato</label>
                <select name="contractType" value={form.contractType} onChange={handleChange}>
                  <option value="">Seleccionar tipo...</option>
                  {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Fechas */}
              <div className="form-row">
                <div className="form-field">
                  <label>Fecha de inicio *</label>
                  <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className={errors.startDate ? 'input-error' : ''} />
                  {errors.startDate && <span className="field-error">{errors.startDate}</span>}
                </div>
                <div className="form-field">
                  <label>Fecha de firma</label>
                  <input name="signingDate" type="date" value={form.signingDate} onChange={handleChange} />
                </div>
              </div>
            </>
          )}

          {/* Fecha de fin */}
          <div className="form-field">
            <label>Fecha de fin *</label>
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className={errors.endDate ? 'input-error' : ''} />
            {errors.endDate && <span className="field-error">{errors.endDate}</span>}
          </div>

          {/* Monto y moneda */}
          <div className="form-row">
            <div className="form-field">
              <label>Monto inicial *</label>
              <input name="monthlyAmount" type="number" min="0" step="0.01" value={form.monthlyAmount} onChange={handleChange} placeholder="Ej: 150000" className={errors.monthlyAmount ? 'input-error' : ''} />
              {errors.monthlyAmount && <span className="field-error">{errors.monthlyAmount}</span>}
            </div>
            <div className="form-field">
              <label>Moneda</label>
              <select name="currency" value={form.currency} onChange={handleChange}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Honorarios y gastos administrativos */}
          {!isEditing && (
            <div className="form-row">
              <div className="form-field">
                <label>Honorarios (%)</label>
                <input name="commissionPct" type="number" min="0" max="100" step="0.01" value={form.commissionPct} onChange={handleChange} placeholder="Ej: 8" className={errors.commissionPct ? 'input-error' : ''} />
                {errors.commissionPct && <span className="field-error">{errors.commissionPct}</span>}
              </div>
              <div className="form-field">
                <label>Gastos adm. (%)</label>
                <input name="adminFeePct" type="number" min="0" max="100" step="0.01" value={form.adminFeePct} onChange={handleChange} placeholder="Ej: 2" className={errors.adminFeePct ? 'input-error' : ''} />
                {errors.adminFeePct && <span className="field-error">{errors.adminFeePct}</span>}
              </div>
            </div>
          )}

          {/* Productor y observaciones */}
          {!isEditing && (
            <>
              <div className="form-field">
                <label>Productor</label>
                <input name="producer" type="text" value={form.producer} onChange={handleChange} placeholder="Ej: GAMA" />
              </div>
              <div className="form-field">
                <label>Observaciones</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notas adicionales..." rows={3} />
              </div>
            </>
          )}

          {error && <div className="form-error-banner">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContractForm;
