import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RanhGioiKhung } from './RanhGioiKhung';

function Hong(): never {
  throw new Error('Thông điệp nội bộ');
}

describe('RanhGioiKhung', () => {
  it('con không lỗi thì hiện bình thường', () => {
    render(
      <RanhGioiKhung fallback={<p>dự phòng</p>}>
        <p>nội dung</p>
      </RanhGioiKhung>,
    );
    expect(screen.getByText('nội dung')).toBeInTheDocument();
  });

  it('con lỗi thì hiện dự phòng, không lộ thông điệp, phần anh em vẫn nguyên', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <>
        <RanhGioiKhung fallback={<p>dự phòng</p>}>
          <Hong />
        </RanhGioiKhung>
        <p>anh em</p>
      </>,
    );
    expect(screen.getByText('dự phòng')).toBeInTheDocument();
    expect(screen.getByText('anh em')).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('Thông điệp nội bộ');
  });

  it('không có dự phòng thì không hiện gì', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = render(
      <RanhGioiKhung>
        <Hong />
      </RanhGioiKhung>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
