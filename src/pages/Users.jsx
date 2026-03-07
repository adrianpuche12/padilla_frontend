import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import UserForm from '../components/UserForm';
import userService from '../services/userService';
import './Users.css';

const ROLE_LEVEL = {
  SUPER_ADMIN: 0,
  MANAGER: 1,
  ADMIN: 2,
  OWNER: 3,
  TENANT: 3,
  PROVIDER: 3,
};

const ALL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ADMIN', 'OWNER', 'TENANT', 'PROVIDER'];

function Users() {
  const { roles } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredRole, setFilteredRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const callerLevel = Math.min(
    ...roles
      .map(r => r.toUpperCase())
      .filter(r => ROLE_LEVEL[r] !== undefined)
      .map(r => ROLE_LEVEL[r]),
    99
  );

  const canManage = (targetRole) => {
    const targetLevel = ROLE_LEVEL[targetRole?.toUpperCase()];
    return targetLevel !== undefined && callerLevel < targetLevel;
  };

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers(filteredRole || null);
      setUsers(data);
    } catch (err) {
      setError('Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filteredRole]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await userService.createUser(data);
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear el usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await userService.updateUser(editingUser.id, data);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al actualizar el usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (user) => {
    try {
      await userService.deactivateUser(user.id);
      setConfirmDeactivate(null);
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, active: false } : u)
      );
    } catch (err) {
      setError('Error al desactivar el usuario');
    }
  };

  const roleLabel = (role) => role?.replace('_', ' ') || '-';

  return (
    <Layout title="Usuarios">
      <div className="users-page">
        {/* Toolbar */}
        <div className="users-toolbar">
          <select
            className="role-filter"
            value={filteredRole}
            onChange={e => setFilteredRole(e.target.value)}
          >
            <option value="">Todos los roles</option>
            {ALL_ROLES.map(r => (
              <option key={r} value={r}>{roleLabel(r)}</option>
            ))}
          </select>

          {callerLevel < 3 && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + Nuevo usuario
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>No hay usuarios para mostrar.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Alta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={!user.active ? 'row-inactive' : ''}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge role-${user.role?.toLowerCase()}`}>{roleLabel(user.role)}</span></td>
                    <td>
                      <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR') : '-'}</td>
                    <td>
                      <div className="row-actions">
                        {canManage(user.role) && (
                          <>
                            <button
                              className="action-btn edit"
                              onClick={() => setEditingUser(user)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            {user.active && (
                              <button
                                className="action-btn deactivate"
                                onClick={() => setConfirmDeactivate(user)}
                                title="Desactivar"
                              >
                                🚫
                              </button>
                            )}
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

      {/* Modal Crear */}
      {showForm && (
        <UserForm
          onSubmit={handleCreate}
          onClose={() => { setShowForm(false); setFormError(null); }}
          isLoading={formLoading}
          error={formError}
        />
      )}

      {/* Modal Editar */}
      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={handleUpdate}
          onClose={() => { setEditingUser(null); setFormError(null); }}
          isLoading={formLoading}
          error={formError}
        />
      )}

      {/* Confirm Deactivate */}
      {confirmDeactivate && (
        <div className="modal-overlay" onClick={() => setConfirmDeactivate(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Desactivar usuario</h2>
              <button className="modal-close" onClick={() => setConfirmDeactivate(null)}>×</button>
            </div>
            <div className="confirm-body">
              <p>¿Estás seguro que querés desactivar a <strong>{confirmDeactivate.name}</strong>?</p>
              <p className="confirm-note">El usuario perderá acceso al sistema.</p>
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

export default Users;
