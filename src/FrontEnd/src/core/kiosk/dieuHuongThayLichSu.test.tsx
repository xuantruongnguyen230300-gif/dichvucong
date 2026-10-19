import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { createMemoryRouter, Link, NavLink, RouterProvider, useNavigate, useSearchParams } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useDieuHuongThayLichSu } from './dieuHuongThayLichSu';

function KichHoat() {
  useDieuHuongThayLichSu();
  return null;
}

function Dieu() {
  const navigate = useNavigate();
  const [, datThamSo] = useSearchParams();
  return (
    <>
      <button onClick={() => void navigate('/c')}>navigate-c</button>
      <button onClick={() => void navigate(-1)}>lui</button>
      <button onClick={() => datThamSo({ q: 'x' })}>tham-so</button>
    </>
  );
}

function Trang({ bat }: { bat: boolean }) {
  return (
    <>
      {bat && <KichHoat />}
      <Link to="/a">link-a</Link>
      <NavLink to="/b">nav-b</NavLink>
      <Dieu />
    </>
  );
}

const taoRouter = (bat: boolean, vao: string[] = ['/'], viTri?: number) =>
  createMemoryRouter([{ path: '*', element: <Trang bat={bat} /> }], { initialEntries: vao, initialIndex: viTri });

describe('useDieuHuongThayLichSu (F09 BR-7, AC-7)', () => {
  it.each([['link-a'], ['nav-b'], ['navigate-c'], ['tham-so']])('kiosk: %s thay mục lịch sử (REPLACE)', async (ten) => {
    const user = userEvent.setup();
    const router = taoRouter(true);
    render(<RouterProvider router={router} />);
    await user.click(screen.getByText(ten));
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('kiosk: navigate(-1) vẫn là lùi (POP)', async () => {
    const user = userEvent.setup();
    const router = taoRouter(true, ['/x', '/y'], 1);
    render(<RouterProvider router={router} />);
    await user.click(screen.getByText('lui'));
    expect(router.state.historyAction).toBe('POP');
    expect(router.state.location.pathname).toBe('/x');
  });

  it('ngoài kiosk: vẫn PUSH', async () => {
    const user = userEvent.setup();
    const router = taoRouter(false);
    render(<RouterProvider router={router} />);
    await user.click(screen.getByText('link-a'));
    expect(router.state.historyAction).toBe('PUSH');
  });

  it('unmount trả lại router.navigate gốc', () => {
    const router = taoRouter(true);
    const goc = router.navigate;
    const { unmount } = render(<RouterProvider router={router} />);
    expect(router.navigate).not.toBe(goc);
    unmount();
    expect(router.navigate).toBe(goc);
  });

  it('StrictMode: không gói lồng hai lần, vẫn REPLACE', async () => {
    const user = userEvent.setup();
    const router = taoRouter(true);
    const goc = router.navigate;
    const { unmount } = render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
    await user.click(screen.getByText('link-a'));
    expect(router.state.historyAction).toBe('REPLACE');
    unmount();
    expect(router.navigate).toBe(goc);
  });
});
