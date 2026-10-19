import { act, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { useCoKhungCho } from '../../core/components/Skeleton';
import { napNgonNguLinhVuc } from './i18n';
import { KhungChoLinhVuc } from './KhungChoLinhVuc';
import trang from './LinhVuc.module.css';
import oStyles from './OLinhVuc.module.css';

beforeAll(napNgonNguLinhVuc);

function CoKhungCho() {
  return <span data-testid="co-khung-cho">{String(useCoKhungCho())}</span>;
}

describe('KhungChoLinhVuc (K1)', () => {
  it('dựng bằng lớp CSS của trang thật: khung tìm, lưới và ô cùng lớp; đủ ô để lấp một màn hình dọc', () => {
    const { container } = render(<KhungChoLinhVuc />);
    expect(container.querySelector(`.${trang.khungTim!}`)).not.toBeNull();
    const luoi = container.querySelector(`.${trang.luoi!}`);
    expect(luoi).not.toBeNull();
    const cacO = luoi!.querySelectorAll(`:scope > li.${oStyles.muc!}`);
    expect(cacO.length).toBeGreaterThanOrEqual(24);
    // mỗi ô có chỗ giữ của mã QR 9 rem và dòng chú thích
    expect(cacO[0]!.querySelector(`.${oStyles.khungQr!}`)).not.toBeNull();
    expect(cacO[0]!.querySelector(`.${oStyles.chuThich!}`)).not.toBeNull();
  });

  it('trình đọc màn hình chỉ nghe "Đang tải…"; phần còn lại ẩn và không tương tác', () => {
    const { container } = render(<KhungChoLinhVuc />);
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải…');
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    // Ô tìm thật nằm trong vùng inert: không nhận con trỏ, không vào vòng Tab
    const oNhap = container.querySelector('input');
    expect(oNhap).not.toBeNull();
    expect(oNhap!.closest('[inert]')).not.toBeNull();
    expect(oNhap!.closest('[aria-hidden="true"]')).not.toBeNull();
    for (const nut of container.querySelectorAll('button, a, input, select')) {
      expect(nut.closest('[inert]')).not.toBeNull();
    }
  });

  it('báo cho Layout ẩn chân trang trong lúc hiện, và thôi khi gỡ', () => {
    const { unmount } = render(
      <>
        <CoKhungCho />
        <KhungChoLinhVuc />
      </>,
    );
    expect(screen.getByTestId('co-khung-cho')).toHaveTextContent('true');
    act(() => unmount());
    render(<CoKhungCho />);
    expect(screen.getByTestId('co-khung-cho')).toHaveTextContent('false');
  });
});
