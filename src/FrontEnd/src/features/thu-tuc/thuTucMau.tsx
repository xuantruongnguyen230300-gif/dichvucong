import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { createMemoryRouter, RouterProvider, useLocation, type RouteObject } from 'react-router';
import type { ChiTietThuTuc } from './api/chiTietThuTuc';

/** Dữ liệu và công cụ dựng test cho F03 (không phải mã chạy thật). */

export const CHI_TIET_KHAI_SINH: ChiTietThuTuc = {
  ma: '1.001193',
  ten: 'Thủ tục đăng ký khai sinh',
  linhVuc: 'Hộ tịch',
  mucDo: 'toan-trinh',
  coQuanThucHien: 'Ủy ban nhân dân cấp xã',
  thoiHan: null,
  phi: 'Lệ phí: 0 VNĐ',
  hinhThucNop: ['Trực tuyến', 'Bưu chính', 'Trực tiếp'],
  yeuCauDieuKien: 'Người đăng ký là cha hoặc mẹ.\nTrẻ chưa đăng ký khai sinh.',
  trinhTu: [
    { truongHop: 'Nộp trực tiếp', noiDung: 'Bước 1: Nộp hồ sơ.\nBước 2: Nhận kết quả.' },
    { truongHop: null, noiDung: 'Nộp trực tuyến trên Cổng Dịch vụ công.' },
  ],
  cachThuc: [
    { hinhThuc: 'Trực tuyến', thoiHan: '5 ngày làm việc', phi: 'Lệ phí: 0 VNĐ', moTa: 'Nộp qua Cổng DVC' },
    { hinhThuc: 'Bưu chính', thoiHan: null, phi: null, moTa: null },
  ],
  thanhPhanHoSo: [
    { ten: 'Tờ khai đăng ký khai sinh', banChinh: 1, banSao: 0 },
    { ten: 'Giấy chứng sinh', banChinh: null, banSao: null },
    { ten: 'Giấy tờ ghi 0 bản', banChinh: 0, banSao: 0 },
  ],
  ketQua: ['Giấy khai sinh'],
  canCu: [
    { soKyHieu: 'Luật số 60/2014/QH13', trichYeu: 'Luật Hộ tịch' },
    { soKyHieu: null, trichYeu: 'Thông tư hướng dẫn' },
  ],
};

/** Thủ tục tối giản: không có mục tuỳ chọn nào. */
export const CHI_TIET_TOI_GIAN: ChiTietThuTuc = {
  ma: '2.000815',
  ten: 'Thủ tục tối giản',
  linhVuc: 'Đất đai',
  mucDo: 'mot-phan',
  coQuanThucHien: null,
  thoiHan: '3 ngày làm việc',
  phi: null,
  hinhThucNop: [],
  yeuCauDieuKien: null,
  trinhTu: [],
  cachThuc: [],
  thanhPhanHoSo: [],
  ketQua: [],
  canCu: [],
};

export function phanHoiLoi(status: number, code: string): Response {
  return new Response(JSON.stringify({ code, maTraCuu: 'AB12CD34' }), {
    status,
    headers: { 'content-type': 'application/problem+json' },
  });
}

/**
 * Giả `fetch` cho `/api/thu-tuc/{ma}`: mã có trong `cacChiTiet` trả 200, còn lại 404.
 * `loi` đặt thì mọi yêu cầu bị từ chối như mất mạng. Gỡ bằng `vi.unstubAllGlobals()`.
 */
export function giaFetchChiTiet(cacChiTiet: readonly ChiTietThuTuc[], loi?: 'loi-mang' | 'treo') {
  const dangTreo: (() => void)[] = [];
  const fn = vi.fn<typeof fetch>().mockImplementation((dau) => {
    const duongDan = decodeURIComponent(String(dau).split('?')[0] ?? '');
    const tim = cacChiTiet.find((c) => `/api/thu-tuc/${c.ma}` === duongDan);
    if (loi === 'loi-mang') return Promise.reject(new TypeError('Failed to fetch'));
    if (loi === 'treo') {
      return new Promise<Response>((giai) => dangTreo.push(() => giai(tim ? Response.json(tim) : phanHoiLoi(404, 'khong-tim-thay'))));
    }
    return Promise.resolve(tim ? Response.json(tim) : phanHoiLoi(404, 'khong-tim-thay'));
  });
  vi.stubGlobal('fetch', fn);
  return Object.assign(fn, { traLoi: () => dangTreo.splice(0).forEach((f) => f()) });
}

export function taoClientThu(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retryDelay: 0 } } });
}

/** Hiện địa chỉ hiện tại (đường dẫn + chuỗi truy vấn) để test đọc. */
export function DiaChiHienTai() {
  const { pathname, search } = useLocation();
  return <span data-testid="dia-chi">{pathname + search}</span>;
}

interface TuyChonDung {
  diaChi?: string;
  client?: QueryClient;
}

/** Dựng `manHinh` trong router bộ nhớ có QueryClient; `diaChi` gồm cả chuỗi truy vấn. */
export function dungTrongRouter(manHinh: ReactNode, { diaChi = '/', client = taoClientThu() }: TuyChonDung = {}) {
  const tuyen: RouteObject[] = [{ path: '*', element: manHinh }];
  const router = createMemoryRouter(tuyen, { initialEntries: [diaChi] });
  const ketQua = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...ketQua, router, client };
}
