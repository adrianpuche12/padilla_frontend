import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PropertyForm from '../components/PropertyForm';
import PropertyDetailModal from '../components/PropertyDetailModal';
import propertyService from '../services/propertyService';
import userService from '../services/userService';
import './Properties.css';

const STATUS_LABEL = { AVAILABLE: 'Disponible', RENTED: 'Alquilada', FOR_SALE: 'En venta', MAINTENANCE: 'Mantenimiento' };
const TYPE_LABEL = {
  CASA: 'Casa', CASA_PLANTA_ALTA: 'Casa Planta Alta', COCHERA: 'Cochera',
  DEPARTAMENTO: 'Departamento', DEPTO_DUPLEX: 'Depto. Duplex', DEPTO_PASILLO: 'Depto. de pasillo',
  GALPON: 'Galpón', LOCAL: 'Local', OFICINA: 'Oficina', TERRENO: 'Terreno', SIN_INFORMAR: 'Sin informar',
};
const ALL_STATUSES = ['AVAILABLE', 'RENTED', 'FOR_SALE', 'MAINTENANCE'];

function Properties() {
  const [properties, setProperties] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
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

  const getOwnerName = (id) => {
    const found = owners.find(o => o.id === id);
    return found ? found.name : '-';
  };

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
      setProperties(prev => prev.map(p => p.id === property.id ? { ...p, active: false, status: 'MAINTENANCE' } : p));
    } catch (err) {
      setError('Error al desactivar la propiedad');
    }
  };

  const handleReactivate = async (property) => {
    try {
      await propertyService.reactivateProperty(property.id);
      setProperties(prev => prev.map(p => p.id === property.id ? { ...p, active: true, status: 'AVAILABLE' } : p));
    } catch (err) {
      setError('Error al reactivar la propiedad');
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
                    <td data-label="Dirección">{p.address}</td>
                    <td data-label="Tipo">{TYPE_LABEL[p.type] || p.type}</td>
                    <td data-label="M²">{p.squareMeters || '-'}</td>
                    <td data-label="Amb.">{p.rooms || '-'}</td>
                    <td data-label="Estado"><span className={`status-badge status-${p.status?.toLowerCase()}`}>{STATUS_LABEL[p.status] || p.status}</span></td>
                    <td data-label="Alta">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-AR') : '-'}</td>
                    <td data-label="Acciones">
                      <div className="row-actions">
                        <button className="action-btn view" onClick={() => setViewingProperty(p)} title="Ver detalle">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        {p.active ? (
                          <>
                            <button className="action-btn edit" onClick={() => setEditingProperty(p)} title="Editar">✏️</button>
                            <button className="action-btn deactivate" onClick={() => setConfirmDeactivate(p)} title="Desactivar">🚫</button>
                          </>
                        ) : (
                          <button className="action-btn reactivate" onClick={() => handleReactivate(p)} title="Reactivar">✅</button>
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
      {viewingProperty && (
        <PropertyDetailModal
          property={viewingProperty}
          ownerName={getOwnerName(viewingProperty.ownerId)}
          onClose={() => setViewingProperty(null)}
        />
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
