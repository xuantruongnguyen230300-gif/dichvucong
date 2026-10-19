/**
 * Khoá trang, trùng khoá `common:trang.*`: dùng cho `handle.trang` của route. Thừa khoá so với `common.json` là lỗi `tsc`
 * (chỗ gọi `t()` với khoá ghép từ đây); thiếu khoá thì `duongDan.test.ts` báo.
 */
export type KhoaTrang = 'trang-chu' | 'danh-muc' | 'linh-vuc' | 'khong-tim-thay';

/** Đường dẫn các trang. Router, điều hướng, trang 404, plugin build và F04, F05 (liên kết, QR) cùng dùng. */
export const DUONG_DAN = {
  trangChu: '/',
  danhMuc: '/thu-tuc',
  linhVuc: '/linh-vuc',
} as const;

/** Trang có đường dẫn cố định (mọi trang trừ "không tìm thấy"). Plugin build ghép với câu chữ để phát `dac-ta-trang.json`. */
export const DUONG_DAN_THEO_TRANG: Record<Exclude<KhoaTrang, 'khong-tim-thay'>, string> = {
  'trang-chu': DUONG_DAN.trangChu,
  'danh-muc': DUONG_DAN.danhMuc,
  'linh-vuc': DUONG_DAN.linhVuc,
};
