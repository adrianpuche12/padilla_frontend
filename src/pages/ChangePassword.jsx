import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import './ChangePassword.css';

const RULES = [
  { key: 'length',    label: 'Mínimo 8 caracteres',       test: (p) => p.length >= 8 },
  { key: 'uppercase', label: 'Al menos 1 letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { key: 'number',    label: 'Al menos 1 número',          test: (p) => /[0-9]/.test(p) },
  { key: 'symbol',    label: 'Al menos 1 símbolo (!@#$%)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(p) },
];

function ChangePassword() {
  const [newPassword, setNewPassword]             = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');
  const [showNewPassword, setShowNewPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError]                         = useState('');
  const [isLoading, setIsLoading]                 = useState(false);

  const { getAccessToken, logout } = useAuth();
  const navigate = useNavigate();

  // Verificar que hay token en localStorage (guarda sincrónicamente antes del state update)
  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login', { replace: true });
    }
  }, []);

  const passedRules = RULES.filter((r) => r.test(newPassword));
  const allRulesPassed = passedRules.length === RULES.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!allRulesPassed) {
      setError('La contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = getAccessToken();
      await authService.changePassword(newPassword, accessToken);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al actualizar la contraseña. Intentá de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cp-container">
      <div className="cp-card">

        <div className="cp-header">
          <h1>PADILLA</h1>
          <p>Gestión Inmobiliaria</p>
        </div>

        <div className="cp-body">
          <div className="cp-title-block">
            <h2>Creá tu contraseña</h2>
            <p>
              Es tu primer ingreso al sistema. Debés crear una contraseña
              personal antes de continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="cp-form">
            {error && <div className="cp-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="newPassword">Nueva contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresá tu nueva contraseña"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(prev => !prev)}
                  disabled={isLoading}
                  tabIndex={-1}
                  aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Indicador de requisitos */}
            {newPassword.length > 0 && (
              <ul className="cp-rules">
                {RULES.map((rule) => {
                  const ok = rule.test(newPassword);
                  return (
                    <li key={rule.key} className={ok ? 'rule-ok' : 'rule-fail'}>
                      <span className="rule-icon">{ok ? '✓' : '✗'}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetí tu nueva contraseña"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  disabled={isLoading}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <span className="cp-mismatch">Las contraseñas no coinciden</span>
              )}
            </div>

            <button
              type="submit"
              className="cp-button"
              disabled={isLoading || !allRulesPassed || newPassword !== confirmPassword}
            >
              {isLoading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        </div>

        <div className="cp-footer">
          <button className="cp-logout-link" onClick={logout} disabled={isLoading}>
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  );
}

export default ChangePassword;
