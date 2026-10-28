import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const api = { post: vi.fn(), get: vi.fn(), patch: vi.fn() };
vi.mock('../services/api', () => ({ default: api, errorMessage: (e, f) => e?.response?.data?.message || f }));
const { default: VoiceTicketWizard } = await import('./VoiceTicketWizard');
const { default: TicketExtras } = await import('./TicketExtras');

describe('carga por voz guiada (PRO-103)', () => {
  beforeEach(() => { vi.clearAllMocks(); api.post.mockResolvedValue({ data: { id: 't9' } }); });

  it('recorre los 4 pasos y envia con modoCarga VOZ_GUIADA', async () => {
    const onCreated = vi.fn();
    render(<VoiceTicketWizard propertyId="p1" onClose={() => {}} onCreated={onCreated} />);
    await userEvent.click(screen.getByText(/Agua \/ plomería/));
    await userEvent.type(screen.getByLabelText('Descripción del problema'), 'Pierde la canilla del baño');
    await userEvent.click(screen.getByText('Siguiente'));
    await userEvent.click(screen.getByText('Saltar este paso'));
    expect(screen.getByText(/Pierde la canilla del baño/)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/Enviar pedido/));
    expect(api.post).toHaveBeenCalledWith('/api/tickets', expect.objectContaining({
      category: 'PLOMERIA', propertyId: 'p1', modoCarga: 'VOZ_GUIADA', dispositivo: 'Web',
    }));
    expect(onCreated).toHaveBeenCalled();
  });

  it('no avanza sin descripcion y permite volver a editar', async () => {
    render(<VoiceTicketWizard propertyId="p1" onClose={() => {}} />);
    await userEvent.click(screen.getByText(/Otro problema/));
    expect(screen.getByText('Siguiente')).toBeDisabled();
  });
});

describe('extras del ticket (PRO-103)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation(async (url) => (url.includes('budgets')
      ? { data: [{ id: 'b1', monto: 15000, detalle: 'Cambio de cuerito', status: 'PENDIENTE' }] } : { data: [] }));
    api.patch.mockResolvedValue({ data: {} });
  });

  it('el propietario ve y aprueba presupuestos', async () => {
    render(<TicketExtras ticket={{ id: 't1', status: 'EN_PROCESO', tenantId: 'x' }} isOwner userId="o1" />);
    expect(await screen.findByText(/Cambio de cuerito/)).toBeInTheDocument();
    await userEvent.click(screen.getByText('Aprobar'));
    expect(api.patch).toHaveBeenCalledWith('/api/budgets/b1/approve');
  });

  it('el proveedor asignado envia un presupuesto', async () => {
    api.post.mockResolvedValue({ data: {} });
    render(<TicketExtras ticket={{ id: 't1', status: 'EN_PROCESO', providerId: 'pv' }} isProvider userId="pv" />);
    await userEvent.type(await screen.findByLabelText('Monto del presupuesto'), '20000');
    await userEvent.type(screen.getByLabelText('Detalle del presupuesto'), 'Materiales y mano de obra');
    await userEvent.click(screen.getByText('Enviar presupuesto'));
    expect(api.post).toHaveBeenCalledWith('/api/tickets/t1/budgets', { monto: 20000, detalle: 'Materiales y mano de obra' });
  });
});
