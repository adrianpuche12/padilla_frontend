import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Properties from './pages/Properties';
import Contracts from './pages/Contracts';
import Tickets from './pages/Tickets';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Ruta publica - Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Ruta protegida - Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Usuarios */}
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Propiedades */}
      <Route
        path="/properties"
        element={
          <PrivateRoute>
            <Properties />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Contratos */}
      <Route
        path="/contracts"
        element={
          <PrivateRoute>
            <Contracts />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Tickets */}
      <Route
        path="/tickets"
        element={
          <PrivateRoute>
            <Tickets />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Configuracion (solo SUPER_ADMIN) */}
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Cambio de contraseña (primer login) */}
      <Route
        path="/change-password"
        element={
          <PrivateRoute>
            <ChangePassword />
          </PrivateRoute>
        }
      />

      {/* Redireccion por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Ruta no encontrada */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
