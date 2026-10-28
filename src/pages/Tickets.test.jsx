import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { statusActions } from './ticketActions';

let auth;
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../components/Layout', () => ({ default: ({ children }) => <div>{children}</div> }));
const ticketService = { getTickets: vi.fn(), updateStatus: vi.fn(), getComments: vi.fn(), getProviderHistory: vi.fn() };
vi.mock('../services/ticketService', () => ({ default: ticketService }));
vi.mock('../services/userService', () => ({ default: { getUsers: vi.fn(async () => []) } }));
vi.mock('../services/propertyService', () => ({ default: { getProperties: vi.fn(async () => [{ id: 'p1', address: 'Calle 1' }]) } }));
const meService = { getMyProperties: vi.fn(async () => [{ id: 'p1', address: 'Calle 1' }]) };
vi.mock('../services/meService', () => ({ default: meService }));

const { default: Tickets } = await import('./Tickets');

const token = (sub) => `x.${btoa(JSON.stringify({ sub }))}.y`;
const ticket = (over) => ({ id: 't1', ticketNumber: 7, title: 'Canilla', category: 'PLOMERIA', priority: 'NORMAL',
  propertyId: 'p1', status: 'ABIERTA', ...over });

function como(roles, sub = 'u1') {
  auth = { hasRole: (r) => roles.includes(r), getAccessToken: () => token(sub) };
}

describe('acciones de estado por rol (PRO-092)', () => {
  it('el admin recorre todo el ciclo', () => {
    const f = { isAdmin: true };
    expect(statusActions(ticket(), f).map(a => a.to)).toEqual(['EN_PROCESO', 'CANCELADA']);
    expect(statusActions(ticket({ status: 'EN_PROCESO' }), f).map(a => a.to)).toEqual(['RESUELTA', 'CANCELADA']);
    expect(statusActions(ticket({ status: 'RESUELTA' }), f).map(a => a.to)).toEqual(['CERRADA', 'EN_PROCESO']);
    expect(statusActions(ticket({ status: 'CERRADA' }), f)).toEqual([]);
  });

  it('el proveedor solo sobre sus tickets y el inquilino solo cancela abiertos', () => {
    expect(statusActions(ticket({ status: 'EN_PROCESO', providerId: 'yo' }), { isProvider: true, userId: 'yo' })[0].to).toBe('RESUELTA');
    expect(statusActions(ticket({ status: 'EN_PROCESO', providerId: 'otro' }), { isProvider: true, userId: 'yo' })).toEqual([]);
    expect(statusActions(ticket(), { isTenant: true })[0].to).toBe('CANCELADA');
    expect(statusActions(ticket({ status: 'EN_PROCESO' }), { isTenant: true })).toEqual([]);
  });
});

describe('pantalla de tickets (PRO-092)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ticketService.getTickets.mockResolvedValue([ticket()]);
  });

  it('el admin ve el boton de alta y las acciones de gestion', async () => {
    como(['ADMIN']);
    render(<MemoryRouter><Tickets /></MemoryRouter>);
    expect(await screen.findByText('+ Nuevo ticket')).toBeInTheDocument();
    expect(screen.getByText('Asignar')).toBeInTheDocument();
    expect(screen.getByText('Rechazar')).toBeInTheDocument();
  });

  it('el inquilino crea tickets con sus propiedades y no ve acciones de admin', async () => {
    como(['TENANT']);
    render(<MemoryRouter><Tickets /></MemoryRouter>);
    expect(await screen.findByText('+ Nuevo ticket')).toBeInTheDocument();
    expect(screen.queryByText('Asignar')).not.toBeInTheDocument();
    expect(screen.queryByText('Rechazar')).not.toBeInTheDocument();
    await waitFor(() => expect(meService.getMyProperties).toHaveBeenCalled());
  });

  it('el admin cambia el estado con un clic y la fila se actualiza', async () => {
    como(['ADMIN']);
    ticketService.updateStatus.mockResolvedValue(ticket({ status: 'EN_PROCESO' }));
    render(<MemoryRouter><Tickets /></MemoryRouter>);
    await userEvent.click(await screen.findByText('Tomar'));
    expect(ticketService.updateStatus).toHaveBeenCalledWith('t1', 'EN_PROCESO', undefined);
    expect(await screen.findByText('Resolver')).toBeInTheDocument();
  });

  it('un error del backend se muestra en pantalla', async () => {
    como(['ADMIN']);
    ticketService.updateStatus.mockRejectedValue({ response: { data: { message: 'No se puede pasar un ticket de ABIERTA a RESUELTA' } } });
    render(<MemoryRouter><Tickets /></MemoryRouter>);
    await userEvent.click(await screen.findByText('Tomar'));
    expect(await screen.findByText(/No se puede pasar un ticket/)).toBeInTheDocument();
  });
});
