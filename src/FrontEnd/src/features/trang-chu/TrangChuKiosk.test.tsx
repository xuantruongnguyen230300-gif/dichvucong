import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ThongTinTrungTam } from '../../core/api/trungTam';
import { datLaiCachXemChoTest } from '../../core/hooks/useCachXem';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import { giaFetchDanhMuc } from '../../test-utils/danhMucMau';
import { datKhoMan } from '../../test-utils/khoMan';
import { taoQueryClient } from '../../test-utils/renderApp';
import { TRUNG_TAM_THU } from '../../test-utils/trungTamMau';
import { napNgonNguThuTuc } from '../thu-tuc/i18n';
import { taoBo43 } from '../thu-tuc/thuongGapMau';
import { napNgonNguTrangChu } from './i18n';
import { TrangChu } from './TrangChu';

// Khác TrangChu.test.tsx: ở đây KHÔNG giả khối thường gặp, để đếm dòng nhắc trên cả trang chủ thật (F09 BR-4: đúng hai dòng)
const NHAC = 'Nhớ đăng xuất khi dùng xong';

beforeAll(async () => {
  await Promise.all([napNgonNguTrangChu(), napNgonNguThuTuc()]);
});
afterEach(() => vi.unstubAllGlobals());

const O_DICH_VU: ThongTinTrungTam['oDichVu'] = [
  { ten: 'Bốc số thử', bieuTuong: 'boc-so', url: null },
  { ten: 'Tra cứu hồ sơ thử', bieuTuong: 'tra-cuu-ho-so', url: 'https://dichvucong.gov.vn/p/home/dvc-tra-cuu-ho-so.html' },
  { ten: 'Cổng thông tin xã thử', bieuTuong: 'cong-thong-tin', url: 'https://cangiuoc.tayninh.gov.vn' },
];

/** Dựng trang chủ với danh mục thật (giả `fetch` chung cho /api/thu-tuc, /api/linh-vuc, /api/trung-tam). */
async function dung(oDichVu: ThongTinTrungTam['oDichVu'], rong: number) {
  datKhoMan(rong);
  // Kiosk mặc định thẻ; muốn bảng thì người dùng phải chọn
  if (rong >= 1280) window.localStorage.setItem('cach-xem', 'bang');
  datLaiCachXemChoTest();
  const trungTam: ThongTinTrungTam = { ...TRUNG_TAM_THU, oDichVu };
  giaFetchDanhMuc(taoBo43(), { trungTam });
  const router = createMemoryRouter([{ path: '*', element: <TrangChu /> }], { initialEntries: ['/'] });
  await act(async () => {
    render(
      <QueryClientProvider client={taoQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );
  });
  await screen.findByRole('heading', { level: 2, name: 'Thủ tục thường gặp' });
}

describe('TrangChu — dòng nhắc đăng xuất (F09 BR-4)', () => {
  it.each([
    ['thẻ', 800, 'article'],
    ['bảng', 1280, 'table'],
  ] as const)('kiosk, dạng %s: đúng HAI dòng, một phía trên ô dịch vụ, một phía trên danh sách thường gặp (AC-3)', async (_ten, rong, vai) => {
    datCheDoKiosk(true);
    await dung(O_DICH_VU, rong);
    await screen.findAllByRole(vai);
    await screen.findAllByText(NHAC);
    expect(await screen.findAllByText(NHAC)).toHaveLength(2);

    const khuO = screen.getByRole('region', { name: 'Dịch vụ nhanh' });
    expect(within(khuO).getAllByText(NHAC)).toHaveLength(1);
    const khuThuongGap = screen.getByRole('heading', { level: 2, name: 'Thủ tục thường gặp' }).closest('section')!;
    expect(within(khuThuongGap).getAllByText(NHAC)).toHaveLength(1);
  });

  it('kiosk, ô dịch vụ không có đích Cổng DVC: chỉ còn một dòng (của danh sách thường gặp)', async () => {
    datCheDoKiosk(true);
    await dung([O_DICH_VU[0]!, O_DICH_VU[2]!], 800);
    await screen.findAllByRole('article');
    await screen.findByText(NHAC);
    expect(screen.getAllByText(NHAC)).toHaveLength(1);
    expect(within(screen.getByRole('region', { name: 'Dịch vụ nhanh' })).queryByText(NHAC)).toBeNull();
  });

  it.each([
    ['thẻ', 800, 'article'],
    ['bảng', 1280, 'table'],
  ] as const)('ngoài kiosk, dạng %s: không dòng nào (AC-4)', async (_ten, rong, vai) => {
    await dung(O_DICH_VU, rong);
    await screen.findAllByRole(vai);
    expect(screen.queryByText(NHAC)).toBeNull();
  });
});
