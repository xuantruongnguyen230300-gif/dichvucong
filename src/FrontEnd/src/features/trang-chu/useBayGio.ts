import { useEffect, useState } from 'react';

/**
 * Thời điểm hiện tại, tự cập nhật mỗi `khoangMs` (mặc định 60 giây) và ngay khi tab hiện lại
 * (trình duyệt giảm tốc bộ đếm của tab ẩn). Kiosk không tải lại trang nên đây là cách giữ trạng thái giờ làm việc đúng.
 */
export function useBayGio(khoangMs = 60_000): Date {
  const [bayGio, datBayGio] = useState(() => new Date());

  useEffect(() => {
    const capNhat = () => datBayGio(new Date());
    const khiHienLai = () => {
      if (document.visibilityState === 'visible') capNhat();
    };
    const dongHo = setInterval(capNhat, khoangMs);
    document.addEventListener('visibilitychange', khiHienLai);
    return () => {
      clearInterval(dongHo);
      document.removeEventListener('visibilitychange', khiHienLai);
    };
  }, [khoangMs]);

  return bayGio;
}
