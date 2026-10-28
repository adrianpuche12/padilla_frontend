import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { STAFF, ROLES, hasAnyRole } from '../auth/roles';

let auth = {};
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));

function renderAt(roles) {
  return render(
    <MemoryRouter initialEntries={['/users']}>
      <Routes>
        <Route path="/users" element={<PrivateRoute roles={roles}><p>Pantalla usuarios</p></PrivateRoute>} />
        <Route path="/login" element={<p>Login</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PrivateRoute con roles (PRO-091)', () => {
  it('sin sesion manda al login', () => {
    auth = { isAuthenticated: false, isLoading: false, roles: [] };
    renderAt(STAFF);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('un inquilino no entra por URL a una pantalla del personal', () => {
    auth = { isAuthenticated: true, isLoading: false, roles: ['TENANT', 'offline_access'] };
    renderAt(STAFF);
    expect(screen.getByRole('alert')).toHaveTextContent('No tenés acceso');
    expect(screen.queryByText('Pantalla usuarios')).not.toBeInTheDocument();
  });

  it('el personal entra; sin roles declarados alcanza con la sesion', () => {
    auth = { isAuthenticated: true, isLoading: false, roles: ['ADMIN'] };
    renderAt(STAFF);
    expect(screen.getByText('Pantalla usuarios')).toBeInTheDocument();
  });

  it('acepta roles en minusculas', () => {
    expect(hasAnyRole(['super_admin'], [ROLES.SUPER_ADMIN])).toBe(true);
    expect(hasAnyRole([], STAFF)).toBe(false);
  });
});
