import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDanhSachUrl } from '../../core/hooks/useDanhSachUrl';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import { DiaChiHienTai, dungTrongRouter } from './thuTucMau';
import { useMoThuTuc } from './useMoThuTuc';

function ManHinhThu() {
  const { ma, mo, dong } = useMoThuTuc();
  return (
    <div>
      <p data-testid="ma">{ma === null ? 'null' : `[${ma}]`}</p>
      <button type="button" onClick={() => mo('1.001193')}>
        mở khai sinh
      </button>
      <button type="button" onClick={() => mo('1.000894')}>
        mở kết hôn
      </button>
      <button type="button" onClick={dong}>
        đóng
      </button>
      <DiaChiHienTai />
    </div>
  );
}

/** Ô tìm ghi `q` lên địa chỉ chậm 300 ms (như trang danh mục) cạnh nút mở popup. */
function ManHinhCoOTim() {
  const { mo } = useMoThuTuc();
  const url = useDanhSachUrl({ boLoc: ['lv'] });
  const [, datParams] = useSearchParams();
  return (
    <div>
      <input aria-label="tìm" value={url.tuKhoa} onChange={(e) => url.datTuKhoa(e.target.value)} />
      <button type="button" onClick={() => mo('1.001193')}>
        mở khai sinh
      </button>
      <button
        type="button"
        onClick={() => {
          // Một nơi khác ghi địa chỉ rồi mở popup ngay trong cùng sự kiện: lần vẽ chưa kịp phản ánh địa chỉ mới
          datParams({ lv: 'ho-tich', q: 'moi' }, { replace: true });
          mo('1.001193');
        }}
      >
        ghi rồi mở
      </button>
      <DiaChiHienTai />
    </div>
  );
}

const diaChi = () => screen.getByTestId('dia-chi').textContent;

afterEach(() => {
  vi.useRealTimers();
});

describe('useMoThuTuc', () => {
  it('ma: null khi không có tham số; giá trị thô khi có (kể cả rỗng hay sai định dạng)', () => {
    const { unmount } = dungTrongRouter(<ManHinhThu />, { diaChi: '/' });
    expect(screen.getByTestId('ma')).toHaveTextContent('null');
    unmount();
    const lan2 = dungTrongRouter(<ManHinhThu />, { diaChi: '/?ma=' });
    expect(screen.getByTestId('ma')).toHaveTextContent('[]');
    lan2.unmount();
    dungTrongRouter(<ManHinhThu />, { diaChi: '/?ma=abc%3Cb%3E' });
    expect(screen.getByTestId('ma')).toHaveTextContent('[abc<b>]');
  });

  it('mo thêm ma và giữ nguyên q, lv, trang', async () => {
    const user = userEvent.setup();
    dungTrongRouter(<ManHinhThu />, { diaChi: '/thu-tuc?q=khai+sinh&lv=ho-tich&trang=2' });
    await user.click(screen.getByRole('button', { name: 'mở khai sinh' }));
    const url = new URLSearchParams(diaChi()!.split('?')[1]);
    expect(diaChi()).toMatch(/^\/thu-tuc\?/);
    expect(url.get('ma')).toBe('1.001193');
    expect(url.get('q')).toBe('khai sinh');
    expect(url.get('lv')).toBe('ho-tich');
    expect(url.get('trang')).toBe('2');
    expect(screen.getByTestId('ma')).toHaveTextContent('[1.001193]');
  });

  it('ngoài kiosk: đóng bằng navigate(-1), địa chỉ về như trước (AC-17)', async () => {
    const user = userEvent.setup();
    const { router } = dungTrongRouter(<ManHinhThu />, { diaChi: '/?q=ket+hon&trang=2' });
    await user.click(screen.getByRole('button', { name: 'mở khai sinh' }));
    expect(router.state.historyAction).toBe('PUSH');
    await user.click(screen.getByRole('button', { name: 'đóng' }));
    expect(diaChi()).toBe('/?q=ket+hon&trang=2');
    expect(screen.getByTestId('ma')).toHaveTextContent('null');
  });

  it('mở thẳng bằng địa chỉ có ma rồi đóng: bỏ ma, giữ tham số khác, không rời trang (AC-15, AC-16)', async () => {
    const user = userEvent.setup();
    const { router } = dungTrongRouter(<ManHinhThu />, { diaChi: '/thu-tuc?ma=1.001193&lv=ho-tich' });
    const soMucTruoc = router.state.location.key;
    await user.click(screen.getByRole('button', { name: 'đóng' }));
    expect(diaChi()).toBe('/thu-tuc?lv=ho-tich');
    expect(router.state.historyAction).toBe('REPLACE');
    expect(router.state.location.key).not.toBe(soMucTruoc);
  });

  it('kiosk: mở bằng replace (không thêm mục lịch sử), đóng cũng bằng replace', async () => {
    datCheDoKiosk(true);
    const user = userEvent.setup();
    const { router } = dungTrongRouter(<ManHinhThu />, { diaChi: '/?q=a' });
    await user.click(screen.getByRole('button', { name: 'mở khai sinh' }));
    expect(router.state.historyAction).toBe('REPLACE');
    expect(diaChi()).toBe('/?q=a&ma=1.001193');
    await user.click(screen.getByRole('button', { name: 'đóng' }));
    expect(router.state.historyAction).toBe('REPLACE');
    expect(diaChi()).toBe('/?q=a');
    // Không có mục lịch sử thừa: lùi một bước ở đầu chuỗi không đổi địa chỉ
    await router.navigate(-1);
    expect(diaChi()).toBe('/?q=a');
  });

  it('mở rồi mở thủ tục khác rồi đóng: lùi về thủ tục trước đó (mỗi lần mở là một mục lịch sử)', async () => {
    const user = userEvent.setup();
    dungTrongRouter(<ManHinhThu />, { diaChi: '/' });
    await user.click(screen.getByRole('button', { name: 'mở khai sinh' }));
    await user.click(screen.getByRole('button', { name: 'mở kết hôn' }));
    expect(diaChi()).toBe('/?ma=1.000894');
    await user.click(screen.getByRole('button', { name: 'đóng' }));
    expect(diaChi()).toBe('/?ma=1.001193');
  });

  describe('chạy tranh ghi địa chỉ (R1)', () => {
    it('gõ ô tìm rồi mở popup ngay: popup mở, q (kể cả lần ghi trễ 300 ms) và lv còn nguyên', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      dungTrongRouter(<ManHinhCoOTim />, { diaChi: '/thu-tuc?lv=ho-tich&trang=2' });
      await user.type(screen.getByRole('textbox', { name: 'tìm' }), 'khai sinh');
      await user.click(screen.getByRole('button', { name: 'mở khai sinh' }));
      expect(new URLSearchParams(diaChi()!.split('?')[1]).get('ma')).toBe('1.001193');
      // Lần ghi q trễ 300 ms chạy SAU khi popup đã mở: không được làm mất ma
      await act(() => vi.advanceTimersByTimeAsync(400));
      const url = new URLSearchParams(diaChi()!.split('?')[1]);
      expect(url.get('ma')).toBe('1.001193');
      expect(url.get('q')).toBe('khai sinh');
      expect(url.get('lv')).toBe('ho-tich');
    });

    it('địa chỉ vừa được ghi trong cùng sự kiện (chưa vẽ lại): mo() dựa trên địa chỉ mới nhất, không dùng bản cũ', async () => {
      const user = userEvent.setup();
      dungTrongRouter(<ManHinhCoOTim />, { diaChi: '/thu-tuc?trang=3' });
      await user.click(screen.getByRole('button', { name: 'ghi rồi mở' }));
      const url = new URLSearchParams(diaChi()!.split('?')[1]);
      expect(url.get('ma')).toBe('1.001193');
      expect(url.get('lv')).toBe('ho-tich');
      expect(url.get('q')).toBe('moi');
    });
  });
});
