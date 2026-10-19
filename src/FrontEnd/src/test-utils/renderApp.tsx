import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import type { ThongTinTrungTam } from '../core/api/trungTam';

/** Cách API `/api/trung-tam` trả lời trong test. */
export type PhanHoiTrungTam = ThongTinTrungTam | 'loi-mang' | 'khong-co-du-lieu' | 'treo';

/**
 * Giả `fetch` cho `/api/trung-tam`. `treo` = chưa trả lời (để xem trạng thái đang tải);
 * gọi `traLoi(duLieu)` để trả lời các yêu cầu đang treo.
 */
export function giaFetchTrungTam(phanHoi: PhanHoiTrungTam) {
  const dangTreo: ((r: Response) => void)[] = [];
  const fn = vi.fn<typeof fetch>().mockImplementation(() => {
    if (phanHoi === 'treo') return new Promise<Response>((giai) => dangTreo.push(giai));
    if (phanHoi === 'loi-mang') return Promise.reject(new TypeError('Failed to fetch'));
    if (phanHoi === 'khong-co-du-lieu') {
      return Promise.resolve(
        new Response(JSON.stringify({ code: 'khong-tim-thay' }), {
          status: 404,
          headers: { 'content-type': 'application/problem+json' },
        }),
      );
    }
    return Promise.resolve(Response.json(phanHoi));
  });
  vi.stubGlobal('fetch', fn);
  const traLoi = (duLieu: ThongTinTrungTam) => dangTreo.splice(0).forEach((giai) => giai(Response.json(duLieu)));
  return Object.assign(fn, { traLoi });
}

export function taoQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } });
}

interface TuyChon {
  duongDan?: string;
  trungTam?: PhanHoiTrungTam;
  client?: QueryClient;
}

/** Dựng ứng dụng trong bộ nhớ: bảng route, router bộ nhớ, QueryClient và `fetch` giả. */
export function renderApp(cacTuyen: RouteObject[], { duongDan = '/', trungTam = 'treo', client = taoQueryClient() }: TuyChon = {}) {
  const fetchGia = giaFetchTrungTam(trungTam);
  const router = createMemoryRouter(cacTuyen, { initialEntries: [duongDan] });
  const ketQua = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...ketQua, router, client, fetchGia };
}
