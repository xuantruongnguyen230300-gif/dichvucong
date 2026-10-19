import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { ApiError, http } from '../../../core/api/http';
import { laMaHopLe } from '../maThuTuc';
import type { MucDoThuTuc } from '../types';

export type { MucDoThuTuc };

/** Hợp đồng `GET /api/thu-tuc/{ma}` (F03 plan mục 3.1). Chữ hiện ra nguyên văn từ dữ liệu. */
export interface ChiTietThuTuc {
  ma: string;
  ten: string;
  linhVuc: string;
  mucDo: MucDoThuTuc;
  coQuanThucHien: string | null;
  /** `null` = chưa ghi rõ; giao diện tự hiện câu "Chưa ghi rõ". */
  thoiHan: string | null;
  phi: string | null;
  hinhThucNop: string[];
  yeuCauDieuKien: string | null;
  trinhTu: { truongHop: string | null; noiDung: string }[];
  cachThuc: { hinhThuc: string | null; thoiHan: string | null; phi: string | null; moTa: string | null }[];
  thanhPhanHoSo: { ten: string; banChinh: number | null; banSao: number | null }[];
  ketQua: string[];
  canCu: { soKyHieu: string | null; trichYeu: string | null }[];
}

export const API_THU_TUC = '/api/thu-tuc';

/** Gốc khoá riêng, không trùng khoá danh mục (F04) để `invalidateQueries` bên đó không động tới chi tiết. */
export const GOC_KHOA_CHI_TIET = 'chi-tiet-thu-tuc';

export function khoaChiTietThuTuc(ma: string | null) {
  return [GOC_KHOA_CHI_TIET, ma] as const;
}

/** Mã đi vào đường dẫn qua `encodeURIComponent`. */
export function layChiTietThuTuc(ma: string, signal?: AbortSignal): Promise<ChiTietThuTuc> {
  return http<ChiTietThuTuc>(`${API_THU_TUC}/${encodeURIComponent(ma)}`, signal ? { signal } : {});
}

/**
 * Chi tiết một thủ tục cho popup; chỉ tải khi `ma` có giá trị và đúng định dạng (mã sai không gọi API).
 * 404 = không có thủ tục này: thử lại cũng vậy.
 */
export function useChiTietThuTuc(ma: string | null) {
  return useQuery({
    queryKey: khoaChiTietThuTuc(ma),
    queryFn: ma !== null && laMaHopLe(ma) ? ({ signal }) => layChiTietThuTuc(ma, signal) : skipToken,
    retry: (soLan, loi) => !(loi instanceof ApiError && loi.status === 404) && soLan < 1,
  });
}

/** Trả hàm nạp trước chi tiết (khi người dùng nhấn xuống hoặc nhận con trỏ ở "Xem chi tiết"). Mã sai định dạng bị bỏ qua. */
export function useNapTruocChiTiet(): (ma: string) => void {
  const client = useQueryClient();
  return useCallback(
    (ma: string) => {
      if (!laMaHopLe(ma)) return;
      void client.prefetchQuery({
        queryKey: khoaChiTietThuTuc(ma),
        queryFn: ({ signal }) => layChiTietThuTuc(ma, signal),
      });
    },
    [client],
  );
}
