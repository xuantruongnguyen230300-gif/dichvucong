import { napNgonNguKiosk } from './i18n';

/**
 * Chỗ DUY NHẤT nạp chunk giao diện kiosk và câu chữ của nó (nút "Bắt đầu lại", dòng nhắc đăng xuất).
 * Mọi nơi cần chunk này đều gọi hàm này để bundler gộp thành một chunk; chế độ thường không bao giờ gọi.
 */
export const napGiaoDienKiosk = () =>
  Promise.all([import('./giaoDienKiosk'), napNgonNguKiosk()]).then(([m]) => m);
