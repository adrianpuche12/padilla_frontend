# Padilla Frontend

Dashboard web para el sistema de gestion de leads inmobiliarios Padilla.

## Stack Tecnologico

| Tecnologia | Version |
|------------|---------|
| React | 19.2.0 |
| Vite | 7.2.4 |
| ESLint | 9.39.1 |
| Node.js | 22.x (recomendado) |

## Requisitos Previos

- **Node.js 20+** (recomendado 22.x)
- **npm 10+**
- **Git**

Verificar instalacion:
```bash
node -v     # Debe mostrar v20+ o v22+
npm -v      # Debe mostrar 10+
git --version
```

## Instalacion

### 1. Clonar repositorio

```bash
git clone https://github.com/adrianpuche12/padilla_frontend.git
cd padilla_frontend
```

### 2. Instalar dependencias

```bash
npm install
```

## Ejecucion Local

### Modo desarrollo

```bash
npm run dev
```

La aplicacion estara disponible en: **http://localhost:5173**

### Verificar funcionamiento

Abrir en el navegador: http://localhost:5173

Deberia verse la pagina "Padilla Dashboard" con:
- Header con titulo del sistema
- Card de estado mostrando "Frontend: Activo"
- Lista de proximos pasos del Sprint

## Scripts Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo (puerto 5173) |
| `npm run build` | Genera build de produccion en `/dist` |
| `npm run preview` | Preview del build de produccion |
| `npm run lint` | Ejecuta ESLint para verificar codigo |

## Configuracion

### Cambiar puerto de desarrollo

Modificar `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000  // Cambiar puerto aqui
  }
})
```

### Variables de entorno

Crear archivo `.env` en la raiz:
```env
VITE_API_URL=http://localhost:8080
VITE_KEYCLOAK_URL=http://62.171.160.238:8095
VITE_KEYCLOAK_REALM=padilla
VITE_KEYCLOAK_CLIENT_ID=padilla-frontend
```

Acceder en el codigo:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

## Estructura del Proyecto

```
padilla_frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css          # Estilos principales
│   ├── App.jsx          # Componente principal (Home)
│   ├── index.css        # Estilos globales
│   └── main.jsx         # Punto de entrada
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

## Build de Produccion

### Generar build

```bash
npm run build
```

Los archivos se generan en la carpeta `/dist`

### Previsualizar build

```bash
npm run preview
```

## Integracion con Backend

El backend debe estar corriendo en `http://localhost:8080`

```bash
# Verificar backend
curl http://localhost:8080/health
```

## Proximos Pasos (Sprint 1)

- [ ] T-04: Autenticacion con Keycloak
- [ ] T-05: Conexion segura con Backend
- [ ] T-07: Dashboard Home con datos reales

## Troubleshooting

### Error: puerto en uso

```bash
# Usar otro puerto
npm run dev -- --port 3000
```

### Error: dependencias

```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## Contribuir

1. Crear rama desde `dev`: `git checkout -b feature/nombre`
2. Hacer cambios y commit
3. Push: `git push origin feature/nombre`
4. Crear Pull Request hacia `dev`

## Licencia

Proyecto privado - Padilla 2026
