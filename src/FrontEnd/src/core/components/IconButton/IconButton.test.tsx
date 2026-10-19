import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { X } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('tên đọc lấy từ nhan, icon có aria-hidden', () => {
    render(<IconButton nhan="Đóng" bieuTuong={<X size={16} />} />);
    const nut = screen.getByRole('button', { name: 'Đóng' });
    expect(nut).toHaveAttribute('aria-label', 'Đóng');
    expect(nut.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('thiếu nhan là lỗi tsc', () => {
    // @ts-expect-error nhan là bắt buộc
    const thieu = <IconButton bieuTuong={<X />} />;
    expect(thieu).toBeTruthy();
  });

  it('bấm được và dangBat → aria-pressed', async () => {
    const khiBam = vi.fn();
    render(<IconButton nhan="Đọc to" bieuTuong={<X />} dangBat onClick={khiBam} />);
    const nut = screen.getByRole('button', { name: 'Đọc to', pressed: true });
    await userEvent.setup().click(nut);
    expect(khiBam).toHaveBeenCalledTimes(1);
  });
});
