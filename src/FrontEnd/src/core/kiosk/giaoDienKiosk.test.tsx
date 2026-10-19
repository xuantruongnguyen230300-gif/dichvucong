import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Modal } from '../components/Modal';
import { thaoTacTrinhDuyet } from './batDauLai';
import { LopKiosk, NhacDangXuatNoiDung } from './giaoDienKiosk';
import { napNgonNguKiosk } from './i18n';

const TEN_NUT = 'Bắt đầu lại';

beforeAll(async () => {
  await napNgonNguKiosk();
});

beforeEach(() => {
  vi.spyOn(thaoTacTrinhDuyet, 'diToi').mockImplementation(() => undefined);
  vi.stubGlobal('speechSynthesis', { cancel: vi.fn() });
});
afterEach(() => {
  document.body.hidden = false;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Khung giả: một ô nhập và một nút trong `#root`, cộng popup mở bằng nút. */
function Khung({ coPopup = false }: { coPopup?: boolean }) {
  const [mo, setMo] = useState(false);
  return (
    <>
      <div id="root">
        <button onClick={() => setMo(true)}>Mở popup</button>
        <input aria-label="Ô tìm" />
        <a href="/chan-trang">Chân trang</a>
        {coPopup && (
          <Modal mo={mo} onDong={() => setMo(false)} tieuDe="Đăng ký khai sinh" chanPopup={<button>Xem và nộp</button>}>
            <button>Một</button>
          </Modal>
        )}
      </div>
      <LopKiosk />
    </>
  );
}

const nutBatDauLai = () => screen.getByRole('button', { name: TEN_NUT });

describe('LopKiosk — nút "Bắt đầu lại" (F09 BR-7)', () => {
  it('đúng một nút, là con trực tiếp của <body>, mang data-ngoai-popup, cao tối thiểu 48px', () => {
    render(<Khung />);
    expect(screen.getAllByRole('button', { name: TEN_NUT })).toHaveLength(1);
    const nut = nutBatDauLai();
    expect(nut.parentElement).toBe(document.body);
    expect(nut).toHaveAttribute('data-ngoai-popup');
    expect(nut.className).toContain('nutBatDauLai');
  });

  it('bấm → batDauLai: đi tới /?kiosk=1 và dừng đọc', async () => {
    const user = userEvent.setup();
    render(<Khung />);
    await user.click(nutBatDauLai());
    expect(thaoTacTrinhDuyet.diToi).toHaveBeenCalledExactlyOnceWith('/?kiosk=1');
    expect(window.speechSynthesis.cancel).toHaveBeenCalledOnce();
  });

  it('không popup: nút là phần tử Tab được cuối cùng của tài liệu, sau mọi phần tử của khung', async () => {
    const user = userEvent.setup();
    render(<Khung />);
    const thuTu: string[] = [];
    for (let i = 0; i < 4; i++) {
      await user.tab();
      thuTu.push(document.activeElement?.textContent || document.activeElement?.getAttribute('aria-label') || '');
    }
    expect(thuTu).toEqual(['Mở popup', 'Ô tìm', 'Chân trang', TEN_NUT]);
  });

  describe('popup mở', () => {
    async function moPopup() {
      const user = userEvent.setup();
      render(<Khung coPopup />);
      await user.click(screen.getByRole('button', { name: 'Mở popup' }));
      return user;
    }

    it('nút không bị inert; phần còn lại của body thì có', async () => {
      await moPopup();
      expect(nutBatDauLai().closest('[inert]')).toBeNull();
      expect(document.getElementById('root')?.closest('[inert]')).not.toBeNull();
    });

    it('Tab và Shift+Tab đi vòng qua nút, nút là phần tử cuối vòng (C01 AC-24)', async () => {
      const user = await moPopup();
      const hop = screen.getByRole('dialog');
      // vòng: các phần tử trong popup, rồi nút "Bắt đầu lại", rồi quay lại đầu
      const ten = () => document.activeElement?.textContent ?? '';
      expect(hop).toHaveFocus();
      const thuTu: string[] = [];
      for (let i = 0; i < 5; i++) {
        await user.tab();
        thuTu.push(ten());
      }
      const viTriNut = thuTu.indexOf(TEN_NUT);
      expect(viTriNut).toBeGreaterThan(0);
      expect(thuTu[viTriNut + 1]).toBe(thuTu[0]); // sau nút quay về đầu vòng
      await user.tab({ shift: true });
      expect(ten()).toBe(TEN_NUT); // lùi từ đầu vòng → nút
    });

    it('Esc chỉ đóng popup, không bấm nút; bấm nút khi popup mở → batDauLai', async () => {
      const user = await moPopup();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(thaoTacTrinhDuyet.diToi).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Mở popup' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await user.click(nutBatDauLai());
      expect(thaoTacTrinhDuyet.diToi).toHaveBeenCalledExactlyOnceWith('/?kiosk=1');
    });
  });

  it('không có bộ đếm giờ: để qua 15 phút không gọi diToi, DOM không đổi (AC-2, BR-2)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval'] });
    const { container } = render(<Khung />);
    const truoc = document.body.innerHTML;
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15 * 60 * 1000);
    });
    expect(thaoTacTrinhDuyet.diToi).not.toHaveBeenCalled();
    expect(document.body.innerHTML).toBe(truoc);
    expect(container.isConnected).toBe(true);
  });
});

describe('NhacDangXuatNoiDung', () => {
  it('có cacLienKet mà không đích Cổng DVC → null; có → một dòng', () => {
    const { container, rerender } = render(<NhacDangXuatNoiDung cacLienKet={['https://cangiuoc.tayninh.gov.vn']} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<NhacDangXuatNoiDung cacLienKet={['https://dichvucong.gov.vn']} />);
    expect(screen.getAllByText('Nhớ đăng xuất khi dùng xong')).toHaveLength(1);
  });
});
