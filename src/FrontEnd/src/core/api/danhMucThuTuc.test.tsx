import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { DANH_MUC_MAU, giaFetchDanhMuc, taoDanhSachThuTuc, taoLinhVuc, taoThuTuc } from '../../test-utils/danhMucMau';
import { taoBoLocTuKhoa } from '../utils/timKiem';
import { API_THU_TUC, KHOA_DANH_MUC_THU_TUC, layDanhMucThuTuc, useDanhMucThuTuc, type ThuTucDanhMuc } from './danhMucThuTuc';
import { ApiError } from './http';
import { API_LINH_VUC, KHOA_LINH_VUC, layLinhVuc, useLinhVuc } from './linhVuc';

afterEach(() => vi.unstubAllGlobals());

function boc(staleTime = 0) {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0, staleTime } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('danhMucThuTuc', () => {
  it('hằng số đúng hợp đồng', () => {
    expect(API_THU_TUC).toBe('/api/thu-tuc');
    expect(API_LINH_VUC).toBe('/api/linh-vuc');
    expect(KHOA_DANH_MUC_THU_TUC).toEqual(['danh-muc-thu-tuc']);
    expect(KHOA_LINH_VUC).toEqual(['linh-vuc']);
  });

  it('gọi đúng /api/thu-tuc và /api/linh-vuc, mỗi API một lần', async () => {
    const fn = giaFetchDanhMuc(DANH_MUC_MAU);
    const kq = await layDanhMucThuTuc();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls.map((c) => c[0]).sort()).toEqual(['/api/linh-vuc', '/api/thu-tuc']);
    expect(kq.thuTuc).toHaveLength(DANH_MUC_MAU.thuTuc.length);
    expect(kq.linhVuc).toEqual(DANH_MUC_MAU.linhVuc);
    expect(kq.linhVucTheoMa.get('ho-tich')?.ten).toBe('Hộ tịch');
  });

  it('giữ nguyên thứ tự của API; linhVuc là TÊN lĩnh vực', async () => {
    giaFetchDanhMuc(DANH_MUC_MAU);
    const { thuTuc } = await layDanhMucThuTuc();
    expect(thuTuc.map((t) => t.ma)).toEqual(DANH_MUC_MAU.thuTuc.map((t) => t.ma));
    expect(thuTuc.find((t) => t.ma === '1.001193')?.linhVuc).toBe('Hộ tịch');
    expect(thuTuc.find((t) => t.ma === '1.004227')?.linhVuc).toBe('Đất đai');
  });

  it('tim chứa tên đã bỏ dấu, mã, tên lĩnh vực bỏ dấu (AC-1, AC-12)', async () => {
    giaFetchDanhMuc(DANH_MUC_MAU);
    const { thuTuc } = await layDanhMucThuTuc();
    const khaiSinh = thuTuc.find((t) => t.ma === '1.001193')!;
    expect(khaiSinh.tim).toBe('thu tuc dang ky khai sinh 1.001193 ho tich');
    const khop = (tuKhoa: string) => thuTuc.filter((t) => taoBoLocTuKhoa(tuKhoa)(t.tim)).map((t) => t.ten);
    expect(khop('1.001193')).toEqual(['Thủ tục đăng ký khai sinh']);
    const hoTich = khop('ho tich');
    expect(hoTich).toHaveLength(3);
    expect(hoTich).toContain('Thủ tục đăng ký khai sinh');
    expect(khop('Hộ Tịch khai sinh')).toEqual(['Thủ tục đăng ký khai sinh']); // có dấu, hoa thường, thứ tự bất kỳ
  });

  it('mất khoá lĩnh vực thì linhVuc là chuỗi rỗng và tim vẫn có tên và mã', async () => {
    giaFetchDanhMuc({
      thuTuc: [taoThuTuc({ ma: '9.000001', ten: 'Thủ tục mồ côi', linhVucMa: 'khong-co' })],
      linhVuc: [taoLinhVuc('ho-tich', 'Hộ tịch', 1, 1)],
    });
    const { thuTuc } = await layDanhMucThuTuc();
    expect(thuTuc[0]?.linhVuc).toBe('');
    expect(thuTuc[0]?.tim).toBe('thu tuc mo coi 9.000001');
  });

  it('dữ liệu rỗng → mảng rỗng, không lỗi', async () => {
    giaFetchDanhMuc({ thuTuc: [], linhVuc: [] });
    const kq = await layDanhMucThuTuc();
    expect(kq.thuTuc).toEqual([]);
    expect(kq.linhVucTheoMa.size).toBe(0);
  });

  it('ThuTucDanhMuc gán được cho kiểu cấu trúc MucThuTuc của F03', () => {
    interface MucThuTuc {
      ma: string;
      ten: string;
      linhVucMa: string;
      linhVuc: string;
      mucDo: string;
      coQuanThucHien: string | null;
      thoiHan: string | null;
      thuTuThuongGap: number | null;
    }
    expectTypeOf<ThuTucDanhMuc>().toExtend<MucThuTuc>();
  });

  it('lỗi HTTP → ApiError (kèm mã lỗi)', async () => {
    giaFetchDanhMuc('loi-he-thong');
    const loi = await layDanhMucThuTuc().catch((e: unknown) => e);
    expect(loi).toBeInstanceOf(ApiError);
    expect((loi as ApiError).status).toBe(500);
    expect((loi as ApiError).code).toBe('loi-he-thong');
  });

  it('useDanhMucThuTuc: hai nơi dùng chung một lần tải (2 yêu cầu)', async () => {
    const fn = giaFetchDanhMuc(DANH_MUC_MAU);
    const wrapper = boc();
    const a = renderHook(() => useDanhMucThuTuc(), { wrapper });
    const b = renderHook(() => useDanhMucThuTuc(), { wrapper });
    await waitFor(() => expect(a.result.current.data?.thuTuc).toHaveLength(6));
    await waitFor(() => expect(b.result.current.data?.linhVuc).toHaveLength(3));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('lĩnh vực dùng chung khoá [linh-vuc]: sang /linh-vuc từ /thu-tuc không gọi /api/linh-vuc lần hai (F05 L2)', async () => {
    const fn = giaFetchDanhMuc(DANH_MUC_MAU);
    const wrapper = boc(60_000); // như QueryClient của ứng dụng (staleTime 60 giây)
    const a = renderHook(() => useDanhMucThuTuc(), { wrapper });
    await waitFor(() => expect(a.result.current.data?.linhVuc).toHaveLength(3));
    const b = renderHook(() => useLinhVuc(), { wrapper });
    await waitFor(() => expect(b.result.current.data).toHaveLength(3));
    const goiLinhVuc = () => fn.mock.calls.filter((c) => c[0] === '/api/linh-vuc').length;
    expect(goiLinhVuc()).toBe(1);
  });

  it('chiều ngược lại: /linh-vuc rồi /thu-tuc cũng chỉ gọi /api/linh-vuc một lần', async () => {
    const fn = giaFetchDanhMuc(DANH_MUC_MAU);
    const wrapper = boc();
    const a = renderHook(() => useLinhVuc(), { wrapper });
    await waitFor(() => expect(a.result.current.data).toHaveLength(3));
    const b = renderHook(() => useDanhMucThuTuc(), { wrapper });
    await waitFor(() => expect(b.result.current.data?.thuTuc).toHaveLength(6));
    expect(fn.mock.calls.filter((c) => c[0] === '/api/linh-vuc')).toHaveLength(1);
    expect(fn.mock.calls.filter((c) => c[0] === '/api/thu-tuc')).toHaveLength(1);
  });

  it('useDanhMucThuTuc: 404 (chưa nhập dữ liệu) không thử lại', async () => {
    const fn = giaFetchDanhMuc('khong-co-du-lieu');
    const { result } = renderHook(() => useDanhMucThuTuc(), { wrapper: boc() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(fn.mock.calls.length).toBeLessThanOrEqual(2); // một lượt gọi hai API, không có lượt thử lại
  });

  it('useDanhMucThuTuc: lỗi 500 thử lại một lần', async () => {
    const fn = giaFetchDanhMuc('loi-he-thong');
    const { result } = renderHook(() => useDanhMucThuTuc(), { wrapper: boc() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fn.mock.calls.length).toBeGreaterThan(2);
  });
});

describe('linhVuc', () => {
  it('layLinhVuc gọi đúng /api/linh-vuc', async () => {
    const fn = giaFetchDanhMuc(DANH_MUC_MAU);
    expect(await layLinhVuc()).toEqual(DANH_MUC_MAU.linhVuc);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]?.[0]).toBe('/api/linh-vuc');
  });

  it('useLinhVuc trả mảng', async () => {
    giaFetchDanhMuc(DANH_MUC_MAU);
    const { result } = renderHook(() => useLinhVuc(), { wrapper: boc() });
    await waitFor(() => expect(result.current.data).toHaveLength(3));
  });

  it('useLinhVuc: lỗi HTTP → ApiError, 404 không thử lại', async () => {
    const fn = giaFetchDanhMuc('khong-co-du-lieu');
    const { result } = renderHook(() => useLinhVuc(), { wrapper: boc() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('danhMucMau', () => {
  it('taoDanhSachThuTuc đếm đúng theo cấp', () => {
    const thuTuc = [
      ...taoDanhSachThuTuc(3, { cap: 'xa', linhVucMa: 'a' }),
      ...taoDanhSachThuTuc(2, { cap: 'tinh', linhVucMa: 'a', batDau: 10 }),
    ];
    expect(thuTuc.filter((t) => t.capXa)).toHaveLength(3);
    expect(thuTuc.filter((t) => t.capTinh)).toHaveLength(2);
  });
});
