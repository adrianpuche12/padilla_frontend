import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(username, password);
      if (data.first_login) {
        // Usar window.location para evitar race condition con React 18 batching + startTransition de React Router
        window.location.replace('/change-password');
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Error de login:', err);
      if (err.response?.status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else if (err.response?.status === 403 && err.response?.data?.error === 'ACCESS_EXPIRED') {
        setError('Tu acceso temporal ha vencido. Contactá al administrador para recibir un nuevo acceso.');
      } else if (err.response?.status === 400 && err.response?.data?.detail?.includes('Account disabled')) {
        setError('Tu cuenta fue desactivada. Contactá al administrador.');
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Padilla</h1>
          <p>Sistema de Gestion de Leads</p>
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-footer">
          <p>Padilla &copy; 2026</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
