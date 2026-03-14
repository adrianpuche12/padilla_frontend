import { useState } from 'react';
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
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                     = useState('');
  const [isLoading, setIsLoading]             = useState(false);

  const { getAccessToken, logout } = useAuth();
  const navigate = useNavigate();

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
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingresá tu nueva contraseña"
                required
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
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí tu nueva contraseña"
                required
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
          <button className="cp-logout-link" onClick={logout} disabled={isLoading}>
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  );
}

export default ChangePassword;
