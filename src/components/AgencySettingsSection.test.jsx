import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const settingsService = {
  getAgency: vi.fn(async () => ({ agencyName: 'Inmobiliaria Norte', razonSocial: 'NORTE SRL', comisionPct: 5, comisionIva: true })),
  getRules: vi.fn(async () => ({ slaHoras: 48, montoCritico: null, emailDesdeHora: 8, emailHastaHora: 20, tiposObligatorios: ['SLA_INCUMPLIDO'] })),
  getPlan: vi.fn(async () => ({ plan: 'STARTER', maxProperties: 150, maxAdmins: 2 })),
  updateAgency: vi.fn(async (d) => d),
};
vi.mock('../services/settingsService', () => ({ default: settingsService }));
const { default: AgencySettingsSection } = await import('./AgencySettingsSection');

describe('configuracion de la inmobiliaria (PRO-100)', () => {
  it('muestra datos, plan y reglas; el SUPER_ADMIN guarda', async () => {
    render(<AgencySettingsSection canEdit />);
    expect(await screen.findByDisplayValue('NORTE SRL')).toBeInTheDocument();
    expect(screen.getByText(/Plan STARTER/)).toBeInTheDocument();
    await userEvent.click(screen.getByText('Guardar configuración'));
    expect(settingsService.updateAgency).toHaveBeenCalledWith(expect.objectContaining({ razonSocial: 'NORTE SRL', slaHoras: 48 }));
    expect(await screen.findByText(/Configuración guardada/)).toBeInTheDocument();
  });

  it('sin permiso de edicion los campos quedan de solo lectura', async () => {
    render(<AgencySettingsSection canEdit={false} />);
    expect(await screen.findByDisplayValue('NORTE SRL')).toBeDisabled();
    expect(screen.queryByText('Guardar configuración')).not.toBeInTheDocument();
  });
});
