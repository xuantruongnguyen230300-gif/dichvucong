/** Tên tham số trên địa chỉ mở popup chi tiết, vd. `/?ma=1.001193`. */
export const KHOA_MA = 'ma';

const MA_HOP_LE = /^[A-Za-z0-9._-]{1,20}$/;
const CHI_DAU_CHAM = /^\.+$/;

/**
 * Mã thủ tục lấy từ địa chỉ là đầu vào không tin cậy: chỉ mã đúng định dạng mới được dùng để gọi API.
 * Cùng quy tắc với BE (`^[A-Za-z0-9._-]{1,20}$`, 20 = độ dài tối đa của `thu_tuc.ma`),
 * trừ mã chỉ gồm dấu chấm (`.`, `..`): là đoạn đường dẫn đặc biệt, không phải mã thủ tục (F08 BR-10).
 */
export function laMaHopLe(ma: string): boolean {
  return MA_HOP_LE.test(ma) && !CHI_DAU_CHAM.test(ma);
}
