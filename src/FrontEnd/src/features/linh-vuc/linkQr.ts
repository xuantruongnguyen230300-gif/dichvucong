import type { LinhVuc } from '../../core/api/linhVuc';
import { DUONG_DAN } from '../../core/duongDan';

export type CapLienKet = 'xa' | 'tinh';

/** `/thu-tuc?cap=xa&lv=ho-tich`: đường dẫn danh mục đã lọc lĩnh vực; mã qua `encodeURIComponent`. */
export function taoLinkDanhMuc(cap: CapLienKet, linhVucMa: string): string {
  return `${DUONG_DAN.danhMuc}?cap=${cap}&lv=${encodeURIComponent(linhVucMa)}`;
}

/**
 * Cấp mà lĩnh vực mở ra (BR-1): có thủ tục cấp xã thì 'xa', chỉ có thủ tục cấp tỉnh thì 'tinh'.
 * Liên kết của ô và mã QR dùng chung hàm này nên luôn mở cùng một cấp, quét ra không gặp danh sách rỗng.
 */
export function capCuaLinhVuc(l: Pick<LinhVuc, 'soThuTucXa'>): CapLienKet {
  return l.soThuTucXa > 0 ? 'xa' : 'tinh';
}

/** Địa chỉ đầy đủ để in trong QR. `goc` là tên miền đang mở trang (`window.location.origin`), không cấu hình riêng. */
export function taoLinkQr(goc: string, l: Pick<LinhVuc, 'ma' | 'soThuTucXa'>): string {
  return `${goc}${taoLinkDanhMuc(capCuaLinhVuc(l), l.ma)}`;
}
