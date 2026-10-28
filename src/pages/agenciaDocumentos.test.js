import { describe, it, expect } from 'vitest';
import { agenciaParaDocumentos, AGENCIA_VACIA } from './agenciaDocumentos';

describe('datos de la agencia para FC1/FC10/CTR (PRO-095)', () => {
  it('arma los textos con la configuracion de la inmobiliaria', () => {
    const a = agenciaParaDocumentos({
      agencyName: 'Inmobiliaria Norte', razonSocial: 'NORTE SRL', corredorNombre: 'Laura Gomez',
      corredorMatricula: 'Mat. 123', ciudad: 'Córdoba', provincia: 'Córdoba', comisionPct: 4.5, comisionIva: true,
      emailContratos: 'contratos@norte.test', plataformaPago: 'MercadoPago',
    });
    expect(a.razonSocial).toBe('NORTE SRL');
    expect(a.comisionTexto).toBe('4,5% + IVA');
    expect(a.ciudad).toBe('Córdoba');
    expect(a.nombreComercial).toBe('Inmobiliaria Norte');
  });

  it('sin datos deja lineas para completar a mano (nunca los datos de otra inmobiliaria)', () => {
    expect(agenciaParaDocumentos(null)).toBe(AGENCIA_VACIA);
    const a = agenciaParaDocumentos({ agencyName: 'Nueva' });
    expect(a.emailContratos).toBe('_______________');
    expect(JSON.stringify(a)).not.toMatch(/Padilla|Ramasco|Rosario/i);
  });
});
