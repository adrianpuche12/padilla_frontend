import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ContractForm from '../components/ContractForm';
import contractService from '../services/contractService';
import propertyService from '../services/propertyService';
import userService from '../services/userService';
import './Contracts.css';

const STATUS_LABEL = { ACTIVE: 'Activo', EXPIRED: 'Vencido', TERMINATED: 'Rescindido' };
const ALL_STATUSES = ['ACTIVE', 'EXPIRED', 'TERMINATED'];

function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [owners, setOwners] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmTerminate, setConfirmTerminate] = useState(null);

  const loadContracts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contractService.getContracts(filteredStatus || null);
      setContracts(data);
    } catch (err) {
      setError('Error al cargar los contratos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [propsData, ownersData, tenantsData] = await Promise.all([
        propertyService.getProperties(),
        userService.getUsers('OWNER'),
        userService.getUsers('TENANT'),
      ]);
      setProperties(propsData);
      setOwners(ownersData);
      setTenants(tenantsData);
    } catch (err) {
      // silencioso — no critico
    }
  };

  useEffect(() => { loadContracts(); }, [filteredStatus]);
  useEffect(() => { loadReferenceData(); }, []);

  const getPropertyAddress = (id) => properties.find(p => p.id === id)?.address || '-';
  const getUserName = (id) => {
    const found = [...owners, ...tenants].find(u => u.id === id);
    return found ? found.name : '-';
  };

  const handleCreate = async (data) => {
    setFormLoading(true); setFormError(null);
    try {
      await contractService.createContract(data);
      setShowForm(false);
      loadContracts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear el contrato');
    } finally { setFormLoading(false); }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true); setFormError(null);
    try {
      await contractService.updateContract(editingContract.id, data);
      setEditingContract(null);
      loadContracts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al actualizar el contrato');
    } finally { setFormLoading(false); }
  };

  const handleTerminate = async (contract) => {
    try {
      await contractService.terminateContract(contract.id);
      setConfirmTerminate(null);
      setContracts(prev => prev.map(c =>
        c.id === contract.id ? { ...c, status: 'TERMINATED', active: false } : c
      ));
    } catch (err) {
      setError('Error al rescindir el contrato');
    }
  };

  const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '-';
  const formatAmount = (amount, currency) => {
    if (!amount) return '-';
    return `${currency || 'ARS'} ${parseFloat(amount).toLocaleString('es-AR')}`;
  };

  return (
    <Layout title="Contratos">
      <div className="contracts-page">
        <div className="contracts-toolbar">
          <select className="status-filter" value={filteredStatus} onChange={e => setFilteredStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nuevo contrato</button>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container"><div className="loading-spinner"></div><p>Cargando contratos...</p></div>
        ) : contracts.length === 0 ? (
          <div className="empty-state"><p>No hay contratos para mostrar.</p></div>
        ) : (
          <div className="table-container">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>Propiedad</th>
                  <th>Propietario</th>
                  <th>Inquilino</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map(c => (
                  <tr key={c.id} className={!c.active ? 'row-inactive' : ''}>
                    <td>{getPropertyAddress(c.propertyId)}</td>
                    <td>{getUserName(c.ownerId)}</td>
                    <td>{getUserName(c.tenantId)}</td>
                    <td>{formatDate(c.startDate)}</td>
                    <td>{formatDate(c.endDate)}</td>
                    <td>{formatAmount(c.monthlyAmount, c.currency)}</td>
                    <td><span className={`status-badge status-${c.status?.toLowerCase()}`}>{STATUS_LABEL[c.status] || c.status}</span></td>
                    <td>
                      <div className="row-actions">
                        {c.status === 'ACTIVE' && (
                          <>
                            <button className="action-btn edit" onClick={() => setEditingContract(c)} title="Editar">✏️</button>
                            <button className="action-btn deactivate" onClick={() => setConfirmTerminate(c)} title="Rescindir">🚫</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ContractForm
          properties={properties} owners={owners} tenants={tenants}
          onSubmit={handleCreate}
          onClose={() => { setShowForm(false); setFormError(null); }}
          isLoading={formLoading} error={formError}
        />
      )}
      {editingContract && (
        <ContractForm
          contract={editingContract} properties={properties} owners={owners} tenants={tenants}
          onSubmit={handleUpdate}
          onClose={() => { setEditingContract(null); setFormError(null); }}
          isLoading={formLoading} error={formError}
        />
      )}
      {confirmTerminate && (
        <div className="modal-overlay" onClick={() => setConfirmTerminate(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rescindir contrato</h2>
              <button className="modal-close" onClick={() => setConfirmTerminate(null)}>×</button>
            </div>
            <div className="confirm-body">
              <p>¿Estás seguro que querés rescindir el contrato de <strong>{getPropertyAddress(confirmTerminate.propertyId)}</strong>?</p>
              <p className="confirm-note">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirmTerminate(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleTerminate(confirmTerminate)}>Rescindir</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Contracts;
