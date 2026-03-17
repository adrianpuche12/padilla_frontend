import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ProviderForm from '../components/ProviderForm';
import providerService from '../services/providerService';
import './Providers.css';

const ROLE_LEVEL = { SUPER_ADMIN: 0, MANAGER: 1, ADMIN: 2, OWNER: 3, TENANT: 3, PROVIDER: 3 };

const SPECIALTY_LABELS = {
  PINTOR:       'Pintor',
  ELECTRICISTA: 'Electricista',
  PLOMERO:      'Plomero',
  GASISTA:      'Gasista',
  ALBANIL:      'Albañil',
};

const PERSONA_LABELS = {
  FISICA:   'Física',
  JURIDICA: 'Jurídica',
};

function Providers() {
  const { roles } = useAuth();
  const [providers, setProviders] = useState([]);
  const [filteredSpecialty, setFilteredSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [confirmReactivate, setConfirmReactivate] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newProviderInfo, setNewProviderInfo] = useState(null);

  const callerLevel = Math.min(
    ...roles.map(r => r.toUpperCase()).filter(r => ROLE_LEVEL[r] !== undefined).map(r => ROLE_LEVEL[r]),
    99
  );

  const canManage = () => callerLevel < ROLE_LEVEL['PROVIDER'];

  const loadProviders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await providerService.getProviders();
      setProviders(data);
    } catch (err) {
      setError('Error al cargar los proveedores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProviders(); }, []);

  const handleCreate = async (data) => {
    setFormLoading(true);
    setFormError(null);
    try {
      const result = await providerService.createProvider(data);
      setShowForm(false);
      setNewProviderInfo({
        name: result.name || data.name,
        email: result.email || data.email,
        specialty: result.specialty || data.specialty,
        temporaryPassword: result.temporaryPassword || null,
      });
      loadProviders();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear el proveedor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await providerService.updateProvider(editingProvider.id, data);
      setEditingProvider(null);
      loadProviders();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al actualizar el proveedor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (provider) => {
    try {
      await providerService.deactivateProvider(provider.id);
      setConfirmDeactivate(null);
      setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, active: false } : p));
    } catch (err) {
      setError('Error al desactivar el proveedor');
    }
  };

  const handleDelete = async (provider) => {
    try {
      await providerService.deleteProvider(provider.id);
      setConfirmDelete(null);
      setProviders(prev => prev.filter(p => p.id !== provider.id));
    } catch (err) {
      setError('Error al eliminar el proveedor');
    }
  };

  const handleReactivate = async (provider) => {
    try {
      await providerService.reactivateProvider(provider.id);
      setConfirmReactivate(null);
      setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, active: true } : p));
    } catch (err) {
      setError('Error al reactivar el proveedor');
    }
  };

  const getAccountStatus = (provider) => {
    if (!provider.active) return 'inactive';
    if (!provider.firstLogin) return 'active';
    if (provider.passwordResetExpiresAt && new Date(provider.passwordResetExpiresAt) < new Date()) return 'expired';
    return 'pending';
  };

  const STATUS_CONFIG = {
    active:   { label: 'Activo',              className: 'active' },
    pending:  { label: 'Pendiente activación', className: 'pending' },
    expired:  { label: 'Acceso expirado',      className: 'expired' },
    inactive: { label: 'Inactivo',             className: 'inactive' },
  };

  const displayedProviders = filteredSpecialty
    ? providers.filter(p => p.specialty === filteredSpecialty)
    : providers;

  const renderProviderRow = (provider) => {
    const status = getAccountStatus(provider);
    const { label, className } = STATUS_CONFIG[status];

    return (
      <tr key={provider.id} className={!provider.active ? 'row-inactive' : ''}>
        <td data-label="Nombre">{provider.name}</td>
        <td data-label="Especialidad">
          {provider.specialty
            ? <span className={`specialty-badge specialty-${provider.specialty.toLowerCase()}`}>{SPECIALTY_LABELS[provider.specialty]}</span>
            : <span className="specialty-badge specialty-none">-</span>
          }
        </td>
        <td data-label="Persona">{PERSONA_LABELS[provider.personaType] || '-'}</td>
        <td data-label="Documento">
          {provider.documentType && provider.documentNumber
            ? `${provider.documentType} ${provider.documentNumber}`
            : provider.cuitCuil || '-'}
        </td>
        <td data-label="Email">{provider.email || '-'}</td>
        <td data-label="Localidad">{provider.city || '-'}</td>
        <td data-label="Estado">
          <span className={`status-badge ${className}`}>{label}</span>
        </td>
        <td data-label="Acciones">
          <div className="row-actions">
            {canManage() && (
              <>
                <button
                  className="action-btn edit"
                  onClick={() => setEditingProvider(provider)}
                  title="Editar"
                >
                  ✏️
                </button>
                {provider.active ? (
                  <button
                    className="action-btn deactivate"
                    onClick={() => setConfirmDeactivate(provider)}
                    title="Desactivar"
                  >
                    🚫
                  </button>
                ) : (
                  <button
                    className="action-btn reactivate"
                    onClick={() => setConfirmReactivate(provider)}
                    title="Reactivar"
                  >
                    ✅
                  </button>
                )}
                <button
                  className="action-btn delete"
                  onClick={() => setConfirmDelete(provider)}
                  title="Eliminar definitivamente"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <Layout title="Proveedores">
      <div className="providers-page">

        {/* Toolbar */}
        <div className="providers-toolbar">
          <select
            className="specialty-filter"
            value={filteredSpecialty}
            onChange={e => setFilteredSpecialty(e.target.value)}
          >
            <option value="">Todas las especialidades</option>
            {Object.entries(SPECIALTY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Nuevo proveedor
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Sección header */}
        <div className="providers-section">
          <div className="providers-section-header">
            <h3 className="providers-section-title">Proveedores</h3>
            <p className="providers-section-desc">Prestadores de servicios: plomeros, pintores, electricistas y otros.</p>
          </div>

          {/* Contenido */}
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <span>Cargando proveedores...</span>
            </div>
          ) : displayedProviders.length === 0 ? (
            <div className="empty-state">No hay proveedores registrados</div>
          ) : (
            <div className="table-container">
              <table className="providers-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    <th>Persona</th>
                    <th>Documento</th>
                    <th>Email</th>
                    <th>Localidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProviders.map(renderProviderRow)}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Crear proveedor */}
        {showForm && (
          <ProviderForm
            onSubmit={handleCreate}
            onClose={() => { setShowForm(false); setFormError(null); }}
            isLoading={formLoading}
            error={formError}
          />
        )}

        {/* Modal: Editar proveedor */}
        {editingProvider && (
          <ProviderForm
            provider={editingProvider}
            onSubmit={handleUpdate}
            onClose={() => { setEditingProvider(null); setFormError(null); }}
            isLoading={formLoading}
            error={formError}
          />
        )}

        {/* Modal: Proveedor creado */}
        {newProviderInfo && (
          <div className="modal-overlay" onClick={() => setNewProviderInfo(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Proveedor creado</h2>
                <button className="modal-close" onClick={() => setNewProviderInfo(null)}>×</button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>{newProviderInfo.name}</strong>
                  {newProviderInfo.specialty && ` (${SPECIALTY_LABELS[newProviderInfo.specialty]})`}
                  {' '}fue creado exitosamente.
                </p>
                <p><strong>Email:</strong> <code className="temp-password" style={{ fontSize: '0.85rem' }}>{newProviderInfo.email}</code></p>
                {newProviderInfo.temporaryPassword && (
                  <>
                    <p><strong>Password temporal:</strong></p>
                    <div className="password-result">
                      <code className="temp-password">{newProviderInfo.temporaryPassword}</code>
                      <button className="btn-copy" onClick={() => navigator.clipboard.writeText(newProviderInfo.temporaryPassword)}>Copiar</button>
                    </div>
                  </>
                )}
                <p className="confirm-note">
                  {newProviderInfo.temporaryPassword
                    ? 'Comunica el email y el password al proveedor. También se envió un email de bienvenida con estas instrucciones.'
                    : 'Se envió un email de bienvenida con las instrucciones de acceso.'}
                </p>
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={() => setNewProviderInfo(null)}>Entendido</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirmar desactivar */}
        {confirmDeactivate && (
          <div className="modal-overlay" onClick={() => setConfirmDeactivate(null)}>
            <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Desactivar proveedor</h2>
                <button className="modal-close" onClick={() => setConfirmDeactivate(null)}>×</button>
              </div>
              <div className="modal-body">
                <p>¿Desactivar a <strong>{confirmDeactivate.name}</strong>? No podrá ingresar al sistema.</p>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setConfirmDeactivate(null)}>Cancelar</button>
                <button className="btn-danger" onClick={() => handleDeactivate(confirmDeactivate)}>Desactivar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirmar eliminación definitiva */}
        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Eliminar proveedor</h2>
                <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
              </div>
              <div className="modal-body">
                <p>¿Eliminar a <strong>{confirmDelete.name}</strong> del sistema?</p>
                <p className="confirm-note">Esta acción es <strong>irreversible</strong>. Se eliminará el usuario de Keycloak y de la base de datos.</p>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="btn-danger" onClick={() => handleDelete(confirmDelete)}>Eliminar definitivamente</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirmar reactivar */}
        {confirmReactivate && (
          <div className="modal-overlay" onClick={() => setConfirmReactivate(null)}>
            <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reactivar proveedor</h2>
                <button className="modal-close" onClick={() => setConfirmReactivate(null)}>×</button>
              </div>
              <div className="modal-body">
                <p>¿Reactivar a <strong>{confirmReactivate.name}</strong>?</p>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setConfirmReactivate(null)}>Cancelar</button>
                <button className="btn-primary" onClick={() => handleReactivate(confirmReactivate)}>Reactivar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Providers;
