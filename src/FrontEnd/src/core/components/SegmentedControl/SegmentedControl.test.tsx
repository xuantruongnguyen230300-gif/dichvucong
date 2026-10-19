import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import styles from './SegmentedControl.module.css';
import { ViewToggle } from './SegmentedControl';

describe('ViewToggle', () => {
  it('hai nút aria-pressed; lựa chọn đang dùng có ✓', () => {
    render(<ViewToggle giaTri="the" onDoi={() => undefined} />);
    expect(screen.getByRole('group', { name: 'Cách hiển thị' })).toBeInTheDocument();
    const the = screen.getByRole('button', { name: 'Dạng thẻ' });
    const bang = screen.getByRole('button', { name: 'Dạng bảng' });
    expect(the).toHaveAttribute('aria-pressed', 'true');
    expect(bang).toHaveAttribute('aria-pressed', 'false');
    // ✓ là icon Check thay cho icon thường: mỗi nút đúng 1 icon, icon của nút đang dùng là Check
    expect(the.querySelector('svg')).toHaveClass('lucide-check');
    expect(bang.querySelector('svg')).not.toHaveClass('lucide-check');
  });

  it('bấm nút còn lại gọi onDoi', async () => {
    const onDoi = vi.fn();
    render(<ViewToggle giaTri="the" onDoi={onDoi} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dạng bảng' }));
    expect(onDoi).toHaveBeenCalledWith('bang');
  });

  it('có class ẩn dưới 600 px', () => {
    render(<ViewToggle giaTri="the" onDoi={() => undefined} />);
    expect(screen.getByRole('group')).toHaveClass(styles.anTrenDienThoai!);
  });
});
