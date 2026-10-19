import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RouteObject } from 'react-router';
import type { ThongTinTrungTam } from '../../core/api/trungTam';
import { renderApp, type PhanHoiTrungTam } from '../../test-utils/renderApp';
import { TRUNG_TAM_THU } from '../../test-utils/trungTamMau';
import { AppHeader } from './AppHeader';
import { DUONG_LOGO, SO_TEP_LOGO } from './logo';

afterEach(() => vi.unstubAllGlobals());

const tuyen: RouteObject[] = [{ path: '*', element: <AppHeader /> }];
const dungHeader = (trungTam: PhanHoiTrungTam, duongDan = '/') => renderApp(tuyen, { trungTam, duongDan });
const thuongHieu = () => within(screen.getByRole('banner')).getByRole('link');
const dieuHuong = () => within(screen.getByRole('navigation', { name: 'Điều hướng chính' }));
const voi = (thayDoi: Partial<ThongTinTrungTam>): ThongTinTrungTam => ({ ...TRUNG_TAM_THU, ...thayDoi });

describe('AppHeader — tên và địa bàn (AC-14)', () => {
  it('hiện tên và địa bàn nguyên văn, không ghép thêm chữ', async () => {
    dungHeader(TRUNG_TAM_THU);
    expect(await screen.findByText('Trung tâm thử A')).toBeInTheDocument();
    expect(screen.getByText('phường thử B – tỉnh thử C')).toBeInTheDocument();
    // Cả cụm là một liên kết về trang chủ; tên đọc = tên + địa bàn
    expect(thuongHieu()).toHaveAccessibleName('Trung tâm thử A phường thử B – tỉnh thử C');
    expect(thuongHieu()).toHaveAttribute('href', '/');
  });

  it('thiếu tỉnh: chỉ còn xã, không có dấu ngăn thừa', async () => {
    dungHeader(voi({ tinh: null }));
    expect(await screen.findByText('phường thử B')).toBeInTheDocument();
    expect(screen.queryByText(/–/)).not.toBeInTheDocument();
  });

  it('thiếu xã: chỉ còn tỉnh', async () => {
    dungHeader(voi({ xa: null }));
    expect(await screen.findByText('tỉnh thử C')).toBeInTheDocument();
    expect(screen.queryByText(/–/)).not.toBeInTheDocument();
  });

  it('thiếu cả hai: ẩn dòng địa bàn', async () => {
    dungHeader(voi({ xa: null, tinh: null }));
    await screen.findByText('Trung tâm thử A');
    expect(thuongHieu()).toHaveAccessibleName('Trung tâm thử A');
  });

  it('không tự viết hoa hay thêm chữ "xã", "tỉnh"', async () => {
    dungHeader(voi({ xa: 'Cần Giuộc', tinh: 'Tây Ninh' }));
    expect(await screen.findByText('Cần Giuộc – Tây Ninh')).toBeInTheDocument();
  });
});

describe('AppHeader — đang tải và lỗi', () => {
  it('đang tải: liên kết vẫn có tên "Trang chủ", chưa có tên Trung tâm', () => {
    dungHeader('treo');
    expect(thuongHieu()).toHaveAccessibleName('Trang chủ');
    expect(thuongHieu()).toHaveAttribute('href', '/');
    expect(screen.queryByText('Trung tâm thử A')).not.toBeInTheDocument();
  });

  it.each<PhanHoiTrungTam>(['loi-mang', 'khong-co-du-lieu'])('%s: chỉ còn biểu tượng, liên kết tên "Trang chủ"', async (loi) => {
    const { client } = dungHeader(loi);
    await waitFor(() => expect(client.isFetching()).toBe(0));
    expect(thuongHieu()).toHaveAccessibleName('Trang chủ');
    expect(thuongHieu().textContent).toBe('Trang chủ');
  });
});

describe('AppHeader — biểu tượng (BR-14, AC-21)', () => {
  it('thư mục logo có đúng một file', () => {
    expect(SO_TEP_LOGO).toBe(1);
    expect(DUONG_LOGO).not.toBe('');
  });

  it('biểu tượng là ảnh trang trí, khai kích thước', () => {
    const { container } = dungHeader('treo');
    const anh = container.querySelector('img');
    expect(anh).not.toBeNull();
    expect(anh).toHaveAttribute('alt', '');
    expect(anh).toHaveAttribute('width', '40');
    expect(anh).toHaveAttribute('height', '40');
  });
});

describe('AppHeader — điều hướng chính (AC-1, AC-3)', () => {
  it('có đúng 3 mục, tên đọc là nhãn đầy đủ', () => {
    dungHeader('treo');
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    const ten = Array.from(nav.querySelectorAll('a')).map((a) => a.textContent);
    expect(ten).toHaveLength(3);
    expect(dieuHuong().getByRole('link', { name: 'Trang chủ' })).toBeInTheDocument();
    expect(dieuHuong().getByRole('link', { name: 'Danh mục thủ tục' })).toBeInTheDocument();
    expect(dieuHuong().getByRole('link', { name: 'Lĩnh vực và mã QR' })).toBeInTheDocument();
  });

  it('nhãn ngắn chỉ để nhìn (aria-hidden), nằm trong nhãn đầy đủ', () => {
    dungHeader('treo');
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    const ngan = Array.from(nav.querySelectorAll('[aria-hidden="true"]'))
      .map((e) => e.textContent)
      .filter((x): x is string => !!x);
    expect(ngan).toEqual(['Danh mục', 'Lĩnh vực']);
    expect('Danh mục thủ tục').toContain('Danh mục');
    expect('Lĩnh vực và mã QR').toContain('Lĩnh vực');
  });

  it('mục đang xem có aria-current="page", các mục khác không', () => {
    dungHeader('treo', '/thu-tuc');
    expect(dieuHuong().getByRole('link', { name: 'Danh mục thủ tục' })).toHaveAttribute('aria-current', 'page');
    expect(dieuHuong().getByRole('link', { name: 'Trang chủ' })).not.toHaveAttribute('aria-current');
    expect(dieuHuong().getByRole('link', { name: 'Lĩnh vực và mã QR' })).not.toHaveAttribute('aria-current');
  });

  it('trang chủ: chỉ mục Trang chủ được đánh dấu', () => {
    dungHeader('treo', '/');
    expect(dieuHuong().getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('aria-current', 'page');
    expect(dieuHuong().getByRole('link', { name: 'Danh mục thủ tục' })).not.toHaveAttribute('aria-current');
  });

  it('bấm mục điều hướng và bấm tên Trung tâm đều đổi địa chỉ', async () => {
    const user = userEvent.setup();
    const { router } = dungHeader(TRUNG_TAM_THU, '/linh-vuc');
    await screen.findByText('Trung tâm thử A');
    await user.click(thuongHieu());
    expect(router.state.location.pathname).toBe('/');
    await user.click(dieuHuong().getByRole('link', { name: 'Danh mục thủ tục' }));
    expect(router.state.location.pathname).toBe('/thu-tuc');
  });
});

describe('AppHeader — chiều cao ổn định với tên dài (CLS)', () => {
  const TEN_DAI = 'Trung tâm Phục vụ Hành chính công '.repeat(6).trim();
  const XA_DAI = 'xã thử rất dài '.repeat(6).trim();

  it('tên và địa bàn dài: đủ chữ trong DOM, có title chữ đầy đủ (line-clamp chỉ cắt khi hiển thị)', async () => {
    dungHeader(voi({ ten: TEN_DAI, xa: XA_DAI, tinh: 'tỉnh thử C' }));
    const ten = await screen.findByText(TEN_DAI);
    expect(ten).toHaveAttribute('title', TEN_DAI);
    expect(ten.textContent).toBe(TEN_DAI);
    const diaBan = `${XA_DAI} – tỉnh thử C`;
    expect(screen.getByText(diaBan)).toHaveAttribute('title', diaBan);
    expect(thuongHieu()).toHaveAccessibleName(`${TEN_DAI} ${diaBan}`);
  });
});
