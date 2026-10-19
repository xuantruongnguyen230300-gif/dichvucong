import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

function Thu({ nutNgoai = false, onDong }: { nutNgoai?: boolean; onDong?: () => void }) {
  const [mo, setMo] = useState(false);
  return (
    <div>
      <button onClick={() => setMo(true)}>Mở popup</button>
      <Modal
        mo={mo}
        onDong={() => {
          onDong?.();
          setMo(false);
        }}
        tieuDe="Đăng ký khai sinh"
        phanTrenTieuDe={<span>Hộ tịch</span>}
        chanPopup={<button>Xem và nộp</button>}
      >
        <p>Nội dung</p>
        <button>Một</button>
        <input aria-label="Ô nhập" />
      </Modal>
      {nutNgoai && createPortal(<button data-ngoai-popup="">Bắt đầu lại</button>, document.body)}
    </div>
  );
}

async function moPopup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Mở popup' }));
  return screen.getByRole('dialog');
}

/** jsdom không tính bố cục: giả kích thước thân popup để thử nhánh "nội dung tràn". */
function giaLapThanTran(tran: boolean) {
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(tran ? 900 : 100);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300);
}

describe('Modal', () => {
  afterEach(() => vi.restoreAllMocks());

  it('đóng thì không render gì', () => {
    render(<Thu />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('mở → con trỏ trong popup; role dialog, aria-modal, aria-labelledby trỏ đúng tiêu đề', async () => {
    const user = userEvent.setup();
    render(<Thu />);
    const hop = await moPopup(user);
    expect(hop).toHaveAttribute('aria-modal', 'true');
    expect(hop).toContainElement(document.activeElement as HTMLElement);
    expect(hop).toHaveFocus();
    expect(screen.getByRole('dialog', { name: 'Đăng ký khai sinh' })).toBe(hop);
    expect(screen.getByRole('heading', { level: 2, name: 'Đăng ký khai sinh' })).toBeInTheDocument();
  });

  it('vòng Tab đi vòng trong popup; Shift+Tab từ phần tử đầu → phần tử cuối (AC-15)', async () => {
    const user = userEvent.setup();
    render(<Thu />);
    const hop = await moPopup(user);
    const dong = screen.getByRole('button', { name: 'Đóng' });
    const mot = screen.getByRole('button', { name: 'Một' });
    const o = screen.getByRole('textbox', { name: 'Ô nhập' });
    const nop = screen.getByRole('button', { name: 'Xem và nộp' });
    await user.tab();
    expect(dong).toHaveFocus();
    await user.tab();
    expect(mot).toHaveFocus();
    await user.tab();
    expect(o).toHaveFocus();
    await user.tab();
    expect(nop).toHaveFocus();
    await user.tab();
    expect(dong).toHaveFocus(); // vòng lại, không ra trang phía sau
    await user.tab({ shift: true });
    expect(nop).toHaveFocus();
    expect(hop).toContainElement(nop);
  });

  it('thân không tràn → không nhận con trỏ, vòng Tab không đổi', async () => {
    giaLapThanTran(false);
    const user = userEvent.setup();
    render(<Thu />);
    await moPopup(user);
    expect(screen.queryByRole('region')).toBeNull();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Một' })).toHaveFocus();
  });

  it('thân tràn → nhận con trỏ (tabindex 0, region có tên là tiêu đề), đứng giữa nút ✕ và nội dung; vòng Tab vẫn kín', async () => {
    giaLapThanTran(true);
    const user = userEvent.setup();
    render(<Thu nutNgoai />);
    const hop = await moPopup(user);
    const than = screen.getByRole('region', { name: 'Đăng ký khai sinh' });
    expect(than).toHaveAttribute('tabindex', '0');
    expect(hop).toContainElement(than);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Đóng' })).toHaveFocus();
    await user.tab();
    expect(than).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Một' })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Xem và nộp' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Bắt đầu lại' })).toHaveFocus(); // vẫn cuối vòng
    await user.tab();
    expect(screen.getByRole('button', { name: 'Đóng' })).toHaveFocus();
  });

  it('có nút [data-ngoai-popup] là con của body → là phần tử cuối vòng Tab (AC-24)', async () => {
    const user = userEvent.setup();
    render(<Thu nutNgoai />);
    await moPopup(user);
    const dong = screen.getByRole('button', { name: 'Đóng' });
    const nop = screen.getByRole('button', { name: 'Xem và nộp' });
    const ngoai = screen.getByRole('button', { name: 'Bắt đầu lại' });
    expect(ngoai.parentElement).toBe(document.body);
    await user.tab();
    expect(dong).toHaveFocus();
    await user.tab({ shift: true });
    expect(ngoai).toHaveFocus(); // Shift+Tab từ phần tử đầu → nút ngoài
    await user.tab();
    expect(dong).toHaveFocus(); // Tab từ nút ngoài → phần tử đầu
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(nop).toHaveFocus();
    await user.tab();
    expect(ngoai).toHaveFocus(); // nút ngoài đứng sau phần tử cuối của popup
  });

  it('nút ngoài bị ẩn (display none) thì không vào vòng Tab', async () => {
    const user = userEvent.setup();
    render(<Thu nutNgoai />);
    await moPopup(user);
    screen.getByRole('button', { name: 'Bắt đầu lại' }).hidden = true;
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Xem và nộp' })).toHaveFocus();
  });

  it('Esc → onDong, trả con trỏ về nút đã mở (AC-15)', async () => {
    const onDong = vi.fn();
    const user = userEvent.setup();
    render(<Thu onDong={onDong} />);
    const nutMo = screen.getByRole('button', { name: 'Mở popup' });
    await user.click(nutMo);
    await user.keyboard('{Escape}');
    expect(onDong).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(nutMo).toHaveFocus();
  });

  it('nút ✕ đóng popup', async () => {
    const onDong = vi.fn();
    const user = userEvent.setup();
    render(<Thu onDong={onDong} />);
    await moPopup(user);
    await user.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onDong).toHaveBeenCalledTimes(1);
  });

  it('bấm vùng tối → onDong; bấm trong popup → không; kéo chọn chữ từ trong ra ngoài → không', async () => {
    const onDong = vi.fn();
    const user = userEvent.setup();
    render(<Thu onDong={onDong} />);
    const hop = await moPopup(user);
    const vungToi = hop.parentElement!;
    await user.click(screen.getByText('Nội dung'));
    expect(onDong).not.toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByText('Nội dung'));
    fireEvent.click(vungToi);
    expect(onDong).not.toHaveBeenCalled();
    await user.click(vungToi);
    expect(onDong).toHaveBeenCalledTimes(1);
  });

  it('hai popup lồng nhau → Esc chỉ đóng popup trên cùng', async () => {
    const dongNgoai = vi.fn();
    const dongTrong = vi.fn();
    function Long() {
      const [a, setA] = useState(true);
      const [b, setB] = useState(false);
      return (
        <>
          <Modal mo={a} onDong={() => { dongNgoai(); setA(false); }} tieuDe="Ngoài">
            <button onClick={() => setB(true)}>Mở popup trong</button>
          </Modal>
          <Modal mo={b} onDong={() => { dongTrong(); setB(false); }} tieuDe="Trong">
            <p>Popup trong</p>
          </Modal>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Long />);
    await user.click(screen.getByRole('button', { name: 'Mở popup trong' }));
    expect(screen.getAllByRole('dialog', { hidden: true })).toHaveLength(2);
    await user.keyboard('{Escape}');
    expect(dongTrong).toHaveBeenCalledTimes(1);
    expect(dongNgoai).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Ngoài' })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('khoa-cuon'); // popup ngoài vẫn mở
    expect(screen.getByRole('button', { name: 'Mở popup trong' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(dongNgoai).toHaveBeenCalledTimes(1);
    expect(document.documentElement).not.toHaveClass('khoa-cuon');
  });

  it('mở: <html> có khoa-cuon, con khác của body inert, [data-ngoai-popup] thì không; đóng → gỡ hết', async () => {
    const user = userEvent.setup();
    const { container } = render(<Thu nutNgoai />);
    const ngoai = screen.getByRole('button', { name: 'Bắt đầu lại' });
    expect(document.documentElement).not.toHaveClass('khoa-cuon');
    const hop = await moPopup(user);
    expect(document.documentElement).toHaveClass('khoa-cuon');
    expect(container).toHaveAttribute('inert');
    expect(ngoai).not.toHaveAttribute('inert');
    expect(hop.parentElement).not.toHaveAttribute('inert');
    await user.keyboard('{Escape}');
    expect(document.documentElement).not.toHaveClass('khoa-cuon');
    expect(container).not.toHaveAttribute('inert');
  });

  it('không có nút ngoài → vòng chỉ gồm phần tử trong popup', async () => {
    const user = userEvent.setup();
    render(<Thu />);
    await moPopup(user);
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Xem và nộp' })).toHaveFocus();
  });
});
