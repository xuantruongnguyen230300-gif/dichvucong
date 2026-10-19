/**
 * "yyyy-MM-dd" → "dd/mm/yyyy". Tách chuỗi, không qua múi giờ trình duyệt (ngày đã là ngày Việt Nam).
 * Không đúng dạng → `null` để nơi gọi ẩn dòng thay vì hiện chữ lạ.
 */
export function dinhDangNgay(ngay: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ngay ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

const DINH_DANG_SO = new Intl.NumberFormat('vi-VN');

/** Số nguyên có dấu chấm ngăn nghìn kiểu Việt: 1000 thành "1.000". */
export function dinhDangSo(n: number): string {
  return DINH_DANG_SO.format(n);
}
