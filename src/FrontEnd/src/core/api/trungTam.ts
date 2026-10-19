import { useQuery } from '@tanstack/react-query';
import { ApiError, http } from './http';

/** Hợp đồng `GET /api/trung-tam` (F08 plan §3.1). Chữ hiện ra nguyên văn từ dữ liệu, không tự ghép thêm. */
export type BieuTuongODichVu =
  | 'boc-so'
  | 'danh-gia'
  | 'tra-cuu-ho-so'
  | 'thanh-toan'
  | 'cong-dvc'
  | 'cong-thong-tin'
  | 'lien-ket';

export interface ThongTinTrungTam {
  ten: string;
  xa: string | null;
  tinh: string | null;
  coQuanChuQuan: string | null;
  nguoiChiuTrachNhiem: string;
  chucVuNguoiChiuTrachNhiem: string | null;
  diaChi: string;
  dienThoai: string;
  email: string;
  banDo: string | null;
  mangXaHoi: { zaloOa: string | null; facebook: string | null; youTube: string | null; tikTok: string | null };
  lienKet: { ten: string; url: string }[];
  oDichVu: { ten: string; bieuTuong: BieuTuongODichVu; url: string | null }[];
  /** `thu`: 1 = Thứ Hai … 7 = Chủ nhật; giờ dạng "HH:mm". */
  gioLamViec: { thu: number; sangTu: string | null; sangDen: string | null; chieuTu: string | null; chieuDen: string | null }[];
  ghiChuNgayNghi: string | null;
  /** Ngày Việt Nam, dạng "yyyy-MM-dd". */
  ngayCapNhatThuTuc: string | null;
}

export const API_TRUNG_TAM = '/api/trung-tam';
export const KHOA_TRUNG_TAM = ['trung-tam'] as const;

export function layThongTinTrungTam(signal?: AbortSignal): Promise<ThongTinTrungTam> {
  return http<ThongTinTrungTam>(API_TRUNG_TAM, signal ? { signal } : {});
}

/**
 * Dữ liệu Trung tâm dùng chung cho đầu trang, chân trang, ô dịch vụ, giờ làm việc và số điện thoại của thông báo lỗi.
 * Mọi nơi dùng chung một khoá nên chỉ có một yêu cầu cho mỗi lần mở trang.
 */
export function useThongTinTrungTam() {
  return useQuery({
    queryKey: KHOA_TRUNG_TAM,
    queryFn: ({ signal }) => layThongTinTrungTam(signal),
    // 404 = chưa nhập dữ liệu Trung tâm lần nào: thử lại cũng vậy
    retry: (soLan, loi) => !(loi instanceof ApiError && loi.status === 404) && soLan < 1,
  });
}
