import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const api = { get: vi.fn(), post: vi.fn(), delete: vi.fn() };
vi.mock('../services/api', () => ({ default: api, errorMessage: (e, f) => e?.response?.data?.message || f || 'error' }));
const { default: Attachments } = await import('./Attachments');

describe('adjuntos (PRO-102)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: [{ id: 'a1', nombre: 'escritura.pdf', sizeBytes: 2048 }] });
    api.post.mockResolvedValue({ data: {} });
  });

  it('lista y sube archivos a la entidad', async () => {
    render(<Attachments entityType="PROPIEDAD" entityId="p1" />);
    expect(await screen.findByText('escritura.pdf')).toBeInTheDocument();
    const file = new File(['%PDF'], 'poder.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByLabelText('Subir archivo'), file);
    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const enviado = api.post.mock.calls[0][1];
    expect(enviado.get('entityType')).toBe('PROPIEDAD');
    expect(enviado.get('entityId')).toBe('p1');
  });

  it('muestra el error del backend (tipo no permitido)', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Tipo de archivo no permitido' } } });
    render(<Attachments entityType="TICKET" entityId="t1" />);
    await screen.findByText('escritura.pdf');
    await userEvent.upload(screen.getByLabelText('Subir archivo'), new File(['x'], 'x.png', { type: 'image/png' }));
    expect(await screen.findByText('Tipo de archivo no permitido')).toBeInTheDocument();
  });
});
