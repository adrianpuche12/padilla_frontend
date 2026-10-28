import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ roles: ['ADMIN'], isSuperAdmin: () => false }) }));
vi.mock('../components/Layout', () => ({ default: ({ children }) => <div>{children}</div> }));
vi.mock('../components/UserForm', () => ({ default: () => null }));
const userService = {
  getSystemUsers: vi.fn(async () => [
    { id: 'm1', name: 'Mara Manager', email: 'm@x', role: 'MANAGER', active: true, canManage: false },
    { id: 'a1', name: 'Ana Admin', email: 'a@x', role: 'ADMIN', active: true, canManage: false },
  ]),
  getUsers: vi.fn(),
};
vi.mock('../services/userService', () => ({ default: userService }));

const { default: Users } = await import('./Users');

describe('pantalla Usuarios (PRO-093)', () => {
  it('un ADMIN ve a sus pares y superiores, sin acciones sobre ellos', async () => {
    render(<MemoryRouter><Users /></MemoryRouter>);
    expect((await screen.findAllByText('Mara Manager')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ana Admin').length).toBeGreaterThan(0);
    expect(screen.queryByTitle('Editar')).not.toBeInTheDocument();
    expect(userService.getSystemUsers).toHaveBeenCalled();
    expect(userService.getUsers).not.toHaveBeenCalled();
  });
});
