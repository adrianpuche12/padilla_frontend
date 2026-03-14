import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import UserForm from '../components/UserForm';
import userService from '../services/userService';
import './Users.css';


const ROLE_LEVEL = { SUPER_ADMIN: 0, MANAGER: 1, ADMIN: 2, OWNER: 3, TENANT: 3, PROVIDER: 3 };
const ALL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ADMIN', 'OWNER', 'TENANT', 'PROVIDER'];
const SYSTEM_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ADMIN'];

function Users() {
  const { roles, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredRole, setFilteredRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [confirmReactivate, setConfirmReactivate] = useState(null);
  const [confirmResetPassword, setConfirmResetPassword] = useState(null);
  const [resetPasswordResult, setResetPasswordResult] = useState(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState(null);

  const callerLevel = Math.min(
    ...roles.map(r => r.toUpperCase()).filter(r => ROLE_LEVEL[r] !== undefined).map(r => ROLE_LEVEL[r]),
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

  useEffect(() => { loadUsers(); }, [filteredRole]);

  const handleCreate = async (data) => {
    setFormLoading(true); setFormError(null);
    try {
      const result = await userService.createUser(data);
      setShowForm(false);
      if (result.temporaryPassword) {
        setNewUserPassword({ name: result.user?.name || data.name, email: result.user?.email || data.email, password: result.temporaryPassword });
      }
      loadUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear el usuario');
    } finally { setFormLoading(false); }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true); setFormError(null);
    try {
      await userService.updateUser(editingUser.id, data);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al actualizar el usuario');
    } finally { setFormLoading(false); }
  };

  const handleDeactivate = async (user) => {
    try {
      await userService.deactivateUser(user.id);
      setConfirmDeactivate(null);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: false } : u));
    } catch (err) {
      setError('Error al desactivar el usuario');
    }
  };

  const handleReactivate = async (user) => {
    try {
      await userService.reactivateUser(user.id);
      setConfirmReactivate(null);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: true } : u));
    } catch (err) {
      setError('Error al reactivar el usuario');
    }
  };

  const handleResetPassword = async (user) => {
    setResetPasswordLoading(true);
    try {
      const result = await userService.resetPassword(user.id);
      setConfirmResetPassword(null);
      setResetPasswordResult({ name: user.name, password: result.temporaryPassword });
    } catch (err) {
      setError('Error al resetear el password');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const roleLabel = (role) => role?.replace('_', ' ') || '-';

  const renderUserRow = (user) => (
    <tr key={user.id} className={!user.active ? 'row-inactive' : ''}>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td><span className={`role-badge role-${user.role?.toLowerCase()}`}>{roleLabel(user.role)}</span></td>
      <td><span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>{user.active ? 'Activo' : 'Inactivo'}</span></td>
      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR') : '-'}</td>
      <td>
        <div className="row-actions">
          {canManage(user.role) && (
            <>
              <button className="action-btn edit" onClick={() => setEditingUser(user)} title="Editar">✏️</button>
              {user.active ? (
                <button className="action-btn deactivate" onClick={() => setConfirmDeactivate(user)} title="Desactivar">🚫</button>
              ) : (
                <button className="action-btn reactivate" onClick={() => setConfirmReactivate(user)} title="Reactivar">✅</button>
              )}
              {isSuperAdmin() && (
                <button className="action-btn reset-password" onClick={() => setConfirmResetPassword(user)} title="Resetear password">🔑</button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const renderTable = (userList) => (
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Alta</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {userList.length === 0
            ? <tr><td colSpan="6" className="empty-section">Sin usuarios en esta categoría.</td></tr>
            : userList.map(renderUserRow)}
        </tbody>
      </table>
    </div>
  );

  return (
    <Layout title="Usuarios">
      <div className="users-page">
        <div className="users-toolbar">
          <select className="role-filter" value={filteredRole} onChange={e => setFilteredRole(e.target.value)}>
            <option value="">Todos los roles</option>
            {ALL_ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
          {callerLevel < 3 && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nuevo usuario</button>
          )}
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container"><div className="loading-spinner"></div><p>Cargando usuarios...</p></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><p>No hay usuarios para mostrar.</p></div>
        ) : isSuperAdmin() ? (
          <>
            <div className="users-section">
              <h3 className="users-section-title system">Usuarios del sistema</h3>
              <p className="users-section-desc">Colaboradores con acceso al panel de gestión.</p>
              {renderTable(users.filter(u => SYSTEM_ROLES.includes(u.role?.toUpperCase())))}
            </div>
            <div className="users-section">
              <h3 className="users-section-title external">Otros usuarios</h3>
              <p className="users-section-desc">Propietarios, inquilinos y proveedores vinculados.</p>
              {renderTable(users.filter(u => !SYSTEM_ROLES.includes(u.role?.toUpperCase())))}
            </div>
          </>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Alta</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={!user.active ? 'row-inactive' : ''}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge role-${user.role?.toLowerCase()}`}>{roleLabel(user.role)}</span></td>
                    <td><span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>{user.active ? 'Activo' : 'Inactivo'}</span></td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR') : '-'}</td>
                    <td>
                      <div className="row-actions">
                        {canManage(user.role) && (
                          <>
                            <button className="action-btn edit" onClick={() => setEditingUser(user)} title="Editar">✏️</button>
                            {user.active ? (
                              <button className="action-btn deactivate" onClick={() => setConfirmDeactivate(user)} title="Desactivar">🚫</button>
                            ) : (
                              <button className="action-btn reactivate" onClick={() => setConfirmReactivate(user)} title="Reactivar">✅</button>
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

      {showForm && (
        <UserForm onSubmit={handleCreate} onClose={() => { setShowForm(false); setFormError(null); }} isLoading={formLoading} error={formError} />
      )}
      {editingUser && (
        <UserForm user={editingUser} onSubmit={handleUpdate} onClose={() => { setEditingUser(null); setFormError(null); }} isLoading={formLoading} error={formError} />
      )}
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

      {confirmReactivate && (
        <div className="modal-overlay" onClick={() => setConfirmReactivate(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reactivar usuario</h2>
              <button className="modal-close" onClick={() => setConfirmReactivate(null)}>×</button>
            </div>
            <div className="confirm-body">
              <p>¿Confirmás que querés reactivar a <strong>{confirmReactivate.name}</strong>?</p>
              <p className="confirm-note">El usuario recuperará acceso al sistema.</p>
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirmReactivate(null)}>Cancelar</button>
              <button className="btn-primary" onClick={() => handleReactivate(confirmReactivate)}>Reactivar</button>
            </div>
          </div>
        </div>
      )}

      {confirmResetPassword && (
        <div className="modal-overlay" onClick={() => setConfirmResetPassword(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Resetear password</h2>
              <button className="modal-close" onClick={() => setConfirmResetPassword(null)}>×</button>
            </div>
            <div className="confirm-body">
              <p>¡Atención! Vas a resetear el password de <strong>{confirmResetPassword.name}</strong>.</p>
              <p className="confirm-note">Se generará un nuevo password temporal que deberás comunicarle al usuario. ¿Continuar?</p>
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirmResetPassword(null)}>Cancelar</button>
              <button className="btn-warning" onClick={() => handleResetPassword(confirmResetPassword)} disabled={resetPasswordLoading}>
                {resetPasswordLoading ? 'Procesando...' : 'Resetear password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetPasswordResult && (
        <div className="modal-overlay" onClick={() => setResetPasswordResult(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Password reseteado</h2>
              <button className="modal-close" onClick={() => setResetPasswordResult(null)}>×</button>
            </div>
            <div className="confirm-body">
              <p>Password temporal generado para <strong>{resetPasswordResult.name}</strong>:</p>
              <div className="password-result">
                <code className="temp-password">{resetPasswordResult.password}</code>
                <button className="btn-copy" onClick={() => copyToClipboard(resetPasswordResult.password)}>Copiar</button>
              </div>
              <p className="confirm-note">Comunica este password al usuario. Por seguridad no se almacena y no se puede recuperar luego.</p>
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-primary" onClick={() => setResetPasswordResult(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {newUserPassword && (
        <div className="modal-overlay" onClick={() => setNewUserPassword(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Usuario creado</h2>
              <button className="modal-close" onClick={() => setNewUserPassword(null)}>×</button>
            </div>
            <div className="confirm-body">
              <p>El usuario <strong>{newUserPassword.name}</strong> fue creado exitosamente.</p>
              <p>Para ingresar al sistema deberá usar:</p>
              <p><strong>Email:</strong> <code className="temp-password" style={{fontSize:'0.85rem'}}>{newUserPassword.email}</code></p>
              <p><strong>Password temporal:</strong></p>
              <div className="password-result">
                <code className="temp-password">{newUserPassword.password}</code>
                <button className="btn-copy" onClick={() => copyToClipboard(newUserPassword.password)}>Copiar</button>
              </div>
              <p className="confirm-note">Comunica el email y el password al usuario. El acceso se realiza con el email registrado.</p>
            </div>
            <div className="modal-actions confirm-actions">
              <button className="btn-primary" onClick={() => setNewUserPassword(null)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Users;
