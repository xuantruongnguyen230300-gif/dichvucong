import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_QUAY_LINH_VUC, layQuayLinhVuc, useQuayLinhVuc } from './quayLinhVuc';

afterEach(() => vi.unstubAllGlobals());

function boc() {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('quayLinhVuc', () => {
  it('gọi đúng /api/linh-vuc/quay và dựng Map mã → số quầy', async () => {
    const fn = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json([
        { linhVucMa: 'ho-tich', quay: 3 },
        { linhVucMa: 'dat-dai', quay: 7 },
      ]),
    );
    vi.stubGlobal('fetch', fn);
    expect(API_QUAY_LINH_VUC).toBe('/api/linh-vuc/quay');
    const quay = await layQuayLinhVuc();
    expect(fn.mock.calls[0]?.[0]).toBe('/api/linh-vuc/quay');
    expect(quay.get('ho-tich')).toBe(3);
    expect(quay.get('dat-dai')).toBe(7);
    expect(quay.get('chung-thuc')).toBeUndefined();
  });

  it('[] (chưa có phân công) → Map rỗng', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(Response.json([])));
    const { result } = renderHook(() => useQuayLinhVuc(), { wrapper: boc() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.size).toBe(0);
  });

  it('lỗi 500 không thử lại', async () => {
    const fn = vi.fn<typeof fetch>().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ code: 'loi-he-thong' }), {
          status: 500,
          headers: { 'content-type': 'application/problem+json' },
        }),
      ),
    );
    vi.stubGlobal('fetch', fn);
    const { result } = renderHook(() => useQuayLinhVuc(), { wrapper: boc() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('lỗi mạng không thử lại', async () => {
    const fn = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fn);
    const { result } = renderHook(() => useQuayLinhVuc(), { wrapper: boc() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
