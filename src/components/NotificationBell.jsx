import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const INTERVALO_MS = 60_000;

/**
 * PRO-104: campana con la cantidad de notificaciones sin leer. Decision D11: polling cada 60 s
 * (WebSocket queda para despues). Se actualiza tambien al volver a la pestaña.
 */
function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let vivo = true;
    const cargar = () => {
      if (document.visibilityState === 'hidden') return;
      api.get('/api/notifications/unread-count').then(r => vivo && setUnread(r.data.unread)).catch(() => {});
    };
    cargar();
    const id = setInterval(cargar, INTERVALO_MS);
    const onFocus = () => cargar();
    window.addEventListener('focus', onFocus);
    window.addEventListener('propero:notifications', onFocus);
    return () => { vivo = false; clearInterval(id); window.removeEventListener('focus', onFocus); window.removeEventListener('propero:notifications', onFocus); };
  }, []);

  return (
    <Link to="/notifications" className="notification-bell" title="Notificaciones" aria-label={`Notificaciones: ${unread} sin leer`}
          style={{ position: 'relative', fontSize: 20, textDecoration: 'none', color: 'inherit' }}>
      🔔
      {unread > 0 && (
        <span data-testid="unread-badge" style={{ position: 'absolute', top: -6, right: -10, background: '#c0392b', color: '#fff',
          borderRadius: 999, fontSize: 11, padding: '1px 6px', fontWeight: 700 }}>
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}

export default NotificationBell;
