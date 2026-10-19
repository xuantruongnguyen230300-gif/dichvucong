import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense, use, useContext } from 'react';
import { createMemoryRouter, RouterProvider, UNSAFE_DataRouterContext as NguCanhRouter, useLocation, useSearchParams } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useDanhSachUrl } from './useDanhSachUrl';

/**
 * Tái hiện R1 (F06/F09): gõ ô tìm rồi mở popup (`?ma=`) từ nơi khác ngay, trước khi lần ghi `q` trễ 300 ms chạy.
 * Lần mở popup còn chờ vẽ (transition bị treo: trang nặng/chậm) nên `params` của hook vẫn là bản cũ không có `ma`.
 * Lần ghi `q` sau đó không được ghi đè mất `ma` (popup không mở), và lần mở popup không làm mất `q`.
 */

let moCong: (() => void) | undefined;
let congCho: Promise<void> | undefined;

/** Treo việc vẽ trang khi địa chỉ có `ma` cho tới khi test cho phép: địa chỉ của router đã đổi nhưng React chưa commit. */
function ConTreo() {
  const ma = new URLSearchParams(useLocation().search).get('ma');
  if (ma && congCho) use(congCho);
  return null;
}

function Trang() {
  const h = useDanhSachUrl();
  const [, datParams] = useSearchParams();
  const router = useContext(NguCanhRouter)?.router;
  const { search } = useLocation();
  return (
    <div>
      <input aria-label="tim" value={h.tuKhoa} onChange={(e) => h.datTuKhoa(e.target.value)} />
      <button
        onClick={() => {
          // như `useMoThuTuc.mo`: lấy địa chỉ MỚI NHẤT của router (lần điều hướng đang chờ hoặc đã commit), thêm `ma`.
          // Không dùng dạng hàm của `datParams`: nó lấy `params` của lần vẽ trước, nên nếu lần ghi `q` trễ 300 ms
          // vừa chạy (máy chậm khiến cú bấm tới sau mốc đó) thì `q` mất, không phải lỗi của hook.
          const { navigation, location } = router!.state;
          const moi = new URLSearchParams((navigation.location ?? location).search);
          moi.set('ma', '1.001193');
          datParams(moi, { replace: true });
        }}
      >
        mo
      </button>
      <output data-testid="dia-chi">{search}</output>
      <Suspense fallback={null}>
        <ConTreo />
      </Suspense>
    </div>
  );
}

function dung(duongDan = '/') {
  congCho = new Promise<void>((giai) => (moCong = giai));
  const router = createMemoryRouter([{ path: '*', element: <Trang /> }], { initialEntries: [duongDan] });
  render(<RouterProvider router={router} />);
  return router;
}

const choMs = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const tim = () => screen.getByRole('textbox', { name: 'tim' });

describe('useDanhSachUrl: không ghi đè điều hướng khác xen vào (R1)', () => {
  it('gõ rồi mở popup ngay (popup còn chờ vẽ): sau 300 ms địa chỉ có cả q lẫn ma', async () => {
    const user = userEvent.setup();
    const router = dung();
    await user.type(tim(), 'khai sinh');
    await user.click(screen.getByRole('button', { name: 'mo' }));
    expect(router.state.navigation.location?.search ?? router.state.location.search).toContain('ma=1.001193');

    await choMs(450); // lần ghi q trễ 300 ms chạy sau khi popup đã được yêu cầu mở
    const sp = new URLSearchParams(router.state.location.search || router.state.navigation.location?.search);
    expect(sp.get('ma')).toBe('1.001193');
    expect(sp.get('q')).toBe('khai sinh');

    act(() => moCong?.());
    await choMs(20);
    const cuoi = new URLSearchParams(router.state.location.search);
    expect(cuoi.get('ma')).toBe('1.001193');
    expect(cuoi.get('q')).toBe('khai sinh');
  });

  it('lặp 10 lần với thời gian lệch nhau: luôn giữ cả hai tham số', async () => {
    for (let i = 0; i < 10; i++) {
      const user = userEvent.setup();
      const router = dung();
      await user.type(tim(), 'kết hôn');
      if (i % 2 === 0) await choMs(i * 30); // lúc thì chưa tới 300 ms, lúc thì gần
      await user.click(screen.getByRole('button', { name: 'mo' }));
      await choMs(450);
      act(() => moCong?.());
      await choMs(20);
      const sp = new URLSearchParams(router.state.location.search);
      expect(sp.get('ma'), `lần ${i}`).toBe('1.001193');
      expect(sp.get('q'), `lần ${i}`).toBe('kết hôn');
      document.body.innerHTML = '';
    }
  });

  it('popup đã có sẵn trên địa chỉ (?ma=...): gõ ô tìm giữ nguyên ma', async () => {
    const user = userEvent.setup();
    congCho = Promise.resolve();
    const router = createMemoryRouter([{ path: '*', element: <Trang /> }], { initialEntries: ['/?ma=1.001193'] });
    render(<RouterProvider router={router} />);
    await user.type(tim(), 'abc');
    await choMs(450);
    const sp = new URLSearchParams(router.state.location.search);
    expect(sp.get('ma')).toBe('1.001193');
    expect(sp.get('q')).toBe('abc');
  });
});
