import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../core/api/http';
import { API_THU_TUC, layChiTietThuTuc, useChiTietThuTuc, useNapTruocChiTiet } from './chiTietThuTuc';
import type { ChiTietThuTuc } from './chiTietThuTuc';

afterEach(() => vi.unstubAllGlobals());

const CHI_TIET: ChiTietThuTuc = {
  ma: '1.001193',
  ten: 'Thủ tục đăng ký khai sinh',
  linhVuc: 'Hộ tịch',
  mucDo: 'toan-trinh',
  coQuanThucHien: 'Ủy ban nhân dân cấp xã',
  thoiHan: null,
  phi: 'Lệ phí: 0 VNĐ',
  hinhThucNop: ['Trực tuyến'],
  yeuCauDieuKien: null,
  trinhTu: [],
  cachThuc: [],
  thanhPhanHoSo: [],
  ketQua: [],
  canCu: [],
};

function loi404() {
  return new Response(JSON.stringify({ code: 'khong-tim-thay', maTraCuu: 'ABCD1234' }), {
    status: 404,
    headers: { 'content-type': 'application/problem+json' },
  });
}

function boc() {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retryDelay: 0 } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('layChiTietThuTuc', () => {
  it('gọi đúng /api/thu-tuc/{ma}', async () => {
    const fn = vi.fn<typeof fetch>().mockResolvedValue(Response.json(CHI_TIET));
    vi.stubGlobal('fetch', fn);
    expect(API_THU_TUC).toBe('/api/thu-tuc');
    expect(await layChiTietThuTuc('1.001193')).toEqual(CHI_TIET);
    expect(fn.mock.calls[0]?.[0]).toBe('/api/thu-tuc/1.001193');
  });

  it('mã đi vào đường dẫn qua encodeURIComponent', async () => {
    const fn = vi.fn<typeof fetch>().mockResolvedValue(Response.json(CHI_TIET));
    vi.stubGlobal('fetch', fn);
    await layChiTietThuTuc('a b/c');
    expect(fn.mock.calls[0]?.[0]).toBe('/api/thu-tuc/a%20b%2Fc');
  });

  it('404 ném ApiError có status 404 và code khong-tim-thay', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(loi404())));
    const loi = await layChiTietThuTuc('9.999999').catch((e: unknown) => e);
    expect(loi).toBeInstanceOf(ApiError);
    expect(loi).toMatchObject({ status: 404, code: 'khong-tim-thay' });
  });
});

describe('useChiTietThuTuc', () => {
  it('trả dữ liệu của mã hợp lệ', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(Response.json(CHI_TIET))));
    const { result } = renderHook(() => useChiTietThuTuc('1.001193'), { wrapper: boc() });
    await waitFor(() => expect(result.current.data?.ten).toBe('Thủ tục đăng ký khai sinh'));
  });

  it('mã sai định dạng không gọi fetch', async () => {
    const fn = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fn);
    const { result } = renderHook(() => useChiTietThuTuc('abc<b>x</b>'), { wrapper: boc() });
    await new Promise((r) => setTimeout(r, 20));
    expect(fn).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('ma null không gọi fetch', async () => {
    const fn = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fn);
    renderHook(() => useChiTietThuTuc(null), { wrapper: boc() });
    await new Promise((r) => setTimeout(r, 20));
    expect(fn).not.toHaveBeenCalled();
  });

  it('404 không thử lại', async () => {
    const fn = vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(loi404()));
    vi.stubGlobal('fetch', fn);
    const { result } = renderHook(() => useChiTietThuTuc('9.999999'), { wrapper: boc() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.current.error).toMatchObject({ status: 404 });
  });

  it('lỗi khác thử lại một lần', async () => {
    const fn = vi.fn<typeof fetch>().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ code: 'loi-he-thong' }), {
          status: 500,
          headers: { 'content-type': 'application/problem+json' },
        }),
      ),
    );
    vi.stubGlobal('fetch', fn);
    const { result } = renderHook(() => useChiTietThuTuc('1.001193'), { wrapper: boc() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('useNapTruocChiTiet', () => {
  it('nạp trước chi tiết; mở sau đó không gọi mạng lần nữa', async () => {
    const fn = vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(Response.json(CHI_TIET)));
    vi.stubGlobal('fetch', fn);
    const wrapper = boc();
    const nap = renderHook(() => useNapTruocChiTiet(), { wrapper });
    nap.result.current('1.001193');
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(1));
    expect(fn.mock.calls[0]?.[0]).toBe('/api/thu-tuc/1.001193');
  });

  it('mã sai định dạng không gọi fetch', async () => {
    const fn = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fn);
    const { result } = renderHook(() => useNapTruocChiTiet(), { wrapper: boc() });
    result.current('abc<b>x</b>');
    result.current('');
    await new Promise((r) => setTimeout(r, 20));
    expect(fn).not.toHaveBeenCalled();
  });
});
