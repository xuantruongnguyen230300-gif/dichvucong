import { useQuery } from '@tanstack/react-query';
import { ApiError, http } from './http';

/** Hợp đồng `GET /api/linh-vuc` (F04 plan §3.1): lĩnh vực có ít nhất một thủ tục, đã sắp theo `tenTimKiem`. */
export interface LinhVuc {
  /** Mã sinh từ tên, vd. "ho-tich" — dùng trên địa chỉ và QR. */
  ma: string;
  ten: string;
  /** Tên đã bỏ dấu, chữ thường. */
  tenTimKiem: string;
  soThuTucXa: number;
  soThuTucTinh: number;
}

export const API_LINH_VUC = '/api/linh-vuc';
export const KHOA_LINH_VUC = ['linh-vuc'] as const;

export function layLinhVuc(signal?: AbortSignal): Promise<LinhVuc[]> {
  return http<LinhVuc[]>(API_LINH_VUC, signal ? { signal } : {});
}

/** Lĩnh vực kèm số thủ tục mỗi cấp (dùng chung F04, F05). 404 không thử lại. */
export function useLinhVuc() {
  return useQuery({
    queryKey: KHOA_LINH_VUC,
    queryFn: ({ signal }) => layLinhVuc(signal),
    retry: (soLan, loi) => !(loi instanceof ApiError && loi.status === 404) && soLan < 1,
  });
}
