import { phanLoaiLienKet } from '../utils/lienKet';

const TEN_MIEN_CONG_DVC = 'dichvucong.gov.vn';

/**
 * Đích thuộc Cổng DVC quốc gia (F09 BR-4): http(s), tên máy là `dichvucong.gov.vn` hoặc tên miền con của nó.
 * So khớp theo tên máy đã phân tích bằng `URL` (chữ thường, bỏ thông tin đăng nhập), không dò chuỗi con trên chuỗi thô.
 */
export function laLienKetCongDvc(href: string | null | undefined): boolean {
  const lienKet = phanLoaiLienKet(href);
  if (lienKet?.loai !== 'web') return false;
  // Tên miền đầy đủ có thể kết thúc bằng dấu chấm (`dichvucong.gov.vn.`): bỏ rồi mới so. `URL` đã chuyển chữ thường.
  const tenMay = new URL(lienKet.href).hostname.replace(/[.]+$/, '');
  return tenMay === TEN_MIEN_CONG_DVC || tenMay.endsWith(`.${TEN_MIEN_CONG_DVC}`);
}
