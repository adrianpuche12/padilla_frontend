import { useState, useEffect } from 'react';
import './UserForm.css';

const CURRENCIES = ['ARS', 'USD'];

function ContractForm({ contract, properties, owners, tenants, onSubmit, onClose, isLoading, error }) {
  const [form, setForm] = useState({
    propertyId: '',
    ownerId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    monthlyAmount: '',
    currency: 'ARS',
  });
  const [errors, setErrors] = useState({});

  const isEditing = !!contract;

  useEffect(() => {
    if (contract) {
      setForm({
        propertyId: contract.propertyId || '',
        ownerId: contract.ownerId || '',
        tenantId: contract.tenantId || '',
        startDate: contract.startDate || '',
        endDate: contract.endDate || '',
        monthlyAmount: contract.monthlyAmount || '',
        currency: contract.currency || 'ARS',
      });
    }
  }, [contract]);

  const validate = () => {
    const newErrors = {};
    if (!isEditing && !form.propertyId) newErrors.propertyId = 'La propiedad es obligatoria';
    if (!isEditing && !form.ownerId) newErrors.ownerId = 'El propietario es obligatorio';
    if (!isEditing && !form.tenantId) newErrors.tenantId = 'El inquilino es obligatorio';
    if (!isEditing && !form.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria';
    if (!form.endDate) newErrors.endDate = 'La fecha de fin es obligatoria';
    if (!form.monthlyAmount || parseFloat(form.monthlyAmount) <= 0) newErrors.monthlyAmount = 'El monto debe ser positivo';
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
          currency: form.currency,
          endDate: form.endDate,
        }
      : {
          propertyId: form.propertyId,
          ownerId: form.ownerId,
          tenantId: form.tenantId,
          startDate: form.startDate,
          endDate: form.endDate,
          monthlyAmount: parseFloat(form.monthlyAmount),
          currency: form.currency,
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
              <div className="form-field">
                <label>Propiedad *</label>
                <select name="propertyId" value={form.propertyId} onChange={handleChange} className={errors.propertyId ? 'input-error' : ''}>
                  <option value="">Seleccionar propiedad...</option>
                  {(properties || []).map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                </select>
                {errors.propertyId && <span className="field-error">{errors.propertyId}</span>}
              </div>

              <div className="form-field">
                <label>Propietario *</label>
                <select name="ownerId" value={form.ownerId} onChange={handleChange} className={errors.ownerId ? 'input-error' : ''}>
                  <option value="">Seleccionar propietario...</option>
                  {(owners || []).map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
                </select>
                {errors.ownerId && <span className="field-error">{errors.ownerId}</span>}
              </div>

              <div className="form-field">
                <label>Inquilino *</label>
                <select name="tenantId" value={form.tenantId} onChange={handleChange} className={errors.tenantId ? 'input-error' : ''}>
                  <option value="">Seleccionar inquilino...</option>
                  {(tenants || []).map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                </select>
                {errors.tenantId && <span className="field-error">{errors.tenantId}</span>}
              </div>

              <div className="form-field">
                <label>Fecha de inicio *</label>
                <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className={errors.startDate ? 'input-error' : ''} />
                {errors.startDate && <span className="field-error">{errors.startDate}</span>}
              </div>
            </>
          )}

          <div className="form-field">
            <label>Fecha de fin *</label>
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className={errors.endDate ? 'input-error' : ''} />
            {errors.endDate && <span className="field-error">{errors.endDate}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Monto mensual *</label>
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
