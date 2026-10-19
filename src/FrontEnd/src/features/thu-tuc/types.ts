/** Mức độ dịch vụ công; cùng giá trị với tham số `md` của danh mục (F04). */
export type MucDoThuTuc = 'toan-trinh' | 'mot-phan';

/**
 * Hình dạng tối thiểu của một thủ tục trong danh sách (thẻ, bảng, khối thường gặp).
 * `ThuTucDanhMuc` của F04 (`core/api/danhMucThuTuc.ts`) gán được vào đây nhờ so khớp cấu trúc.
 */
export interface MucThuTuc {
  ma: string;
  ten: string;
  /** Mã lĩnh vực: giá trị chip và tham số `lv` trên địa chỉ. */
  linhVucMa: string;
  /** TÊN lĩnh vực (tên trường theo `ThuTucDanhMuc.linhVuc` của core, để gán được theo cấu trúc). */
  linhVuc: string;
  mucDo: MucDoThuTuc;
  coQuanThucHien: string | null;
  /** `null` = chưa ghi rõ thời hạn. */
  thoiHan: string | null;
  thuTuThuongGap: number | null;
}
