import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import dataService from '../services/dataService';
import './Dashboard.css';

function Dashboard() {
  const { user, roles, isAdmin } = useAuth();

  // Estados para los datos
  const [stats, setStats] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [sources, setSources] = useState([]);
  const [portalLeads, setPortalLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Cargar estadísticas para todos los usuarios
        const statsData = await dataService.getLeadStats();
        setStats(statsData);

        // Cargar datos adicionales solo para admin
        if (isAdmin()) {
          const [sellersData, sourcesData, leadsData] = await Promise.all([
            dataService.getSellers(),
            dataService.getSources(),
            dataService.getPortalLeads(),
          ]);
          setSellers(sellersData);
          setSources(sourcesData);
          setPortalLeads(leadsData);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  return (
    <Layout title="Dashboard">
      <div className="dashboard-main">
        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="error-dismiss">x</button>
          </div>
        )}

        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>Bienvenido, {user?.username}</h2>
          <p>
            {isAdmin()
              ? 'Tienes acceso de administrador al sistema.'
              : 'Has iniciado sesion correctamente en el sistema.'}
          </p>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalPortalLeads || 0}</div>
                  <div className="stat-label">Leads Portal</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalFormularioLeads || 0}</div>
                  <div className="stat-label">Leads Formulario</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.portalLeadsToday || 0}</div>
                  <div className="stat-label">Leads Hoy (Portal)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.formularioLeadsToday || 0}</div>
                  <div className="stat-label">Leads Hoy (Form)</div>
                </div>
              </div>
            )}

            <div className="info-grid">
              {/* Sellers Card - Solo Admin */}
              {isAdmin() && (
                <div className="info-card">
                  <h3>Vendedores ({sellers.length})</h3>
                  <div className="list-container">
                    {sellers.map((seller) => (
                      <div key={seller.id} className="list-item">
                        <span className="item-name">{seller.fullname}</span>
                        <span className="item-detail">
                         {seller.latestAssignee > 0 ? `Asignaciones: ${seller.latestAssignee}` : 'Sin asignaciones'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources Card - Solo Admin */}
              {isAdmin() && (
                <div className="info-card">
                  <h3>Fuentes de Leads ({sources.length})</h3>
                  <div className="list-container">
                    {sources.map((source) => (
                      <div key={source.id} className="list-item">
                        <span className="item-name">{source.name}</span>
                        <span className="item-detail">{source.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Status */}
              <div className="info-card">
                <h3>Estado del Sistema</h3>
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>Frontend: Activo</span>
                </div>
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>Backend: Conectado</span>
                </div>
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>Base de Datos: Conectada</span>
                </div>
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>Keycloak: Autenticado</span>
                </div>
              </div>
            </div>

            {/* Portal Leads Table - Only for Admin */}
            {isAdmin() && portalLeads.length > 0 && (
              <div className="data-section">
                <h3>Ultimos Leads de Portales</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Nombre</th>
                        <th>Telefono</th>
                        <th>Fuente</th>
                        <th>Vendedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portalLeads.slice(0, 10).map((lead) => (
                        <tr key={lead.id}>
                          <td>{formatDate(lead.date)}</td>
                          <td>{lead.nombre || '-'}</td>
                          <td>{lead.telefono || '-'}</td>
                          <td>{lead.source || '-'}</td>
                          <td>{lead.vendedor || 'Sin asignar'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {portalLeads.length > 10 && (
                  <p className="table-info">Mostrando 10 de {portalLeads.length} leads</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
