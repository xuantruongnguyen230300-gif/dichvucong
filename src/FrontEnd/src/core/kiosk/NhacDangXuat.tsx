import { lazy, Suspense, type ReactNode } from 'react';
import { napGiaoDienKiosk } from './napGiaoDien';
import { useCheDoKiosk } from './useCheDoKiosk';

export interface NhacDangXuatProps {
  /**
   * Bỏ trống = nơi này chắc chắn có liên kết tới Cổng DVC → luôn hiện (danh sách thủ tục, popup).
   * Có mảng = chỉ hiện khi có ít nhất một đích thuộc Cổng DVC (ô dịch vụ, khung trợ lý).
   */
  cacLienKet?: readonly (string | null | undefined)[];
  /** Để nơi gọi chỉnh khoảng cách; dòng không tự có margin ngoài. */
  className?: string;
}

const NoiDung = lazy(() => napGiaoDienKiosk().then((m) => ({ default: m.NhacDangXuatNoiDung })));

/**
 * Dòng nhắc "Nhớ đăng xuất khi dùng xong" (F09 BR-4), chỉ ở chế độ kiosk. Vỏ nhỏ nằm trong bundle chính:
 * ngoài kiosk trả `null` trước khi chạm tới `lazy`, nên không tải byte nào của chunk kiosk.
 */
export function NhacDangXuat(props: NhacDangXuatProps): ReactNode {
  const laKiosk = useCheDoKiosk();
  if (!laKiosk) return null;
  return (
    <Suspense fallback={null}>
      <NoiDung {...props} />
    </Suspense>
  );
}
