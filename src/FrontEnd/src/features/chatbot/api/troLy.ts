import { useQuery } from '@tanstack/react-query';
import { http } from '../../../core/api/http';
import type { ThongTinTrungTam } from '../../../core/api/trungTam';
import type { ChiTietThuTuc } from '../../thu-tuc/api/chiTietThuTuc';

/**
 * Hợp đồng `POST /api/tro-ly/hoi`, `POST /api/tro-ly/chu-de`, `GET /api/tro-ly/chu-de` (F06 plan §3.2, §3.3).
 * Chữ hiện ra nguyên văn từ dữ liệu; câu khuôn mẫu nằm ở `i18n/vi.json`.
 */
export type MucThuTuc = 'thoi-han' | 'ho-so' | 'phi' | 'noi-nop' | 'trinh-tu' | 'ket-qua' | 'can-cu';
export type MucTrungTam = 'dia-chi' | 'gio-lam-viec' | 'dien-thoai' | 'email' | 'nop-truc-tuyen';

export interface ThuTucNgan {
  ma: string;
  ten: string;
  linhVuc: string;
  mucDo: 'toan-trinh' | 'mot-phan';
  capXa: boolean;
  capTinh: boolean;
}
export interface TrungTamNgan {
  ten: string;
  diaChi: string;
}
export interface LienHeTroLy {
  dienThoai: string;
  /** Có giá trị thì mới có nút Zalo (BR-10). */
  zaloOa: string | null;
}
export interface CanBo {
  hoTen: string;
  xungHo: string | null;
  chucVu: string | null;
  quay: number | null;
  moTa: string | null;
}
export interface ChuDeGoiY {
  thuTu: number;
  tenHienThi: string;
}

export interface NoiDungMuc {
  thoiHan: string | null;
  phi: string | null;
  hinhThucNop: string[] | null;
  thanhPhanHoSo: ChiTietThuTuc['thanhPhanHoSo'] | null;
  trinhTu: ChiTietThuTuc['trinhTu'] | null;
  ketQua: string[] | null;
  canCu: ChiTietThuTuc['canCu'] | null;
  /** Tổng số phần tử của danh sách đã bị cắt bớt; `null` = không cắt. */
  tong: number | null;
}

export interface ThongTinTrungTamMuc {
  /** `false` = mục được hỏi chưa có dữ liệu: hiện "chưa có thông tin" và nút gọi, không đoán. */
  coDuLieu: boolean;
  diaChi: string | null;
  banDo: string | null;
  gioLamViec: ThongTinTrungTam['gioLamViec'] | null;
  ghiChuNgayNghi: string | null;
  dienThoai: string | null;
  email: string | null;
  lienKet: ThongTinTrungTam['lienKet'][number] | null;
}

interface Chung {
  /** Mã thủ tục để gửi kèm câu kế tiếp. Luôn gán lại state bằng giá trị này. */
  thuTucDangNoi: string | null;
}

export type CauTraLoi =
  | (Chung & {
      loai: 'thu-tuc';
      muc: MucThuTuc;
      thuTuc: ThuTucNgan;
      thuTucKhac: ThuTucNgan[];
      noiDung: NoiDungMuc;
      quay: number | null;
      noiTiepNhanChuyen: string | null;
      trungTam: TrungTamNgan | null;
    })
  | (Chung & { loai: 'thu-tuc-danh-sach'; danhSachThuTuc: ThuTucNgan[] })
  | (Chung & {
      loai: 'chu-de';
      chuDe: { tenHienThi: string; linhVuc: string };
      tong: number;
      danhSachThuTuc: ThuTucNgan[];
      quay: number | null;
      noiTiepNhanChuyen: string | null;
      trungTam: TrungTamNgan | null;
    })
  | (Chung & { loai: 'cau-hoi-mau'; traLoi: string; danhSachThuTuc: ThuTucNgan[] })
  | (Chung & { loai: 'trung-tam'; muc: MucTrungTam; thongTin: ThongTinTrungTamMuc; lienHe: LienHeTroLy | null })
  | (Chung & {
      loai: 'quay';
      muc: 'quay' | 'can-bo';
      linhVuc: string | null;
      quay: number | null;
      noiTiepNhanChuyen: string | null;
      canBo: CanBo[];
      tong: number;
      trungTam: TrungTamNgan | null;
    })
  | (Chung & { loai: 'khong-hieu'; lienHe: LienHeTroLy | null });

export const API_TRO_LY = '/api/tro-ly';
export const KHOA_CHU_DE = ['tro-ly', 'chu-de'] as const;

/**
 * Hỏi một câu. Gọi `http()` trực tiếp, KHÔNG qua TanStack Query: câu hỏi có thể chứa thông tin cá nhân,
 * không được nằm trong bộ nhớ đệm (kiosk dùng chung; F06 plan §3.3, §8). Câu nằm trong body, không lên địa chỉ.
 */
export function hoiTroLy(cauHoi: string, maThuTuc: string | null, signal?: AbortSignal): Promise<CauTraLoi> {
  return http<CauTraLoi>(`${API_TRO_LY}/hoi`, { method: 'POST', body: { cauHoi, maThuTuc }, ...(signal ? { signal } : {}) });
}

/** Bấm một chủ đề gợi ý (BR-11). `thuTu` là thứ tự của chủ đề trong `GET /chu-de`. */
export function hoiChuDe(thuTu: number, maThuTuc: string | null, signal?: AbortSignal): Promise<CauTraLoi> {
  return http<CauTraLoi>(`${API_TRO_LY}/chu-de`, {
    method: 'POST',
    body: { thuTu, maThuTuc },
    ...(signal ? { signal } : {}),
  });
}

/**
 * Chip chủ đề gợi ý. Chỉ tải khi khung đang mở; `staleTime: 0` nên mỗi lần mở lại khung là một yêu cầu có điều kiện
 * (ETag, 304 không thân) để dữ liệu mới nhập hiện ngay (AC-25). Lỗi tải: người gọi ẩn khu vực chủ đề, không báo lỗi.
 */
export function useChuDeGoiY(mo: boolean) {
  return useQuery({
    queryKey: KHOA_CHU_DE,
    queryFn: ({ signal }) => http<ChuDeGoiY[]>(`${API_TRO_LY}/chu-de`, { signal }),
    enabled: mo,
    staleTime: 0,
    retry: false,
  });
}
