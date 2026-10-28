import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const api = { get: vi.fn(), put: vi.fn() };
vi.mock('../services/api', () => ({ default: api, errorMessage: (e, f) => f }));
const { default: WidgetBoard, WidgetContent } = await import('./WidgetBoard');

describe('dashboard configurable (PRO-105)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation(async (url) => url.endsWith('available')
      ? { data: [
          { code: 'TICKETS_OPEN', title: 'Tickets abiertos', isEnabled: true, position: 1 },
          { code: 'PROPERTIES_STATUS', title: 'Estado de propiedades', isEnabled: false, position: 2 },
        ] }
      : { data: { TICKETS_OPEN: { abiertos: 132, enProceso: 166, total: 298 } } });
    api.put.mockResolvedValue({ data: [] });
  });

  it('muestra los widgets activos con sus datos', async () => {
    render(<WidgetBoard />);
    expect(await screen.findByTestId('widget-TICKETS_OPEN')).toHaveTextContent('132');
    expect(screen.queryByTestId('widget-PROPERTIES_STATUS')).not.toBeInTheDocument();
  });

  it('el usuario elige que ver y se guarda', async () => {
    render(<WidgetBoard />);
    await screen.findByTestId('widget-TICKETS_OPEN');
    await userEvent.click(screen.getByText(/Personalizar dashboard/));
    await userEvent.click(screen.getByLabelText('Estado de propiedades'));
    await userEvent.click(screen.getByText('Guardar'));
    expect(api.put).toHaveBeenCalledWith('/api/dashboard/widgets/preferences', expect.arrayContaining([
      { widgetCode: 'PROPERTIES_STATUS', isEnabled: true, position: 2 },
    ]));
  });

  it('dibuja listas como tabla', () => {
    render(<WidgetContent data={[{ estado: 'AVAILABLE', cantidad: 919 }]} />);
    expect(screen.getByText('919')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });
});
