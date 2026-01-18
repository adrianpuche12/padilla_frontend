import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Padilla Dashboard</h1>
        <p>Sistema de gestion de leads inmobiliarios</p>
      </header>

      <main className="app-main">
        <div className="status-card">
          <h2>Estado del Sistema</h2>
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>Frontend: Activo</span>
          </div>
          <p className="status-info">
            React {React.version} + Vite
          </p>
        </div>

        <div className="info-card">
          <h2>Proximos pasos</h2>
          <ul>
            <li>T-03: Integracion Backend con Keycloak</li>
            <li>T-04: Autenticacion Frontend con Keycloak</li>
            <li>T-05: Conexion segura Frontend - Backend</li>
          </ul>
        </div>
      </main>

      <footer className="app-footer">
        <p>Padilla &copy; 2026 - Sprint 1</p>
      </footer>
    </div>
  )
}

export default App
