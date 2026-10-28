import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Clients from './pages/Clients';
import Providers from './pages/Providers';
import Properties from './pages/Properties';
import Contracts from './pages/Contracts';
import Tickets from './pages/Tickets';
import Reservas from './pages/Reservas';
import Settings from './pages/Settings';
import Platform from './pages/Platform';
import Profile from './pages/Profile';
import MyHome from './pages/MyHome';
import Notifications from './pages/Notifications';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { ROLES, STAFF } from './auth/roles';
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
          <PrivateRoute roles={STAFF}>
            <Users />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Clientes (OWNER / TENANT / PROVIDER) */}
      <Route
        path="/clients"
        element={
          <PrivateRoute roles={STAFF}>
            <Clients />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Proveedores */}
      <Route
        path="/providers"
        element={
          <PrivateRoute roles={STAFF}>
            <Providers />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Propiedades */}
      <Route
        path="/properties"
        element={
          <PrivateRoute roles={[...STAFF, ROLES.OWNER, ROLES.TENANT]}>
            <Properties />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Contratos */}
      <Route
        path="/contracts"
        element={
          <PrivateRoute roles={STAFF}>
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

      {/* Ruta protegida - Reservas (Recibos de Reserva) */}
      <Route
        path="/reservas"
        element={
          <PrivateRoute roles={[...STAFF, ROLES.OWNER]}>
            <Reservas />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida - Configuracion (solo SUPER_ADMIN) */}
      <Route
        path="/settings"
        element={
          <PrivateRoute roles={[ROLES.SUPER_ADMIN]}>
            <Settings />
          </PrivateRoute>
        }
      />

      {/* PRO-102: mis propiedades (OWNER) / mi vivienda (TENANT) */}
      <Route
        path="/my-home"
        element={
          <PrivateRoute roles={[ROLES.OWNER, ROLES.TENANT]}>
            <MyHome />
          </PrivateRoute>
        }
      />

      {/* PRO-104: notificaciones (los 6 roles) */}
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        }
      />

      {/* PRO-101: mi perfil (los 6 roles) */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* PRO-100: alta de inmobiliarias (personal de plataforma) */}
      <Route
        path="/platform"
        element={
          <PrivateRoute roles={['PLATFORM_ADMIN']}>
            <Platform />
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
