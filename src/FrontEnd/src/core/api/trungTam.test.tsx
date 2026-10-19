import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TRUNG_TAM_THU } from '../../test-utils/trungTamMau';
import { API_TRUNG_TAM, layThongTinTrungTam, useThongTinTrungTam } from './trungTam';

afterEach(() => vi.unstubAllGlobals());

function boc() {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('trungTam', () => {
  it('gọi đúng /api/trung-tam', async () => {
    const fn = vi.fn<typeof fetch>().mockResolvedValue(Response.json(TRUNG_TAM_THU));
    vi.stubGlobal('fetch', fn);
    expect(API_TRUNG_TAM).toBe('/api/trung-tam');
    expect(await layThongTinTrungTam()).toEqual(TRUNG_TAM_THU);
    expect(fn.mock.calls[0]?.[0]).toBe('/api/trung-tam');
  });

  it('hai nơi dùng useThongTinTrungTam chung một yêu cầu', async () => {
    const fn = vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(Response.json(TRUNG_TAM_THU)));
    vi.stubGlobal('fetch', fn);
    const wrapper = boc();
    const a = renderHook(() => useThongTinTrungTam(), { wrapper });
    await waitFor(() => expect(a.result.current.data?.ten).toBe('Trung tâm thử A'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('404 (chưa nhập dữ liệu) không thử lại', async () => {
    const fn = vi.fn<typeof fetch>().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ code: 'khong-tim-thay' }), {
          status: 404,
          headers: { 'content-type': 'application/problem+json' },
        }),
      ),
    );
    vi.stubGlobal('fetch', fn);
    const { result } = renderHook(() => useThongTinTrungTam(), { wrapper: boc() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
