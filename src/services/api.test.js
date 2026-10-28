import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import api, { isTokenExpiring, errorMessage } from './api';

/** Genera un JWT falso con el vencimiento pedido (segundos desde ahora). */
function jwt(expiraEnSeg) {
  const payload = { exp: Math.floor(Date.now() / 1000) + expiraEnSeg, sub: 'u1' };
  return `x.${btoa(JSON.stringify(payload))}.y`;
}

describe('cliente HTTP unico (PRO-090)', () => {
  let apiMock;
  let rawMock;

  beforeEach(() => {
    apiMock = new MockAdapter(api);
    rawMock = new MockAdapter(axios);
    delete window.location;
    window.location = { pathname: '/tickets', href: '/tickets' };
  });

  it('detecta tokens por vencer con margen de 30 s', () => {
    expect(isTokenExpiring(jwt(10))).toBe(true);
    expect(isTokenExpiring(jwt(600))).toBe(false);
    expect(isTokenExpiring(null)).toBe(true);
  });

  it('agrega el token vigente a cada request', async () => {
    const token = jwt(600);
    localStorage.setItem('access_token', token);
    apiMock.onGet('/api/tickets').reply((config) => [200, { auth: config.headers.Authorization }]);
    const r = await api.get('/api/tickets');
    expect(r.data.auth).toBe(`Bearer ${token}`);
  });

  it('con varias requests y el token vencido hace UN solo refresh', async () => {
    localStorage.setItem('access_token', jwt(-60));
    localStorage.setItem('refresh_token', 'rt-1');
    const nuevo = jwt(600);
    const refresh = vi.fn(() => [200, { access_token: nuevo, refresh_token: 'rt-2' }]);
    rawMock.onPost(/\/api\/auth\/refresh$/).reply(refresh);
    apiMock.onGet(/\/api\/.*/).reply((config) => [200, config.headers.Authorization]);

    const respuestas = await Promise.all([api.get('/api/tickets'), api.get('/api/reservas'), api.get('/api/users')]);

    expect(refresh).toHaveBeenCalledTimes(1);
    respuestas.forEach((r) => expect(r.data).toBe(`Bearer ${nuevo}`));
    expect(localStorage.getItem('refresh_token')).toBe('rt-2');
  });

  it('ante un 401 renueva y reintenta una sola vez', async () => {
    localStorage.setItem('access_token', jwt(600));
    localStorage.setItem('refresh_token', 'rt-1');
    const nuevo = jwt(900);
    rawMock.onPost(/\/api\/auth\/refresh$/).reply(200, { access_token: nuevo, refresh_token: 'rt-2' });
    let llamadas = 0;
    apiMock.onGet('/api/tickets').reply((config) => {
      llamadas += 1;
      return config.headers.Authorization === `Bearer ${nuevo}` ? [200, 'ok'] : [401];
    });
    const r = await api.get('/api/tickets');
    expect(r.data).toBe('ok');
    expect(llamadas).toBe(2);
  });

  it('si el refresh falla cierra la sesion y va al login', async () => {
    localStorage.setItem('access_token', jwt(-60));
    localStorage.setItem('refresh_token', 'vencido');
    rawMock.onPost(/\/api\/auth\/refresh$/).reply(401, { error: 'SESSION_EXPIRED' });
    await expect(api.get('/api/tickets')).rejects.toThrow('Sesión expirada');
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('lee el mensaje del formato de error del backend', () => {
    expect(errorMessage({ response: { data: { message: 'Ticket no encontrado' } } })).toBe('Ticket no encontrado');
    expect(errorMessage({})).toMatch(/error inesperado/);
  });
});
