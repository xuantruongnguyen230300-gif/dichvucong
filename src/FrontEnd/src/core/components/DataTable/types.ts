import type { ReactNode } from 'react';
import type { CachXem } from '../../hooks/useCachXem';

export interface CotBang<T> {
  id: string;
  tieuDe: string;
  /** Nội dung ô; `stt` đếm trên cả danh sách, bắt đầu từ 1. */
  o: (dong: T, stt: number) => ReactNode;
  rong?: string; // gợi ý độ rộng, vd. '7rem'
  khongXuongDong?: boolean;
}

export interface DataTableProps<T> {
  duLieu: readonly T[]; // toàn bộ danh sách đã lọc, đúng thứ tự
  khoaDong: (dong: T) => string;
  cachXem: CachXem; // thường lấy từ useCachXem()
  /** Nên là mảng ổn định (khai ở ngoài component hoặc useMemo). */
  cot: readonly CotBang<T>[];
  renderCard: (dong: T, stt: number) => ReactNode;
  tieuDeBang: string; // <caption> ẩn + tên vùng cuộn
  soMucMoiTrang: number; // F03: 12, F04: 25
  trang: string | null; // số trang thô trên địa chỉ (useDanhSachUrl().trang)
  onDoiTrang: (so: number) => void;
  soCotToiDa?: number; // dạng thẻ; F03 = 4
}

/** Props của bảng thật (đã cắt trang). Chỉ BangDuLieu.tsx biết TanStack Table. */
export interface BangDuLieuProps<T> {
  dong: readonly T[]; // các dòng của trang hiện tại
  batDau: number; // số thứ tự của dòng đầu trang, trừ 1
  khoaDong: (dong: T) => string;
  cot: readonly CotBang<T>[];
  tieuDeBang: string;
}
