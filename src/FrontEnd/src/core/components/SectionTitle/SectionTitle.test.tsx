import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionTitle } from './SectionTitle';
import { VisuallyHidden } from '../VisuallyHidden';

describe('SectionTitle', () => {
  it('render đúng cấp tiêu đề và id', () => {
    render(<SectionTitle cap={2} id="muc">Thường gặp</SectionTitle>);
    const h = screen.getByRole('heading', { level: 2, name: 'Thường gặp' });
    expect(h).toHaveAttribute('id', 'muc');
  });

  it('cấp 3 và phần phụ', () => {
    render(<SectionTitle cap={3} phu="12 thủ tục">Mục</SectionTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(screen.getByText('12 thủ tục')).toBeInTheDocument();
  });
});

describe('VisuallyHidden', () => {
  it('vẫn có trong DOM để trình đọc màn hình đọc', () => {
    render(<VisuallyHidden>chữ ẩn</VisuallyHidden>);
    expect(screen.getByText('chữ ẩn')).toBeInTheDocument();
  });
});
