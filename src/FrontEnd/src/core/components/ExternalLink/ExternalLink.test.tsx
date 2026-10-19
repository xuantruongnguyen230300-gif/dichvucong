import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExternalLink } from './ExternalLink';

describe('ExternalLink', () => {
  it('web: mở tab mới, rel đúng, tên đọc có "(mở trang mới)", icon aria-hidden', () => {
    render(<ExternalLink href="https://dichvucong.gov.vn/p/home">Mở Cổng Dịch vụ công Quốc gia</ExternalLink>);
    const lienKet = screen.getByRole('link', { name: /Mở Cổng Dịch vụ công Quốc gia \(mở trang mới\)/ });
    expect(lienKet).toHaveAttribute('target', '_blank');
    expect(lienKet.getAttribute('rel')).toBe('noopener noreferrer');
    expect(lienKet.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('tel: và mailto: không có target, không có chữ ẩn', () => {
    render(
      <>
        <ExternalLink href="tel:02723893900">Gọi</ExternalLink>
        <ExternalLink href="mailto:a@b.vn">Thư</ExternalLink>
      </>,
    );
    for (const ten of ['Gọi', 'Thư']) {
      const lienKet = screen.getByRole('link', { name: ten });
      expect(lienKet).not.toHaveAttribute('target');
      expect(lienKet.querySelector('svg')).toBeNull();
    }
    expect(screen.getByRole('link', { name: 'Gọi' })).toHaveAttribute('href', 'tel:02723893900');
  });

  it.each(['javascript:alert(1)', 'data:text/html,x', '/noi-bo', null, undefined])(
    '%s → không có <a>, chỉ còn chữ thường (AC-6)',
    (href) => {
      render(<ExternalLink href={href}>Xem và nộp</ExternalLink>);
      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.getByText('Xem và nộp')).toBeInTheDocument();
    },
  );

  it('ref chuyển xuống <a>', () => {
    let phanTu: HTMLAnchorElement | null = null;
    render(
      <ExternalLink href="https://example.vn" ref={(e) => void (phanTu = e)}>
        A
      </ExternalLink>,
    );
    expect(phanTu).toBe(screen.getByRole('link'));
  });
});
