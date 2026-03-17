import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ClientForm from '../components/ClientForm';
import clientService from '../services/clientService';
import './Clients.css';

const ROLE_LEVEL = { SUPER_ADMIN: 0, MANAGER: 1, ADMIN: 2, OWNER: 3, TENANT: 3, PROVIDER: 3 };

const ROLE_LABELS = {
  OWNER: 'Propietario',
  TENANT: 'Inquilino',
  PROVIDER: 'Proveedor',
};

const PERSONA_LABELS = {
  FISICA: 'Física',
  JURIDICA: 'Jurídica',
};

function Clients() {
  const { roles, isSuperAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredRole, setFilteredRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [confirmReactivate, setConfirmReactivate] = useState(null);
  const [newClientPassword, setNewClientPassword] = useState(null);

  const callerLevel = Math.min(
    ...roles.map(r => r.toUpperCase()).filter(r => ROLE_LEVEL[r] !== undefined).map(r => ROLE_LEVEL[r]),
    99
  );

  const canManage = (targetRole) => {
    const targetLevel = ROLE_LEVEL[targetRole?.toUpperCase()];
    return targetLevel !== undefined && callerLevel < targetLevel;
  };

  const loadClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientService.getClients(filteredRole || null);
      // Excluir proveedores — tienen su propia vista en /providers
      setClients(data.filter(c => c.role !== 'PROVIDER'));
    } catch (err) {
      setError('Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadClients(); }, [filteredRole]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    setFormError(null);
    try {
      const result = await clientService.createClient(data);
      setShowForm(false);
      // result es el ClientDTO que incluye el temporaryPassword en el email,
      // pero el backend lo devuelve en el flujo de bienvenida via email.
      // Si el backend devuelve temporaryPassword en respuesta futura, aquí lo capturamos.
      setNewClientPassword({
        name: result.name || data.name,
        email: result.email || data.email,
        role: result.role || data.role,
        temporaryPassword: result.temporaryPassword || null,
      });
      loadClients();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear el cliente');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await clientService.updateClient(editingClient.id, data);
      setEditingClient(null);
      loadClients();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al actualizar el cliente');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (client) => {
    try {
      await clientService.deactivateClient(client.id);
      setConfirmDeactivate(null);
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, active: false } : c));
    } catch (err) {
      setError('Error al desactivar el cliente');
    }
  };

  const handleReactivate = async (client) => {
    try {
      await clientService.reactivateClient(client.id);
      setConfirmReactivate(null);
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, active: true } : c));
    } catch (err) {
      setError('Error al reactivar el cliente');
    }
  };

  const getAccountStatus = (client) => {
    if (!client.active) return 'inactive';
    if (!client.firstLogin) return 'active';
    if (client.passwordResetExpiresAt && new Date(client.passwordResetExpiresAt) < new Date()) return 'expired';
    return 'pending';
  };

  const STATUS_CONFIG = {
    active:   { label: 'Activo',               className: 'active' },
    pending:  { label: 'Pendiente activación',  className: 'pending' },
    expired:  { label: 'Acceso expirado',        className: 'expired' },
    inactive: { label: 'Inactivo',              className: 'inactive' },
  };

  const renderClientRow = (client) => {
    const status = getAccountStatus(client);
    const { label, className } = STATUS_CONFIG[status];

    return (
      <tr key={client.id} className={!client.active ? 'row-inactive' : ''}>
        <td data-label="Nombre">{client.name}</td>
        <td data-label="Persona">{PERSONA_LABELS[client.personaType] || '-'}</td>
        <td data-label="Documento">
          {client.documentType && client.documentNumber
            ? `${client.documentType} ${client.documentNumber}`
            : client.cuitCuil || '-'}
        </td>
        <td data-label="Email">{client.email || '-'}</td>
        <td data-label="Localidad">{client.city || '-'}</td>
        <td data-label="Estado">
          <span className={`status-badge ${className}`}>{label}</span>
        </td>
        <td data-label="Acciones">
          <div className="row-actions">
            {canManage(client.role) && (
              <>
                <button
                  className="action-btn edit"
                  onClick={() => setEditingClient(client)}
                  title="Editar"
                >
                  ✏️
                </button>
                {client.active ? (
                  <button
                    className="action-btn deactivate"
                    onClick={() => setConfirmDeactivate(client)}
                    title="Desactivar"
                  >
                    🚫
                  </button>
                ) : (
                  <button
                    className="action-btn reactivate"
                    onClick={() => setConfirmReactivate(client)}
                    title="Reactivar"
                  >
                    ✅
                  </button>
                )}
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderTable = (list) => (
    <div className="table-container">
      <table className="clients-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Persona</th>
            <th>Documento</th>
            <th>Email</th>
            <th>Localidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map(renderClientRow)}
        </tbody>
      </table>
    </div>
  );

  const SECTION_DESC = {
    OWNER:    'Dueños de propiedades vinculadas a la inmobiliaria.',
    TENANT:   'Personas que alquilan propiedades gestionadas.',
    PROVIDER: 'Prestadores de servicios: plomeros, pintores, electricistas y otros.',
  };

  const renderSection = (role, title, allClients) => {
    const list = allClients.filter(c => c.role === role);
    if (list.length === 0) return null;
    return (
      <div className="clients-section" key={role}>
        <div className="clients-section-header">
          <h3 className={`clients-section-title clients-section-title--${role.toLowerCase()}`}>{title}</h3>
          <p className="clients-section-desc">{SECTION_DESC[role]}</p>
        </div>
        {renderTable(list)}
      </div>
    );
  };

  return (
    <Layout title="Clientes">
      <div className="clients-page">

        {/* Toolbar */}
        <div className="clients-toolbar">
          <select
            className="role-filter"
            value={filteredRole}
            onChange={e => setFilteredRole(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="OWNER">Propietarios</option>
            <option value="TENANT">Inquilinos</option>
          </select>

          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Nuevo cliente
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <span>Cargando clientes...</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="empty-state">No hay clientes registrados</div>
        ) : (
          <>
            {renderSection('OWNER',  'Propietarios', clients)}
            {renderSection('TENANT', 'Inquilinos',   clients)}
          </>
        )}

        {/* Modal: Crear cliente */}
        {showForm && (
          <ClientForm
            onSubmit={handleCreate}
            onClose={() => { setShowForm(false); setFormError(null); }}
            isLoading={formLoading}
            error={formError}
          />
        )}

        {/* Modal: Editar cliente */}
        {editingClient && (
          <ClientForm
            client={editingClient}
            onSubmit={handleUpdate}
            onClose={() => { setEditingClient(null); setFormError(null); }}
            isLoading={formLoading}
            error={formError}
          />
        )}

        {/* Modal: Cliente creado */}
        {newClientPassword && (
          <div className="modal-overlay" onClick={() => setNewClientPassword(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Cliente creado</h2>
                <button className="modal-close" onClick={() => setNewClientPassword(null)}>×</button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>{newClientPassword.name}</strong> ({ROLE_LABELS[newClientPassword.role]}) fue creado exitosamente.
                </p>
                <p><strong>Email:</strong> <code className="temp-password" style={{ fontSize: '0.85rem' }}>{newClientPassword.email}</code></p>
                {newClientPassword.temporaryPassword && (
                  <>
                    <p><strong>Password temporal:</strong></p>
                    <div className="password-result">
                      <code className="temp-password">{newClientPassword.temporaryPassword}</code>
                      <button className="btn-copy" onClick={() => navigator.clipboard.writeText(newClientPassword.temporaryPassword)}>Copiar</button>
                    </div>
                  </>
                )}
                <p className="confirm-note">
                  {newClientPassword.temporaryPassword
                    ? 'Comunica el email y el password al cliente. También se envió un email de bienvenida con estas instrucciones.'
                    : 'Se envió un email de bienvenida con las instrucciones de acceso.'}
                </p>
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={() => setNewClientPassword(null)}>Entendido</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirmar desactivar */}
        {confirmDeactivate && (
          <div className="modal-overlay" onClick={() => setConfirmDeactivate(null)}>
            <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Desactivar cliente</h2>
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

        {/* Modal: Confirmar reactivar */}
        {confirmReactivate && (
          <div className="modal-overlay" onClick={() => setConfirmReactivate(null)}>
            <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reactivar cliente</h2>
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

export default Clients;
