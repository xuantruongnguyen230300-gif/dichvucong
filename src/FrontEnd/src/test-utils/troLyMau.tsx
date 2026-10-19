import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { phanHoiLoi } from '../features/thu-tuc/thuTucMau';
import type { CauTraLoi, ChuDeGoiY, NoiDungMuc, ThuTucNgan } from '../features/chatbot/api/troLy';

/** Dữ liệu và công cụ dựng test cho khung trợ lý (F06 T11–T13); không phải mã chạy thật. Ví dụ JSON theo plan §3.5. */

export const THU_TUC_KHAI_SINH: ThuTucNgan = {
  ma: '1.001193',
  ten: 'Thủ tục đăng ký khai sinh',
  linhVuc: 'Hộ tịch',
  mucDo: 'toan-trinh',
  capXa: true,
  capTinh: true,
};
export const THU_TUC_KHAI_SINH_LAI: ThuTucNgan = { ...THU_TUC_KHAI_SINH, ma: '1.004884', ten: 'Thủ tục đăng ký lại khai sinh' };
export const THU_TUC_KET_HON: ThuTucNgan = { ...THU_TUC_KHAI_SINH, ma: '1.000894', ten: 'Thủ tục đăng ký kết hôn', mucDo: 'mot-phan', capTinh: false };

export const NOI_DUNG_TRONG: NoiDungMuc = {
  thoiHan: null,
  phi: null,
  hinhThucNop: null,
  thanhPhanHoSo: null,
  trinhTu: null,
  ketQua: null,
  canCu: null,
  tong: null,
};

/** Đáp án `thu-tuc` về một mục; `noiDung` ghi đè từng phần của nội dung trống. */
export function dapAnThuTuc(
  muc: Extract<CauTraLoi, { loai: 'thu-tuc' }>['muc'],
  noiDung: Partial<NoiDungMuc> = {},
  rieng: Partial<Extract<CauTraLoi, { loai: 'thu-tuc' }>> = {},
): Extract<CauTraLoi, { loai: 'thu-tuc' }> {
  return {
    loai: 'thu-tuc',
    thuTucDangNoi: '1.001193',
    muc,
    thuTuc: THU_TUC_KHAI_SINH,
    thuTucKhac: [],
    noiDung: { ...NOI_DUNG_TRONG, ...noiDung },
    quay: null,
    noiTiepNhanChuyen: null,
    trungTam: null,
    ...rieng,
  };
}

export const DAP_AN_HO_SO: CauTraLoi = dapAnThuTuc(
  'ho-so',
  { thanhPhanHoSo: [{ ten: '- Tờ khai đăng ký khai sinh theo mẫu', banChinh: 1, banSao: null }], tong: 7 },
  { thuTucKhac: [THU_TUC_KHAI_SINH_LAI] },
);

export const DAP_AN_KHONG_HIEU: CauTraLoi = {
  loai: 'khong-hieu',
  thuTucDangNoi: null,
  lienHe: { dienThoai: '02723 893 900', zaloOa: null },
};

export const DAP_AN_DANH_SACH: CauTraLoi = {
  loai: 'thu-tuc-danh-sach',
  thuTucDangNoi: '1.000894',
  danhSachThuTuc: [THU_TUC_KET_HON, THU_TUC_KHAI_SINH_LAI],
};

export const CHU_DE_MAU: ChuDeGoiY[] = [
  { thuTu: 1, tenHienThi: 'Hộ tịch' },
  { thuTu: 2, tenHienThi: 'Đất đai' },
  { thuTu: 3, tenHienThi: 'Chăn nuôi' },
];

export const TRUNG_TAM_NGAN = { ten: 'Trung tâm thử A', diaChi: 'Địa chỉ thử A' };

/** Cách `fetch` giả trả lời. Hàm nhận body đã đọc (JSON). */
export interface CauHinhFetchTroLy {
  /** Danh sách chip; hàm thì gọi lại ở mỗi yêu cầu (để đổi dữ liệu giữa hai lần mở khung). */
  chuDe?: ChuDeGoiY[] | (() => ChuDeGoiY[]) | 'loi';
  hoi?: (body: { cauHoi: string; maThuTuc: string | null }) => CauTraLoi | Response | Promise<CauTraLoi | Response>;
  hoiChuDe?: (body: { thuTu: number; maThuTuc: string | null }) => CauTraLoi | Response | Promise<CauTraLoi | Response>;
  /** Trả lời `GET /api/thu-tuc/{ma}` (popup chi tiết). */
  chiTiet?: (ma: string) => Response;
}

export interface YeuCauDaGui {
  phuongThuc: string;
  duongDan: string;
  body: unknown;
}

/**
 * Giả `fetch` cho `/api/tro-ly/*` (và tuỳ chọn `/api/thu-tuc/{ma}`); ghi lại mọi yêu cầu. Gỡ bằng `vi.unstubAllGlobals()`.
 */
export function giaFetchTroLy(cauHinh: CauHinhFetchTroLy = {}) {
  const daGui: YeuCauDaGui[] = [];
  const fn = vi.fn<typeof fetch>().mockImplementation(async (dau, tuyChon) => {
    const duongDan = new URL(String(dau), 'http://thu.local').pathname;
    const phuongThuc = tuyChon?.method ?? 'GET';
    const body: unknown = typeof tuyChon?.body === 'string' ? JSON.parse(tuyChon.body) : undefined;
    daGui.push({ phuongThuc, duongDan, body });

    const traVe = (kq: CauTraLoi | Response) => (kq instanceof Response ? kq : Response.json(kq));
    if (duongDan === '/api/tro-ly/chu-de' && phuongThuc === 'GET') {
      if (cauHinh.chuDe === 'loi') return phanHoiLoi(500, 'loi-he-thong');
      const chuDe = cauHinh.chuDe ?? [];
      return Response.json(typeof chuDe === 'function' ? chuDe() : chuDe);
    }
    if (duongDan === '/api/tro-ly/hoi' && cauHinh.hoi) return traVe(await cauHinh.hoi(body as { cauHoi: string; maThuTuc: string | null }));
    if (duongDan === '/api/tro-ly/chu-de' && cauHinh.hoiChuDe) {
      return traVe(await cauHinh.hoiChuDe(body as { thuTu: number; maThuTuc: string | null }));
    }
    if (duongDan.startsWith('/api/thu-tuc/') && cauHinh.chiTiet) return cauHinh.chiTiet(decodeURIComponent(duongDan.slice('/api/thu-tuc/'.length)));
    return phanHoiLoi(404, 'khong-tim-thay');
  });
  vi.stubGlobal('fetch', fn);
  return Object.assign(fn, {
    daGui,
    /** Các câu hỏi (body của POST /hoi) theo thứ tự gửi. */
    cacCauHoi: () => daGui.filter((y) => y.duongDan === '/api/tro-ly/hoi').map((y) => y.body as { cauHoi: string; maThuTuc: string | null }),
    demChuDe: () => daGui.filter((y) => y.duongDan === '/api/tro-ly/chu-de' && y.phuongThuc === 'GET').length,
  });
}

export function taoClientThu(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false, retryDelay: 0 } } });
}

/** Dựng `manHinh` trong router bộ nhớ có QueryClient (khung cần cả hai: `useMoThuTuc` và chip chủ đề). */
export function dungKhungTrongRouter(manHinh: ReactNode, diaChi = '/', client = taoClientThu()) {
  const router = createMemoryRouter([{ path: '*', element: manHinh }], { initialEntries: [diaChi] });
  const ketQua = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...ketQua, router, client };
}
