import { useQuery } from '@tanstack/react-query';
import { http } from '../../../core/api/http';

/** Hợp đồng `GET /api/linh-vuc/quay` (F05 plan §3.1): chỉ các lĩnh vực đã có quầy. */
export interface QuayLinhVuc {
  linhVucMa: string;
  quay: number;
}

export const API_QUAY_LINH_VUC = '/api/linh-vuc/quay';

/**
 * Hạn chờ riêng của yêu cầu quầy (ms), ngắn hơn mặc định của `http`: quầy chỉ là phần thêm mà lưới phải chờ nó xong
 * (để dòng quầy không chèn vào sau làm ô nhảy chiều cao). Máy chủ treo thì sau chừng này coi như chưa có quầy và hiện lưới.
 */
export const HAN_CHO_QUAY_MS = 4_000;
export const KHOA_QUAY_LINH_VUC = ['quay-linh-vuc'] as const;

export async function layQuayLinhVuc(signal?: AbortSignal): Promise<ReadonlyMap<string, number>> {
  const ds = await http<QuayLinhVuc[]>(API_QUAY_LINH_VUC, { hanCho: HAN_CHO_QUAY_MS, ...(signal ? { signal } : {}) });
  return new Map(ds.map((q) => [q.linhVucMa, q.quay]));
}

/**
 * Mã lĩnh vực → số quầy. Quầy chỉ là phần thêm (BR-4): lỗi thì ẩn quầy ngay, không chờ thử lại
 * (`retry: false`); chỗ dùng coi lỗi như chưa có quầy và không báo lỗi.
 */
export function useQuayLinhVuc() {
  return useQuery({
    queryKey: KHOA_QUAY_LINH_VUC,
    queryFn: ({ signal }) => layQuayLinhVuc(signal),
    retry: false,
  });
}
