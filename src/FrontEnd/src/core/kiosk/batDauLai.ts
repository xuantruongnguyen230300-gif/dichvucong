import { DUONG_DAN } from '../duongDan';

/** Chỗ duy nhất gọi chuyển trang thật; test thay bằng spy. */
export const thaoTacTrinhDuyet = {
  diToi(url: string): void {
    window.location.replace(url);
  },
};

/**
 * "Bắt đầu lại" (F09 BR-7): tải lại trang chủ ở chế độ kiosk, xoá hết trạng thái trong bộ nhớ trang.
 * `location.replace` thay mục lịch sử hiện tại nên "Quay lại" không về trạng thái cũ. Đích là hằng cùng nguồn.
 * Không đụng `localStorage` (giữ thẻ/bảng, bật đọc) và `sessionStorage` (giữ cờ kiosk).
 * Chỉ nút trong `giaoDienKiosk` gọi hàm này; không có bộ đếm giờ nào gọi (BR-2).
 */
export function batDauLai(): void {
  document.body.hidden = true; // màn hình người trước biến mất ngay, không chờ trang mới
  try {
    window.speechSynthesis?.cancel(); // dừng đọc ngay (F07 BR-7)
  } catch {
    // trình duyệt không có giọng đọc
  }
  thaoTacTrinhDuyet.diToi(`${DUONG_DAN.trangChu}?kiosk=1`);
}
