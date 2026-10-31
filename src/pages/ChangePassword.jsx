import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { isTokenExpiring, refreshTokens } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import ProperoLogo from '../brand/ProperoLogo';
import { BRAND } from '../brand/brand';
import { describeHttpError } from '../utils/httpError';
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
  const [error, setError]                         = useState('');
  const [isLoading, setIsLoading]                 = useState(false);

  const { getAccessToken, logout, isLoading: authLoading, isAuthenticated, completePasswordChange } = useAuth();
  const navigate = useNavigate();

  // PRO-111 (A-01): "Cerrar sesión" ahora lleva al login (antes se quedaba en esta pantalla sin sesión)
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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
      // PRO-111 (A-05): si la pantalla quedó abierta y el token venció, se renueva antes de enviar
      let accessToken = getAccessToken();
      if (isTokenExpiring(accessToken)) {
        try {
          accessToken = await refreshTokens();
        } catch {
          setError('Tu sesión venció. Volvé a iniciar sesión.');
          return;
        }
      }
      await authService.changePassword(newPassword, accessToken);
      completePasswordChange();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setError(describeHttpError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="loading-container"><p>Cargando...</p></div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="cp-container">
      <div className="cp-card">

        {/* PRO-111 (A-03): misma marca que el login (antes decía PADILLA) */}
        <div className="cp-header">
          <ProperoLogo size={48} />
          <h1>{BRAND.name}</h1>
          <p>{BRAND.tagline}</p>
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
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingresá tu nueva contraseña"
                disabled={isLoading}
                autoComplete="new-password"
              />
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
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí tu nueva contraseña"
                disabled={isLoading}
                autoComplete="new-password"
              />
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
          <button type="button" className="cp-logout-link" onClick={handleLogout} disabled={isLoading}>
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  );
}

export default ChangePassword;
