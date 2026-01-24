import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras verifica la autenticacion, mostrar loading
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no esta autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si esta autenticado, mostrar el contenido
  return children;
}

export default PrivateRoute;
