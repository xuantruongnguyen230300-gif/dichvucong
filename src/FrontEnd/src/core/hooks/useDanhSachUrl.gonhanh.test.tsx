import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense, use } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useDanhSachUrl } from './useDanhSachUrl';

/**
 * Tái hiện lỗi "gõ tiếp ngay lúc lần ghi địa chỉ đang xử lý thì mất ký tự" (gõ "giay" ra "iay").
 * React Router bọc cập nhật địa chỉ trong transition; transition bị treo (route nặng/chậm) thì địa chỉ chưa đổi
 * trong khi hook đã ghi xong. Ô tìm không được quay về giá trị cũ của địa chỉ trong khoảng đó.
 * Ở đây "route chậm" là một con treo (Suspense) tới khi test cho phép; bản thật là máy chậm, danh sách 1.000 mục.
 */

const cong = new Map<string, { promise: Promise<void>; mo: () => void }>();
function congCho(q: string) {
  let c = cong.get(q);
  if (!c) {
    let mo!: () => void;
    const promise = new Promise<void>((giai) => (mo = giai));
    c = { promise, mo };
    cong.set(q, c);
  }
  return c;
}

function ConTreo() {
  const q = new URLSearchParams(useLocation().search).get('q');
  if (q) use(congCho(q).promise);
  return null;
}

function Trang() {
  const h = useDanhSachUrl();
  const { search } = useLocation();
  return (
    <div>
      <input aria-label="tim" value={h.tuKhoa} onChange={(e) => h.datTuKhoa(e.target.value)} />
      <output data-testid="dia-chi">{search}</output>
      <output data-testid="trang">{String(h.trang)}</output>
      <Suspense fallback={null}>
        <ConTreo />
      </Suspense>
    </div>
  );
}

const choMs = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const o = () => screen.getByRole('textbox', { name: 'tim' }) as HTMLInputElement;
const diaChi = () => screen.getByTestId('dia-chi').textContent;

describe('useDanhSachUrl: gõ khi lần ghi địa chỉ đang treo', () => {
  it('gõ "g", đợi lần ghi, gõ tiếp "iay" lúc địa chỉ chưa kịp đổi → ô tìm là "giay", không mất "g"', async () => {
    cong.clear();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Trang />
      </MemoryRouter>,
    );
    await user.type(o(), 'g');
    await choMs(400); // quá 300 ms: hook đã ghi q=g, transition treo ở ConTreo nên địa chỉ chưa đổi
    expect(diaChi()).toBe('');
    expect(o().value).toBe('g');

    // gõ tiếp giữa chừng (con trỏ vẫn ở ô tìm); act bất đồng bộ để React được chờ transition đang treo
    await act(async () => {
      await user.keyboard('iay');
    });
    expect(o().value).toBe('giay');

    await choMs(400); // lần ghi thứ hai (q=giay) cũng đã phát đi trong lúc lần đầu còn treo
    await act(async () => {
      congCho('g').mo();
      congCho('giay').mo();
    });
    await waitFor(() => expect(diaChi()).toBe('?q=giay'));
    expect(o().value).toBe('giay'); // địa chỉ q=g của chính hook về muộn, rồi q=giay: ô tìm không bị ghi đè
  });

  it('xoá sạch ô (fill rỗng) lúc lần ghi trước còn treo → ô rỗng, địa chỉ về không có q', async () => {
    cong.clear();
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/?q=cu']}>
        <Trang />
      </MemoryRouter>,
    );
    await act(async () => congCho('cu').mo());
    await user.keyboard('a'); // "cua"
    await choMs(400);
    expect(diaChi()).toBe('?q=cu');
    await user.clear(o());
    expect(o().value).toBe('');
    await act(async () => congCho('cua').mo());
    expect(o().value).toBe('');
    await choMs(400);
    await waitFor(() => expect(diaChi()).toBe(''));
    expect(o().value).toBe('');
  });

  it('gõ nhanh 30 ms/phím trên danh sách 1.000 mục vẽ chậm: không mất phím nào, địa chỉ cuối đúng', async () => {
    cong.clear();
    const user = userEvent.setup({ delay: 30 });
    function DanhSachNang() {
      const h = useDanhSachUrl();
      const muc = Array.from({ length: 1000 }, (_, i) => `Thủ tục số ${i} ${h.tuKhoaLoc}`);
      return (
        <div>
          <input aria-label="tim" value={h.tuKhoa} onChange={(e) => h.datTuKhoa(e.target.value)} />
          <output data-testid="dia-chi">{useLocation().search}</output>
          <ul>
            {muc.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      );
    }
    render(
      <MemoryRouter>
        <DanhSachNang />
      </MemoryRouter>,
    );
    const chu = 'giay chung sinh cho tre';
    await user.click(o());
    await act(async () => {
      await user.keyboard(chu);
    });
    expect(o().value).toBe(chu);
    await waitFor(() => expect(diaChi()).toBe('?q=giay+chung+sinh+cho+tre'));
    expect(o().value).toBe(chu);
  });

  it('bộ gõ Telex (compositionstart → nhiều lần đổi → compositionend): ô tìm giữ đúng chuỗi cuối kể cả khi lần ghi trước đang treo', async () => {
    cong.clear();
    render(
      <MemoryRouter>
        <Trang />
      </MemoryRouter>,
    );
    const ngoi = o();
    ngoi.focus();
    fireEvent.compositionStart(ngoi);
    fireEvent.change(ngoi, { target: { value: 'g' } });
    await choMs(400); // địa chỉ q=g đã phát đi, đang treo
    for (const v of ['gi', 'gia', 'giáy']) fireEvent.change(ngoi, { target: { value: v } });
    fireEvent.compositionEnd(ngoi);
    expect(o().value).toBe('giáy');
    await choMs(400);
    await act(async () => {
      congCho('g').mo();
      congCho('giáy').mo();
    });
    await waitFor(() => expect(diaChi()).toBe(`?q=${encodeURIComponent('giáy')}`));
    expect(o().value).toBe('giáy');
  });
});
