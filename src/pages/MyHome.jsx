import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import meService from '../services/meService';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';
import './Modules.css';

const ESTADO = { AVAILABLE: 'Disponible', RENTED: 'Alquilada', FOR_SALE: 'En venta', MAINTENANCE: 'Mantenimiento', ACTIVE: 'Vigente', EXPIRED: 'Vencido', TERMINATED: 'Rescindido' };
const money = (n, c = 'ARS') => n == null ? '-' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);

/** PRO-102: "Mis propiedades" (propietario) o "Mi vivienda" (inquilino), con sus contratos. */
function MyHome() {
  const { hasRole } = useAuth();
  const esPropietario = hasRole('OWNER');
  const [props, setProps] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([meService.getMyProperties(), meService.getMyContracts()])
      .then(([p, c]) => { setProps(p); setContratos(c); })
      .catch(err => setError(errorMessage(err)));
  }, []);

  return (
    <Layout title={esPropietario ? 'Mis propiedades' : 'Mi vivienda'}>
      <div className="module-page">
        {error && <div className="error-banner"><span>{error}</span></div>}
        <div className="module-card">
          <h3>{esPropietario ? 'Propiedades' : 'Vivienda'}</h3>
          {props.length === 0 ? <p className="module-muted">No hay propiedades asociadas a tu cuenta.</p> : (
            <table className="module-table">
              <thead><tr><th>Dirección</th><th>Ciudad</th><th>Estado</th></tr></thead>
              <tbody>{props.map(p => <tr key={p.id}><td>{p.address}</td><td>{p.city || '-'}</td><td>{ESTADO[p.status] || p.status}</td></tr>)}</tbody>
            </table>
          )}
        </div>
        <div className="module-card">
          <h3>{esPropietario ? 'Contratos' : 'Mi contrato'}</h3>
          {contratos.length === 0 ? <p className="module-muted">No hay contratos vigentes.</p> : (
            <table className="module-table">
              <thead><tr><th>Propiedad</th><th>Desde</th><th>Hasta</th><th>Alquiler</th><th>Estado</th></tr></thead>
              <tbody>{contratos.map(c => (
                <tr key={c.id}><td>{c.propertyAddress}</td><td>{c.startDate}</td><td>{c.endDate}</td>
                  <td>{money(c.monthlyAmount, c.currency)}</td><td>{ESTADO[c.status] || c.status}</td></tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default MyHome;
