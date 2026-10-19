import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../core/api/http';
import { API_TRO_LY, hoiChuDe, hoiTroLy, useChuDeGoiY, type CauTraLoi } from './troLy';

afterEach(() => vi.unstubAllGlobals());

function giaFetch(phanHoi: () => Response) {
  const fn = vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(phanHoi()));
  vi.stubGlobal('fetch', fn);
  return fn;
}

const THU_TUC_NGAN = {
  ma: '1.001193',
  ten: 'Thủ tục đăng ký khai sinh',
  linhVuc: 'Hộ tịch',
  mucDo: 'toan-trinh',
  capXa: true,
  capTinh: true,
} as const;

// Các ví dụ JSON của plan §3.5 và mỗi loại còn lại: phải gán được vào CauTraLoi (kiểm bằng tsc).
const MAU_THU_TUC = {
  loai: 'thu-tuc',
  thuTucDangNoi: '1.001193',
  muc: 'ho-so',
  thuTuc: THU_TUC_NGAN,
  thuTucKhac: [{ ...THU_TUC_NGAN, ma: '1.004884', ten: 'Thủ tục đăng ký lại khai sinh' }],
  noiDung: {
    thoiHan: null,
    phi: null,
    hinhThucNop: null,
    thanhPhanHoSo: [{ ten: '- Tờ khai đăng ký khai sinh theo mẫu', banChinh: 1, banSao: null }],
    trinhTu: null,
    ketQua: null,
    canCu: null,
    tong: 7,
  },
  quay: null,
  noiTiepNhanChuyen: null,
  trungTam: null,
} satisfies CauTraLoi;

const MAU_KHONG_HIEU = {
  loai: 'khong-hieu',
  thuTucDangNoi: null,
  lienHe: { dienThoai: '02723 893 900', zaloOa: null },
} satisfies CauTraLoi;

const MAU_KHAC = [
  { loai: 'thu-tuc-danh-sach', thuTucDangNoi: null, danhSachThuTuc: [THU_TUC_NGAN] },
  {
    loai: 'chu-de',
    thuTucDangNoi: null,
    chuDe: { tenHienThi: 'Hộ tịch', linhVuc: 'Hộ tịch' },
    tong: 15,
    danhSachThuTuc: [THU_TUC_NGAN],
    quay: 3,
    noiTiepNhanChuyen: null,
    trungTam: { ten: 'Trung tâm thử A', diaChi: 'Địa chỉ thử A' },
  },
  { loai: 'cau-hoi-mau', thuTucDangNoi: null, traLoi: 'Dòng 1\nDòng 2', danhSachThuTuc: [] },
  {
    loai: 'trung-tam',
    thuTucDangNoi: null,
    muc: 'dia-chi',
    thongTin: {
      coDuLieu: true,
      diaChi: 'Địa chỉ thử A',
      banDo: null,
      gioLamViec: null,
      ghiChuNgayNghi: null,
      dienThoai: null,
      email: null,
      lienKet: null,
    },
    lienHe: null,
  },
  {
    loai: 'quay',
    thuTucDangNoi: null,
    muc: 'can-bo',
    linhVuc: 'Đất đai',
    quay: 4,
    noiTiepNhanChuyen: null,
    canBo: [{ hoTen: 'Nguyễn Văn A', xungHo: 'Ông', chucVu: 'Chuyên viên', quay: 4, moTa: null }],
    tong: 1,
    trungTam: null,
  },
] satisfies CauTraLoi[];

describe('hoiTroLy / hoiChuDe', () => {
  it('hoiTroLy gọi POST /api/tro-ly/hoi với body { cauHoi, maThuTuc } và trả đáp án', async () => {
    const fn = giaFetch(() => Response.json(MAU_THU_TUC));
    const kq = await hoiTroLy('làm giấy khai sinh cần giấy tờ gì', '1.000894');
    expect(kq).toEqual(MAU_THU_TUC);
    const [url, init] = fn.mock.calls[0]!;
    expect(url).toBe('/api/tro-ly/hoi');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({
      cauHoi: 'làm giấy khai sinh cần giấy tờ gì',
      maThuTuc: '1.000894',
    });
  });

  it('chưa có ngữ cảnh thì gửi maThuTuc: null (khoá vẫn có mặt)', async () => {
    const fn = giaFetch(() => Response.json(MAU_KHONG_HIEU));
    await hoiTroLy('giá vàng hôm nay', null);
    expect(fn.mock.calls[0]?.[1]?.body).toBe('{"cauHoi":"giá vàng hôm nay","maThuTuc":null}');
  });

  it('hoiChuDe gọi POST /api/tro-ly/chu-de với body { thuTu, maThuTuc }', async () => {
    const fn = giaFetch(() => Response.json(MAU_KHAC[1]));
    await hoiChuDe(2, null);
    const [url, init] = fn.mock.calls[0]!;
    expect(url).toBe('/api/tro-ly/chu-de');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({ thuTu: 2, maThuTuc: null });
  });

  it('chuyển AbortSignal cho fetch', async () => {
    const fn = giaFetch(() => Response.json(MAU_KHONG_HIEU));
    const huy = new AbortController();
    await hoiTroLy('x', null, huy.signal);
    // `http` nối signal của người gọi với hạn chờ nên signal tới fetch là bản liên kết, không phải chính nó
    expect(fn.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
    expect(fn.mock.calls[0]?.[1]?.signal?.aborted).toBe(false);
    huy.abort();
    await hoiTroLy('x', null, huy.signal).catch(() => undefined);
    expect(fn.mock.calls[1]?.[1]?.signal?.aborted).toBe(true);
  });

  it('429 ném ApiError có code qua-nhieu-yeu-cau', async () => {
    giaFetch(
      () =>
        new Response(JSON.stringify({ code: 'qua-nhieu-yeu-cau', status: 429 }), {
          status: 429,
          headers: { 'content-type': 'application/problem+json' },
        }),
    );
    const loi = await hoiTroLy('x', null).catch((e: unknown) => e);
    expect(loi).toBeInstanceOf(ApiError);
    expect((loi as ApiError).code).toBe('qua-nhieu-yeu-cau');
    expect((loi as ApiError).status).toBe(429);
  });

  it('lỗi mạng ném ApiError mat-ket-noi', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const loi = await hoiChuDe(1, null).catch((e: unknown) => e);
    expect((loi as ApiError).code).toBe('mat-ket-noi');
  });

  it('hằng đường dẫn', () => expect(API_TRO_LY).toBe('/api/tro-ly'));
});

function boc() {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
  return {
    client,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  };
}

describe('useChuDeGoiY', () => {
  const CHU_DE = [
    { thuTu: 1, tenHienThi: 'Khai sinh' },
    { thuTu: 2, tenHienThi: 'Chăn nuôi' },
  ];

  it('không gọi API khi khung chưa mở', () => {
    const fn = giaFetch(() => Response.json(CHU_DE));
    const { wrapper } = boc();
    renderHook(() => useChuDeGoiY(false), { wrapper });
    expect(fn).not.toHaveBeenCalled();
  });

  it('mở khung → GET /api/tro-ly/chu-de, giữ thứ tự của API', async () => {
    const fn = giaFetch(() => Response.json(CHU_DE));
    const { wrapper } = boc();
    const { result } = renderHook(() => useChuDeGoiY(true), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(CHU_DE));
    expect(fn.mock.calls[0]?.[0]).toBe('/api/tro-ly/chu-de');
    expect(fn.mock.calls[0]?.[1]?.method).toBe('GET');
  });

  it('đóng rồi mở lại khung → tải lại (bất kể staleTime chung), dữ liệu mới hiện ngay (AC-25)', async () => {
    let lan = 0;
    const fn = giaFetch(() => Response.json(lan++ === 0 ? CHU_DE : CHU_DE.slice(0, 1)));
    const { wrapper } = boc();
    const { result, rerender } = renderHook(({ mo }) => useChuDeGoiY(mo), { wrapper, initialProps: { mo: true } });
    await waitFor(() => expect(result.current.data).toHaveLength(2));
    rerender({ mo: false });
    rerender({ mo: true });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('lỗi tải: isError, không thử lại (người gọi ẩn khu vực chủ đề)', async () => {
    const fn = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fn);
    const { wrapper } = boc();
    const { result } = renderHook(() => useChuDeGoiY(true), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
