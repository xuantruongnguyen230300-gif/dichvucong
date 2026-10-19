import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Chip, ChipGroup } from './Chip';

const LUA_CHON = [
  { giaTri: 'tat-ca', nhan: 'Tất cả' },
  { giaTri: 'dat-dai', nhan: 'Đất đai' },
  { giaTri: 'ho-tich', nhan: 'Hộ tịch' },
] as const;

function Nhom() {
  const [v, setV] = useState<string>('tat-ca');
  return <ChipGroup nhan="Lĩnh vực" luaChon={LUA_CHON} giaTri={v} onDoi={setV} />;
}

describe('ChipGroup', () => {
  it('nhóm có role group và aria-label', () => {
    render(<Nhom />);
    expect(screen.getByRole('group', { name: 'Lĩnh vực' })).toBeInTheDocument();
  });

  it('chọn chip mới → chip cũ aria-pressed=false; chip đang chọn có icon ✓ (AC-10)', async () => {
    render(<Nhom />);
    const datDai = screen.getByRole('button', { name: 'Đất đai' });
    expect(datDai).toHaveAttribute('aria-pressed', 'false');
    expect(datDai.querySelector('svg')).toBeNull();
    await userEvent.setup().click(datDai);
    expect(datDai).toHaveAttribute('aria-pressed', 'true');
    expect(datDai.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Tất cả' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
  });

  it('Tab tới được từng chip', async () => {
    const user = userEvent.setup();
    render(<Nhom />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Tất cả' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Đất đai' })).toHaveFocus();
  });

  it('nút cuộn có tabIndex=-1 và aria-hidden khi còn phần bị khuất', () => {
    const quanSat: ResizeObserverCallback[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: ResizeObserverCallback) {
          quanSat.push(cb);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    try {
      render(<Nhom />);
      expect(screen.queryByLabelText('Cuộn sang phải')).toBeNull();
      const hang = screen.getByRole('group', { name: 'Lĩnh vực' });
      Object.defineProperty(hang, 'clientWidth', { configurable: true, value: 100 });
      Object.defineProperty(hang, 'scrollWidth', { configurable: true, value: 300 });
      act(() => quanSat.forEach((cb) => cb([], {} as ResizeObserver)));
      const phai = screen.getByLabelText('Cuộn sang phải');
      expect(phai).toHaveAttribute('tabindex', '-1');
      expect(phai).toHaveAttribute('aria-hidden', 'true');
      expect(screen.queryByLabelText('Cuộn sang trái')).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('Chip', () => {
  it('chip lẻ (không daChon) không có aria-pressed', () => {
    render(<Chip>Đăng ký khai sinh cần giấy tờ gì?</Chip>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
  });
});
