import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';
import styles from './Badge.module.css';

describe('Badge', () => {
  it('có chữ, không focus được, không có vai trò', () => {
    render(<Badge loai="success">Toàn trình</Badge>);
    const nhan = screen.getByText('Toàn trình').parentElement!;
    expect(nhan).not.toHaveAttribute('tabindex');
    expect(nhan).not.toHaveAttribute('role');
    expect(nhan.tagName).toBe('SPAN');
  });

  it('rutGon có class một dòng; mặc định thì không', () => {
    const { rerender } = render(<Badge loai="info">Một nhãn lĩnh vực rất dài</Badge>);
    expect(screen.getByText('Một nhãn lĩnh vực rất dài')).not.toHaveClass(styles.chuRutGon!);
    rerender(
      <Badge loai="info" rutGon>
        Một nhãn lĩnh vực rất dài
      </Badge>,
    );
    expect(screen.getByText('Một nhãn lĩnh vực rất dài')).toHaveClass(styles.chuRutGon!);
  });

  it('nhãn rỗng không render', () => {
    const { container, rerender } = render(<Badge loai="neutral">{''}</Badge>);
    expect(container).toBeEmptyDOMElement();
    rerender(<Badge loai="neutral">{'   '}</Badge>);
    expect(container).toBeEmptyDOMElement();
    rerender(<Badge loai="neutral">{null}</Badge>);
    expect(container).toBeEmptyDOMElement();
  });

  it('biểu tượng đi kèm là trang trí', () => {
    render(
      <Badge loai="warning" bieuTuong={<svg data-testid="bt" />}>
        Một phần
      </Badge>,
    );
    expect(screen.getByTestId('bt').parentElement).toHaveAttribute('aria-hidden', 'true');
  });
});
