import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, mustChangePassword } = useAuth();

  // Mientras verifica la autenticacion, mostrar loading
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  // Si ya esta autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to={mustChangePassword ? '/change-password' : '/dashboard'} replace />;
  }

  // Si no esta autenticado, mostrar el contenido (login)
  return children;
}

export default PublicRoute;
