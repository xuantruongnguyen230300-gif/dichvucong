import { act, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import { giaFetchDanhMuc } from '../../test-utils/danhMucMau';
import { datKhoMan } from '../../test-utils/khoMan';
import { napNgonNguThuTuc } from './i18n';
import { KhoiThuongGap } from './KhoiThuongGap';
import khungNhac from './KhungNhacKiosk.module.css';
import { dungTrongRouter } from './thuTucMau';
import { taoBo43 } from './thuongGapMau';

beforeAll(napNgonNguThuTuc);
afterEach(() => vi.unstubAllGlobals());

async function dungDangTai() {
  datKhoMan(768);
  const fetchGia = giaFetchDanhMuc('treo');
  let ket!: ReturnType<typeof dungTrongRouter>;
  await act(async () => {
    ket = dungTrongRouter(<KhoiThuongGap />);
  });
  return { ...ket, fetchGia };
}

describe('KhoiThuongGap, nhánh đang tải (K1)', () => {
  it('có tiêu đề ngay và thanh công cụ giữ chỗ cao như thật (ô tìm, nút chuyển dạng, hàng chip), chỉ "Đang tải…" cho trình đọc màn hình', async () => {
    const { container } = await dungDangTai();
    expect(screen.getByRole('heading', { level: 2, name: 'Thủ tục thường gặp' })).toBeInTheDocument();
    expect(screen.getAllByText('Đang tải…')).toHaveLength(1);
    expect(screen.queryByRole('searchbox')).toBeNull(); // thanh công cụ giữ chỗ ẩn khỏi trình đọc màn hình
    expect(screen.queryByRole('button')).toBeNull();
    const dieuKhien = container.querySelectorAll('button, input, a');
    expect(dieuKhien.length).toBeGreaterThan(0);
    for (const dk of dieuKhien) expect(dk.closest('[inert]')).not.toBeNull();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull(); // danh sách chờ
  });

  it('dữ liệu về thì thanh công cụ thật thay vào, không còn khung chờ', async () => {
    const { fetchGia, container } = await dungDangTai();
    await act(async () => fetchGia.traLoi(taoBo43()));
    expect(await screen.findByRole('searchbox', { name: /Tìm/ })).toBeInTheDocument();
    expect(container.querySelector('[inert]')).toBeNull();
    expect(screen.queryByText('Đang tải…')).toBeNull();
  });

  it('kiosk: giữ sẵn chỗ dòng nhắc đăng xuất phía trên danh sách chờ; ngoài kiosk không có', async () => {
    const ngoai = await dungDangTai();
    expect(ngoai.container.querySelector(`.${khungNhac.giuCho!}`)).toBeNull();
    ngoai.unmount();
    datCheDoKiosk(true);
    const { container } = await dungDangTai();
    const giuCho = container.querySelector(`.${khungNhac.giuCho!}`);
    expect(giuCho).not.toBeNull();
    expect(giuCho!.nextElementSibling).toHaveAttribute('aria-busy', 'true');
  });
});
