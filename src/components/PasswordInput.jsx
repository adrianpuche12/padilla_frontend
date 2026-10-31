import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * PRO-111 (A-06, A-07): campo de contraseña con "ojo". Reemplaza los tres bloques copiados de
 * LoginPage y ChangePassword. El botón se puede usar con teclado (antes tenía tabIndex -1).
 */
function PasswordInput({ id, value, onChange, placeholder, disabled, autoComplete = 'current-password', required = true }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        type={visible ? 'text' : 'password'}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}

export default PasswordInput;
