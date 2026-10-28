import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../components/Layout', () => ({ default: ({ children }) => <div>{children}</div> }));
const meService = {
  getMe: vi.fn(async () => ({ name: 'Ana Inquilina', email: 'ana@x', role: 'TENANT', agencyName: 'Inmobiliaria Padilla', address: 'Viejo 1' })),
  updateMe: vi.fn(async (d) => ({ role: 'TENANT', email: 'ana@x', agencyName: 'Inmobiliaria Padilla', ...d })),
  changePassword: vi.fn(async () => ({})),
};
vi.mock('../services/meService', () => ({ default: meService }));
const { default: Profile } = await import('./Profile');

describe('Mi perfil (PRO-101)', () => {
  it('el inquilino edita sus datos y su domicilio', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    const domicilio = await screen.findByDisplayValue('Viejo 1');
    await userEvent.clear(domicilio);
    await userEvent.type(domicilio, 'Nuevo 2');
    await userEvent.click(screen.getByText('Guardar'));
    expect(meService.updateMe).toHaveBeenCalledWith(expect.objectContaining({ address: 'Nuevo 2' }));
    expect(await screen.findByText('Datos actualizados')).toBeInTheDocument();
  });

  it('valida que las contraseñas nuevas coincidan antes de llamar al backend', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    await screen.findByDisplayValue('Viejo 1');
    await userEvent.type(screen.getByLabelText('Contraseña actual'), 'Vieja123!');
    await userEvent.type(screen.getByLabelText('Contraseña nueva'), 'Nueva123!');
    await userEvent.type(screen.getByLabelText('Repetir contraseña nueva'), 'Otra123!');
    await userEvent.click(screen.getByText('Cambiar contraseña', { selector: 'button' }));
    expect(await screen.findByText('Las contraseñas nuevas no coinciden')).toBeInTheDocument();
    expect(meService.changePassword).not.toHaveBeenCalled();
  });
});
