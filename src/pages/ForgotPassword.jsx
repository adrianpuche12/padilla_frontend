import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
    } catch {
      // Mostrar error solo si hay un problema de conexión con el servidor
      setError('No fue posible conectar con el servidor. Intentá de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-card">

        <div className="fp-header">
          <h1>Padilla</h1>
          <p>Sistema de Gestión Inmobiliaria</p>
        </div>

        <div className="fp-body">
          {!submitted ? (
            <>
              <div className="fp-title-block">
                <h2>Olvidé mi contraseña</h2>
                <p>
                  Ingresá tu email y te enviaremos una contraseña temporal
                  para que puedas volver a ingresar al sistema.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="fp-form">
                {error && <div className="fp-error">{error}</div>}

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingresá tu email"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  className="fp-button"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
                </button>
              </form>
            </>
          ) : (
            <div className="fp-success">
              <div className="fp-success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2>Revisá tu correo</h2>
              <p>
                Si el email <strong>{email}</strong> está registrado en nuestro sistema,
                vas a recibir las instrucciones para restablecer tu contraseña en los próximos minutos.
              </p>
              <p className="fp-note">
                No olvides revisar tu carpeta de spam.
              </p>
            </div>
          )}
        </div>

        <div className="fp-footer">
          <Link to="/login" className="fp-back-link">
            ← Volver al inicio de sesión
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
