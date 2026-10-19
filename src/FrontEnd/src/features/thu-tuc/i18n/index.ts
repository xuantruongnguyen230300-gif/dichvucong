import { dangKyNamespace } from '../../../core/i18n';

let daNap: Promise<void> | null = null;
let daXong = false;

/**
 * Nạp câu chữ của tính năng. Nhớ promise: gọi nhiều lần chỉ nạp một lần và dùng được với `use()` của React
 * (cùng một promise qua các lần vẽ). Nạp lỗi thì quên đi để lần gọi sau thử lại.
 */
export function napNgonNguThuTuc(): Promise<void> {
  daNap ??= dangKyNamespace('thu-tuc', { vi: () => import('./vi.json') })
    .then(() => {
      daXong = true;
    })
    .catch((loi: unknown) => {
      daNap = null;
      throw loi;
    });
  return daNap;
}

/**
 * Câu chữ đã nạp xong chưa. Nơi gọi `use(napNgonNguThuTuc())` hỏi trước: `use` trên một promise đã xong nhưng React chưa theo dõi vẫn
 * làm Suspense hiện khung chờ một nhịp rồi mới hiện nội dung (chậm nửa giây ở lần vẽ đầu, nội dung nhảy chỗ).
 */
export const daNapNgonNguThuTuc = (): boolean => daXong;
