import { createContext, useContext } from 'react';

/**
 * Hàm mở popup chi tiết một thủ tục (`useMoThuTuc().mo` của F03). Khung đặt MỘT hàm ổn định vào đây,
 * để tin nhắn không phải vẽ lại mỗi khi địa chỉ trang đổi (vd. ô tìm ở trang đang gõ).
 */
export const MoThuTucContext = createContext<(ma: string) => void>(() => undefined);

export function useMoThuTucTuKhung(): (ma: string) => void {
  return useContext(MoThuTucContext);
}
