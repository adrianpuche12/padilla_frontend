import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import usePagedList from './usePagedList';
import Pagination from '../components/Pagination';

function Lista({ fetchPage }) {
  const { items, data, page, setPage, q, setQ, loading } = usePagedList(fetchPage, { size: 2 });
  return (
    <div>
      <input aria-label="buscar" value={q} onChange={e => setQ(e.target.value)} />
      {loading ? <p>cargando</p> : items.map(i => <p key={i.id}>{i.name}</p>)}
      <Pagination page={page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />
    </div>
  );
}

const pagina = (page, q) => ({
  content: q ? [{ id: 'z', name: 'Zoe ' + q }] : [{ id: `a${page}`, name: `Item ${page * 2 + 1}` }, { id: `b${page}`, name: `Item ${page * 2 + 2}` }],
  totalElements: q ? 1 : 5, totalPages: q ? 1 : 3, page, size: 2,
});

describe('paginacion server-side (PRO-094)', () => {
  it('pide la pagina siguiente al backend', async () => {
    const fetchPage = vi.fn(async ({ page, q }) => pagina(page, q));
    render(<Lista fetchPage={fetchPage} />);
    expect(await screen.findByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText(/Página 1 de 3/)).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Página siguiente'));
    expect(await screen.findByText('Item 3')).toBeInTheDocument();
    expect(fetchPage).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, size: 2 }));
  });

  it('un cambio de pagina apenas abre la pantalla no se pierde (debounce sin busqueda)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchPage = vi.fn(async ({ page, q }) => pagina(page, q));
    render(<Lista fetchPage={fetchPage} />);
    await screen.findByText('Item 1');
    await act(async () => { screen.getByLabelText('Página siguiente').click(); });
    await act(async () => { vi.advanceTimersByTime(400); });
    expect(await screen.findByText('Item 3')).toBeInTheDocument();
    expect(fetchPage).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }));
    vi.useRealTimers();
  });

  it('la busqueda espera a que se deje de escribir y vuelve a la pagina 0', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchPage = vi.fn(async ({ page, q }) => pagina(page, q));
    render(<Lista fetchPage={fetchPage} />);
    await screen.findByText('Item 1');
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.type(screen.getByLabelText('buscar'), 'perez');
    await act(async () => { vi.advanceTimersByTime(400); });
    await waitFor(() => expect(fetchPage).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0, q: 'perez' })));
    expect(fetchPage.mock.calls.filter(([p]) => p.q).length).toBe(1);
    vi.useRealTimers();
  });
});
