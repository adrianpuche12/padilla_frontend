import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProperoLogo from '../brand/ProperoLogo';
import { BRAND } from '../brand/brand';
import PasswordInput from '../components/PasswordInput';
import { describeHttpError } from '../utils/httpError';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      // PRO-111: vuelve a la pantalla de origen (B-01). Si es el primer ingreso, PrivateRoute
      // manda a /change-password (A-02), sin el window.location.replace de antes.
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      console.error('Error de login:', err);
      // PRO-111 (A-04): cada error con su mensaje (antes casi todo era "Error al conectar con el servidor")
      setError(describeHttpError(err, {
        401: 'Usuario o contraseña incorrectos',
        403: (d) => {
          if (d?.error === 'ACCESS_EXPIRED') return 'Tu acceso temporal ha vencido. Contactá al administrador para recibir un nuevo acceso.';
          if (typeof d === 'string') return 'El servidor rechazó la conexión desde esta dirección. Avisá a soporte.';
          return 'No tenés acceso al sistema. Contactá al administrador.';
        },
        400: (d) => (d?.detail?.includes('Account disabled') ? 'Tu cuenta fue desactivada. Contactá al administrador.' : undefined),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <ProperoLogo size={56} className="login-brand-logo" />
          <h1 className="login-brand-name">{BRAND.name}</h1>
          <p className="login-brand-tagline">{BRAND.tagline}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <div className="login-forgot">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
        </form>

        <div className="login-footer">
          <p>{BRAND.name} &copy; {BRAND.year} &mdash; {BRAND.company}</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
