import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describeHttpError } from '../utils/httpError';

let auth = {};
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../context/ThemeContext', () => ({ useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }) }));
vi.mock('./NotificationBell', () => ({ default: () => <span>campana</span> }));
vi.mock('../ayuda/PanelDeAyuda', () => ({ default: () => <div>panel de ayuda</div> }));
vi.mock('../services/authService', () => ({ default: { changePassword: vi.fn(async () => ({})) } }));
const { default: PrivateRoute } = await import('./PrivateRoute');
const { default: Layout } = await import('./Layout');
const { default: LoginPage } = await import('../pages/LoginPage');
const { default: ChangePassword } = await import('../pages/ChangePassword');

function Ruta() {
  return <p>en {useLocation().pathname}</p>;
}

describe('revision 01 de Claude Design (PRO-111)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('A-02: con el cambio de contraseña pendiente no se entra a ninguna pantalla', () => {
    auth = { isAuthenticated: true, isLoading: false, roles: ['ADMIN'], mustChangePassword: true };
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute><p>Dashboard</p></PrivateRoute>} />
          <Route path="/change-password" element={<Ruta />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('en /change-password')).toBeInTheDocument();
  });

  it('B-01: después del login vuelve a la pantalla donde estaba', async () => {
    auth = { isAuthenticated: false, isLoading: false, roles: [], login: vi.fn(async () => ({})) };
    render(
      <MemoryRouter initialEntries={['/tickets']}>
        <Routes>
          <Route path="/tickets" element={<PrivateRoute><Ruta /></PrivateRoute>} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );
    await userEvent.type(screen.getByLabelText('Usuario'), 'demo');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'x');
    auth = { ...auth, isAuthenticated: true };
    await userEvent.click(screen.getByText('Ingresar'));
    expect(await screen.findByText('en /tickets')).toBeInTheDocument();
  });

  it('A-04: el login distingue los errores', async () => {
    const err = (status, data) => Object.assign(new Error('x'), { response: { status, data } });
    for (const [e, msg] of [
      [err(401, {}), 'Usuario o contraseña incorrectos'],
      [err(500, {}), 'El servidor tuvo un problema'],
      [err(403, 'Invalid CORS request'), 'rechazó la conexión desde esta dirección'],
      [new Error('Network Error'), 'No se pudo conectar con el servidor'],
    ]) {
      auth = { isAuthenticated: false, isLoading: false, roles: [], login: vi.fn(async () => { throw e; }) };
      const { unmount } = render(<MemoryRouter><LoginPage /></MemoryRouter>);
      await userEvent.type(screen.getByLabelText('Usuario'), 'demo');
      await userEvent.type(screen.getByLabelText('Contraseña'), 'x');
      await userEvent.click(screen.getByText('Ingresar'));
      expect(await screen.findByText(new RegExp(msg))).toBeInTheDocument();
      unmount();
    }
  });

  it('A-06: el ojo de la contraseña se usa con teclado', () => {
    auth = { isAuthenticated: false, isLoading: false, roles: [], login: vi.fn() };
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    const ojo = screen.getByLabelText('Mostrar contraseña');
    expect(ojo).not.toHaveAttribute('tabindex', '-1');
    fireEvent.click(ojo);
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('autocomplete', 'username');
  });

  it('A-01 y A-03: cambio de contraseña con marca Propero y "Cerrar sesión" lleva al login', async () => {
    const logout = vi.fn(async () => {});
    auth = { isAuthenticated: true, isLoading: false, roles: [], getAccessToken: () => null, logout, completePasswordChange: vi.fn() };
    render(
      <MemoryRouter initialEntries={['/change-password']}>
        <Routes>
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/login" element={<Ruta />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByText('PADILLA')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Propero');
    await userEvent.click(screen.getByText('Cerrar sesión'));
    expect(logout).toHaveBeenCalled();
    expect(await screen.findByText('en /login')).toBeInTheDocument();
  });

  it('Layout: menú por rol, campana, ayuda, perfil y menú colapsado con íconos', async () => {
    auth = { user: { username: 'demo' }, roles: ['TENANT'], logout: vi.fn() };
    render(<MemoryRouter initialEntries={['/tickets']}><Layout title="Tickets"><p>contenido</p></Layout></MemoryRouter>);
    expect(screen.getByText('Mi vivienda')).toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.getByText('campana')).toBeInTheDocument();
    expect(screen.getByTitle('Mi perfil')).toHaveAttribute('href', '/profile');
    await userEvent.click(screen.getByText('Ayuda'));
    expect(screen.getByText('panel de ayuda')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Colapsar menú'));
    expect(screen.getByLabelText('Tickets')).toHaveAttribute('href', '/tickets'); // sigue navegable con ícono
    expect(localStorage.getItem('propero_sidebar_collapsed')).toBe('1');
  });

  it('describeHttpError: timeout, 429 y mensaje del backend', () => {
    expect(describeHttpError({ code: 'ECONNABORTED' })).toMatch(/tardó demasiado/);
    expect(describeHttpError({ response: { status: 429, data: {} } })).toMatch(/Demasiados intentos/);
    expect(describeHttpError({ response: { status: 400, data: { message: 'Email inválido' } } })).toBe('Email inválido');
  });
});
