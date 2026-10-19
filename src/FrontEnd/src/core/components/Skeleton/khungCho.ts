import { useSyncExternalStore } from 'react';

/**
 * Đếm số khung chờ (`Skeleton`) đang hiện trên trang, để `Layout` ẩn chân trang trong lúc đó (CLS):
 * khung chờ thường ngắn hơn nội dung thật, chân trang đang nằm trong màn hình (màn hình cao, kiosk) sẽ bị đẩy đi khi dữ liệu về.
 * Chân trang chỉ hiện khi không còn khung chờ nào. Dùng cờ trạng thái thay vì `:has` để chạy cả ở Firefox < 121.
 * Khung chờ trong popup không tính (popup mở trên trang đã dựng, ẩn chân trang chỉ làm trang giật).
 */
let dem = 0;
const nguoiNghe = new Set<() => void>();

const thongBao = () => nguoiNghe.forEach((f) => f());

/** Báo có thêm một khung chờ; trả hàm báo gỡ. */
export function dangKyKhungCho(): () => void {
  dem += 1;
  thongBao();
  return () => {
    dem -= 1;
    thongBao();
  };
}

const dangKyNghe = (nghe: () => void) => {
  nguoiNghe.add(nghe);
  return () => nguoiNghe.delete(nghe);
};

/** Trang đang có ít nhất một khung chờ không. */
export function useCoKhungCho(): boolean {
  return useSyncExternalStore(
    dangKyNghe,
    () => dem > 0,
    () => false,
  );
}
