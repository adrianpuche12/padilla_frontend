import { describe, it, expect } from 'vitest';
import { PANTALLAS, TEMAS } from './temas';
import { temasVisibles } from './ayuda';
import { NAV_ITEMS } from '../config/navConfig';

describe('temas de ayuda (PRO-107)', () => {
  it('cada tema apunta a una pantalla conocida y los ids no se repiten', () => {
    const pantallas = new Set(PANTALLAS.map(p => p.id));
    TEMAS.forEach(t => expect(pantallas.has(t.pantalla), `${t.id} -> ${t.pantalla}`).toBe(true));
    expect(new Set(TEMAS.map(t => t.id)).size).toBe(TEMAS.length);
  });

  it('todas las pantallas tienen al menos un tema', () => {
    PANTALLAS.forEach(p => expect(TEMAS.some(t => t.pantalla === p.id), p.id).toBe(true));
  });

  it('cada rol ve solo lo suyo', () => {
    const inquilino = temasVisibles(TEMAS, ['TENANT']).map(t => t.id);
    expect(inquilino).toContain('encuesta');
    expect(inquilino).toContain('tickets-voz');
    expect(inquilino).not.toContain('auditoria');
    expect(temasVisibles(TEMAS, ['MANAGER']).map(t => t.id)).toContain('auditoria');
  });

  it('cada seccion del menu tiene icono y una pantalla de ayuda', () => {
    const pantallas = new Set(PANTALLAS.map(p => p.id));
    NAV_ITEMS.forEach(i => {
      expect(i.icon, i.to).toBeTruthy();
      expect(pantallas.has(i.to.slice(1)), i.to).toBe(true);
    });
  });
});
