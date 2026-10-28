import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const api = { get: vi.fn(), patch: vi.fn(), put: vi.fn() };
vi.mock('../services/api', () => ({ default: api, errorMessage: (e, f) => f }));
vi.mock('./Layout', () => ({ default: ({ children }) => <div>{children}</div> }));
const { default: NotificationBell } = await import('./NotificationBell');
const { default: Notifications } = await import('../pages/Notifications');

describe('notificaciones (PRO-104)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation(async (url) => {
      if (url.endsWith('unread-count')) return { data: { unread: 3 } };
      if (url.endsWith('preferences')) return { data: { emailEnabled: true, resumen: 'OFF' } };
      return { data: { content: [{ id: 'n1', titulo: 'Nuevo ticket #7', mensaje: 'Se abrió el ticket', leida: false,
        prioridad: 'URGENTE', createdAt: new Date().toISOString() }], totalPages: 1, totalElements: 1 } };
    });
    api.patch.mockResolvedValue({ data: {} });
    api.put.mockImplementation(async (_u, body) => ({ data: body }));
  });

  it('la campana muestra las no leidas', async () => {
    render(<MemoryRouter><NotificationBell /></MemoryRouter>);
    expect(await screen.findByTestId('unread-badge')).toHaveTextContent('3');
  });

  it('la bandeja lista, marca todas como leidas y guarda preferencias', async () => {
    render(<MemoryRouter><Notifications /></MemoryRouter>);
    expect(await screen.findByText('Nuevo ticket #7')).toBeInTheDocument();
    expect(screen.getByText('Urgente')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Marcar todas como leídas'));
    expect(api.patch).toHaveBeenCalledWith('/api/notifications/read-all');
    await userEvent.selectOptions(await screen.findByLabelText('Resumen'), 'DIARIO');
    await userEvent.click(screen.getByText('Guardar preferencias'));
    expect(api.put).toHaveBeenCalledWith('/api/notifications/preferences', expect.objectContaining({ resumen: 'DIARIO' }));
  });
});
