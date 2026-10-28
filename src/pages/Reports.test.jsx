import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const api = { get: vi.fn(), post: vi.fn() };
const auth = { roles: ['ADMIN'] };
vi.mock('../services/api', () => ({ default: api, errorMessage: (e, f) => f }));
vi.mock('../services/clientService', () => ({ default: { getClients: vi.fn(async () => [{ id: 'o1', name: 'Ana Dueña' }]) } }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../components/Layout', () => ({ default: ({ children }) => <div>{children}</div> }));
vi.mock('../components/Pagination', () => ({ default: () => null }));
const { default: Reports } = await import('./Reports');
const { reportParams } = await import('./reportes');
const { default: Audit } = await import('./Audit');
const { default: PendingSurveys } = await import('../components/PendingSurveys');

describe('reportes, auditoria y encuestas (PRO-106)', () => {
  beforeEach(() => { vi.clearAllMocks(); auth.roles = ['ADMIN']; });

  it('no manda filtros vacios', () => {
    expect(reportParams({ from: '2026-01-01', to: '', category: null })).toEqual({ format: 'json', from: '2026-01-01' });
  });

  it('cada rol ve solo sus reportes', () => {
    render(<Reports />);
    expect(screen.queryByRole('option', { name: 'Eficiencia operativa' })).not.toBeInTheDocument();
    auth.roles = ['OWNER'];
    render(<Reports />);
    expect(screen.getAllByRole('option', { name: 'Informe anual del propietario' }).length).toBeGreaterThan(0);
  });

  it('genera el reporte con los filtros elegidos', async () => {
    api.get.mockResolvedValue({ data: { title: 'Tickets', subtitle: 'Período', columns: [{ key: 'numero', label: 'N°' }], rows: [{ numero: 42 }] } });
    render(<Reports />);
    await userEvent.selectOptions(screen.getByLabelText('Tipo de servicio'), 'GAS');
    await userEvent.click(screen.getByText('Ver reporte'));
    expect(api.get).toHaveBeenCalledWith('/api/reports/tickets', { params: { format: 'json', category: 'GAS' } });
    expect(await screen.findByText('42')).toBeInTheDocument();
  });

  it('la auditoria muestra quien hizo que', async () => {
    api.get.mockResolvedValue({ data: { content: [{ id: 'a1', actorNombre: 'Laura', actorRol: 'MANAGER', accion: 'TICKET_ESTADO',
      entidad: 'TICKET', detalle: 'NUEVA -> ASIGNADA', createdAt: new Date().toISOString() }], totalPages: 1, totalElements: 1 } });
    render(<Audit />);
    expect(await screen.findByText('Laura')).toBeInTheDocument();
    expect(screen.getByText('Cambio de estado')).toBeInTheDocument();
  });

  it('la encuesta post-cierre se responde con estrellas', async () => {
    api.get.mockResolvedValue({ data: [{ id: 's1', ticketNumber: 7, title: 'Pérdida de agua' }] });
    api.post.mockResolvedValue({ data: {} });
    render(<PendingSurveys />);
    await userEvent.click(await screen.findByLabelText('4 estrellas'));
    await userEvent.click(screen.getByText('Enviar'));
    expect(api.post).toHaveBeenCalledWith('/api/surveys/s1/answer', { puntuacion: 4, comentario: null });
    expect(await screen.findByText('¡Gracias por tu opinión!')).toBeInTheDocument();
  });
});
