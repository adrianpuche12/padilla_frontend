import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Clients from './pages/Clients';
import Providers from './pages/Providers';
import Properties from './pages/Properties';
import Contracts from './pages/Contracts';
import Tickets from './pages/Tickets';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
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

      {/* Ruta protegida - Usuarios del Sistema */}
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Clientes (OWNER / TENANT / PROVIDER) */}
      <Route
        path="/clients"
        element={
          <PrivateRoute>
            <Clients />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Proveedores */}
      <Route
        path="/providers"
        element={
          <PrivateRoute>
            <Providers />
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

      {/* Ruta semi-publica - Cambio de contraseña (primer login) */}
      {/* No usa PrivateRoute para evitar race condition con isAuthenticated */}
      {/* ChangePassword verifica el token directamente desde localStorage */}
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Ruta publica - Olvidé mi contraseña */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Redireccion por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Ruta no encontrada */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
