import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole } from '../auth/roles';

/**
 * Ruta protegida. PRO-091: además de exigir sesión, cada ruta puede declarar los roles que la ven
 * (`roles`). Antes cualquier usuario autenticado entraba por URL a /users o /settings y solo el API
 * lo frenaba.
 */
function PrivateRoute({ children, roles }) {
  const { isAuthenticated, isLoading, roles: userRoles } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasAnyRole(userRoles, roles)) {
    return (
      <div className="loading-container" role="alert">
        <h2>No tenés acceso a esta sección</h2>
        <p>Si creés que es un error, consultá con la inmobiliaria.</p>
        <Link to="/dashboard">Volver al inicio</Link>
      </div>
    );
  }

  return children;
}

export default PrivateRoute;
