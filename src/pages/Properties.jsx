import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PropertyForm from '../components/PropertyForm';
import propertyService from '../services/propertyService';
import userService from '../services/userService';
import './Properties.css';

const STATUS_LABEL = { AVAILABLE: 'Disponible', RENTED: 'Alquilada', FOR_SALE: 'En venta', MAINTENANCE: 'Mantenimiento' };
const TYPE_LABEL = { HOUSE: 'Casa', APARTMENT: 'Depto', COMMERCIAL: 'Comercial', LAND: 'Terreno' };
const ALL_STATUSES = ['AVAILABLE', 'RENTED', 'FOR_SALE', 'MAINTENANCE'];

function Properties() {
  const [properties, setProperties] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const loadProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await propertyService.getProperties(filteredStatus || null);
      setProperties(data);
    } catch (err) {
      setError('Error al cargar las propiedades');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOwners = async () => {
    try {
      const data = await userService.getUsers('OWNER');
      setOwners(data);
    } catch (err) {
      // silencioso — no critico
    }
  };

  useEffect(() => { loadProperties(); }, [filteredStatus]);
  useEffect(() => { loadOwners(); }, []);

  const handleCreate = async (data) => {
    setFormLoading(true); setFormError(null);
    try {
      await propertyService.createProperty(data);
      setShowForm(false);
      loadProperties();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear la propiedad');
    } finally { setFormLoading(false); }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true); setFormError(null);
    try {
      await propertyService.updateProperty(editingProperty.id, data);
      setEditingProperty(null);
      loadProperties();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al actualizar la propiedad');
    } finally { setFormLoading(false); }
  };

  const handleDeactivate = async (property) => {
    try {
      await propertyService.deactivateProperty(property.id);
      setConfirmDeactivate(null);
      setProperties(prev => prev.map(p => p.id === property.id ? { ...p, active: false } : p));
    } catch (err) {
      setError('Error al desactivar la propiedad');
    }
  };

  return (
    <Layout title="Propiedades">
      <div className="properties-page">
        <div className="properties-toolbar">
          <select className="status-filter" value={filteredStatus} onChange={e => setFilteredStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nueva propiedad</button>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container"><div className="loading-spinner"></div><p>Cargando propiedades...</p></div>
        ) : properties.length === 0 ? (
          <div className="empty-state"><p>No hay propiedades para mostrar.</p></div>
        ) : (
          <div className="table-container">
            <table className="properties-table">
              <thead>
                <tr><th>Dirección</th><th>Tipo</th><th>M²</th><th>Amb.</th><th>Estado</th><th>Alta</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.id} className={!p.active ? 'row-inactive' : ''}>
                    <td>{p.address}</td>
                    <td>{TYPE_LABEL[p.type] || p.type}</td>
                    <td>{p.squareMeters || '-'}</td>
                    <td>{p.rooms || '-'}</td>
                    <td><span className={`status-badge status-${p.status?.toLowerCase()}`}>{STATUS_LABEL[p.status] || p.status}</span></td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-AR') : '-'}</td>
                    <td>
                      <div className="row-actions">
                        {p.active && (
                          <>
                            <button className="action-btn edit" onClick={() => setEditingProperty(p)} title="Editar">✏️</button>
                            <button className="action-btn deactivate" onClick={() => setConfirmDeactivate(p)} title="Desactivar">🚫</button>
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
        <PropertyForm owners={owners} onSubmit={handleCreate} onClose={() => { setShowForm(false); setFormError(null); }} isLoading={formLoading} error={formError} />
      )}
      {editingProperty && (
        <PropertyForm property={editingProperty} owners={owners} onSubmit={handleUpdate} onClose={() => { setEditingProperty(null); setFormError(null); }} isLoading={formLoading} error={formError} />
      )}
      {confirmDeactivate && (
        <div className="modal-overlay" onClick={() => setConfirmDeactivate(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Desactivar propiedad</h2>
              <button className="modal-close" onClick={() => setConfirmDeactivate(null)}>×</button>
            </div>
            <div className="confirm-body">
              <p>¿Estás seguro que querés desactivar <strong>{confirmDeactivate.address}</strong>?</p>
              <p className="confirm-note">La propiedad quedará inactiva en el sistema.</p>
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirmDeactivate(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDeactivate(confirmDeactivate)}>Desactivar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Properties;
