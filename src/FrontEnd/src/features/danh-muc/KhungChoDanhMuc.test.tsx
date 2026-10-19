import { act, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { useCoKhungCho } from '../../core/components/Skeleton';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import khungNhac from '../thu-tuc/KhungNhacKiosk.module.css';
import { napNgonNguThuTuc } from '../thu-tuc/i18n';
import { dungTrongRouter } from '../thu-tuc/thuTucMau';
import styles from './DanhMuc.module.css';
import { napNgonNguDanhMuc } from './i18n';
import { KhungChoDanhMuc } from './KhungChoDanhMuc';

beforeAll(async () => {
  await Promise.all([napNgonNguDanhMuc(), napNgonNguThuTuc()]);
});

function CoKhungCho() {
  return <span data-testid="co-khung-cho">{String(useCoKhungCho())}</span>;
}

describe('KhungChoDanhMuc (K1)', () => {
  it('có đủ các khối của trang thật: ba ô thống kê, hai tab, thanh lọc, dòng số kết quả, danh sách chờ', () => {
    const { container } = dungTrongRouter(<KhungChoDanhMuc />, { diaChi: '/thu-tuc' });
    expect(container.querySelectorAll('[role="list"] > li')).toHaveLength(3);
    expect(container.querySelectorAll('[role="tab"]')).toHaveLength(2);
    expect(container.querySelector('input')).not.toBeNull(); // ô tìm
    expect(container.querySelectorAll('select, [role="combobox"]').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector(`.${styles.bang!} > .${styles.soKetQua!}`)).not.toBeNull();
    expect(container.querySelector(`.${styles.bang!} [aria-busy="true"]`)).not.toBeNull();
  });

  it('ba con số chưa có dữ liệu được che bằng khối xám (chữ trong suốt), không hiện "0" sai', () => {
    const { container } = dungTrongRouter(<KhungChoDanhMuc />, { diaChi: '/thu-tuc' });
    expect(container.querySelector(`.${styles.thongKeKhungCho!}`)).not.toBeNull();
    expect(container.querySelectorAll(`.${styles.thongKeKhungCho!} strong`)).toHaveLength(3);
  });

  it('tab theo `cap` trên địa chỉ; thiếu hoặc sai thì cấp xã', () => {
    const tabChon = (diaChi: string) => {
      const { container, unmount } = dungTrongRouter(<KhungChoDanhMuc />, { diaChi });
      const chon = container.querySelector('[role="tab"][aria-selected="true"]')?.textContent;
      unmount();
      return chon;
    };
    expect(tabChon('/thu-tuc?cap=tinh')).toBe('Thủ tục cấp tỉnh');
    expect(tabChon('/thu-tuc?cap=xa')).toBe('Thủ tục cấp xã');
    expect(tabChon('/thu-tuc?cap=la')).toBe('Thủ tục cấp xã');
  });

  it('chỉ "Đang tải…" cho trình đọc màn hình; mọi điều khiển nằm trong vùng ẩn và inert', () => {
    const { container } = dungTrongRouter(<KhungChoDanhMuc />, { diaChi: '/thu-tuc' });
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    for (const dk of container.querySelectorAll('button, a, input, select, [role="tab"]')) {
      expect(dk.closest('[inert]')).not.toBeNull();
    }
  });

  it('ẩn chân trang trong lúc hiện (qua Skeleton), thôi khi gỡ', () => {
    const { unmount } = dungTrongRouter(
      <>
        <CoKhungCho />
        <KhungChoDanhMuc />
      </>,
    );
    expect(screen.getByTestId('co-khung-cho')).toHaveTextContent('true');
    act(() => unmount());
    render(<CoKhungCho />);
    expect(screen.getByTestId('co-khung-cho')).toHaveTextContent('false');
  });

  it('kiosk: giữ sẵn chỗ một dòng nhắc đăng xuất phía trên danh sách như danh sách thật; ngoài kiosk thì không', () => {
    const ngoai = dungTrongRouter(<KhungChoDanhMuc />, { diaChi: '/thu-tuc' });
    expect(ngoai.container.querySelector(`.${khungNhac.giuCho!}`)).toBeNull();
    ngoai.unmount();
    datCheDoKiosk(true);
    const { container } = dungTrongRouter(<KhungChoDanhMuc />, { diaChi: '/thu-tuc' });
    const giuCho = container.querySelector(`.${khungNhac.giuCho!}`);
    expect(giuCho).not.toBeNull();
    expect(giuCho!.nextElementSibling).toHaveAttribute('aria-busy', 'true');
  });
});
