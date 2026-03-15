import { useState, useEffect } from 'react';
import contractService from '../services/contractService';
import './ContractDetailModal.css';

const STATUS_LABEL = { ACTIVE: 'Activo', EXPIRED: 'Vencido', TERMINATED: 'Rescindido' };

const CONTRACT_TYPE_LABEL = {
  PARTICULAR:             'Particular',
  COMERCIAL:              'Comercial',
  COMERCIAL_ICL_SEMESTRAL:'Comercial ICL Semestral',
  ICL_TRIMESTRAL:         'ICL Trimestral',
  ICL_CUATRIMESTRAL:      'ICL Cuatrimestral',
  ICL_SEMESTRAL_VIVIENDA: 'ICL Semestral Vivienda',
  SIN_ASIGNAR:            'Sin asignar',
};

const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';
const formatAmount = (amount, currency) => {
  if (!amount) return '—';
  return `${currency || 'ARS'} ${parseFloat(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
};
const formatPct = (pct) => pct != null ? `${parseFloat(pct).toLocaleString('es-AR')}%` : '—';

function Field({ label, value }) {
  return (
    <div className="detail-field">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || '—'}</span>
    </div>
  );
}

function ContractDetailModal({ contract, propertyAddress, ownerName, tenantName, onClose }) {
  const [periods, setPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);

  useEffect(() => {
    contractService.getContractPeriods(contract.id)
      .then(setPeriods)
      .catch(() => setPeriods([]))
      .finally(() => setLoadingPeriods(false));
  }, [contract.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal contract-detail-modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h2>Detalle del contrato</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="detail-body">

          {/* Sección: Propiedad y partes */}
          <div className="detail-section">
            <h3 className="detail-section-title">Partes</h3>
            <div className="detail-grid">
              <Field label="Propiedad"          value={propertyAddress} />
              <Field label="Propietario"         value={ownerName} />
              <Field label="Socio propietario"   value={contract.coOwner} />
              <Field label="Inquilino"           value={tenantName} />
              <Field label="Socio inquilino"     value={contract.coTenant} />
              <Field label="Productor"           value={contract.producer} />
            </div>
          </div>

          {/* Sección: Datos del contrato */}
          <div className="detail-section">
            <h3 className="detail-section-title">Datos del contrato</h3>
            <div className="detail-grid">
              <Field label="Tipo"               value={CONTRACT_TYPE_LABEL[contract.contractType]} />
              <Field label="Estado"             value={STATUS_LABEL[contract.status]} />
              <Field label="Fecha de inicio"    value={formatDate(contract.startDate)} />
              <Field label="Fecha de fin"       value={formatDate(contract.endDate)} />
              <Field label="Fecha de firma"     value={formatDate(contract.signingDate)} />
              <Field label="Moneda"             value={contract.currency} />
              <Field label="Monto vigente"      value={formatAmount(contract.monthlyAmount, contract.currency)} />
              <Field label="Honorarios"         value={formatPct(contract.commissionPct)} />
              <Field label="Gastos adm."        value={formatPct(contract.adminFeePct)} />
            </div>
            {contract.notes && (
              <div className="detail-notes">
                <span className="detail-label">Observaciones</span>
                <p className="detail-notes-text">{contract.notes}</p>
              </div>
            )}
          </div>

          {/* Sección: Historial de períodos */}
          <div className="detail-section">
            <h3 className="detail-section-title">Historial de períodos</h3>
            {loadingPeriods ? (
              <p className="detail-loading">Cargando períodos...</p>
            ) : periods.length === 0 ? (
              <p className="detail-empty">Sin períodos registrados.</p>
            ) : (
              <div className="detail-table-wrapper">
                <table className="detail-periods-table">
                  <thead>
                    <tr>
                      <th>Desde</th>
                      <th>Alquiler</th>
                      <th>Honorarios $</th>
                      <th>Gastos adm. $</th>
                      <th>Índice ajuste</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((p, i) => (
                      <tr key={p.id} className={i === periods.length - 1 ? 'period-current' : ''}>
                        <td>{formatDate(p.periodFrom)}</td>
                        <td>{formatAmount(p.rentAmount, contract.currency)}</td>
                        <td>{p.commissionAmount ? formatAmount(p.commissionAmount, contract.currency) : '—'}</td>
                        <td>{p.adminFeeAmount    ? formatAmount(p.adminFeeAmount,    contract.currency) : '—'}</td>
                        <td>{p.adjustmentIndex != null ? parseFloat(p.adjustmentIndex).toLocaleString('es-AR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  );
}

export default ContractDetailModal;
