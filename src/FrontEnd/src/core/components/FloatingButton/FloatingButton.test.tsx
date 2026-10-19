import { render, screen } from '@testing-library/react';
import { MessageSquare } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { FloatingButton } from './FloatingButton';
import styles from './FloatingButton.module.css';

describe('FloatingButton', () => {
  it('có chữ, aria-expanded, aria-controls', () => {
    render(
      <FloatingButton viTri="phai" bieuTuong={<MessageSquare />} dangMo dieuKhien="khung-tro-ly">
        Trợ lý
      </FloatingButton>,
    );
    const nut = screen.getByRole('button', { name: 'Trợ lý' });
    expect(nut).toHaveAttribute('aria-expanded', 'true');
    expect(nut).toHaveAttribute('aria-controls', 'khung-tro-ly');
  });

  it('không khai dangMo thì không có aria-expanded', () => {
    render(
      <FloatingButton viTri="trai" bieuTuong={<MessageSquare />}>
        Bắt đầu lại
      </FloatingButton>,
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-expanded');
  });

  it('vị trí trái/phải và lớp theo trenPopup', () => {
    const { rerender } = render(
      <FloatingButton viTri="phai" bieuTuong={<MessageSquare />}>
        A
      </FloatingButton>,
    );
    let nut = screen.getByRole('button');
    expect(nut).toHaveClass(styles.phai!);
    expect(nut).not.toHaveClass(styles.trenPopup!);
    rerender(
      <FloatingButton viTri="trai" trenPopup bieuTuong={<MessageSquare />}>
        A
      </FloatingButton>,
    );
    nut = screen.getByRole('button');
    expect(nut).toHaveClass(styles.trai!);
    expect(nut).toHaveClass(styles.trenPopup!);
  });
});
