import { dangKyNamespace } from '../../../core/i18n';

let daNap: Promise<void> | null = null;
let daXong = false;

/**
 * Nạp câu chữ của lĩnh vực và mã QR; gọi trong `lazy` của route để đi cùng chunk nạp lười.
 * Nhớ promise: gọi nhiều lần chỉ nạp một lần; nạp lỗi thì quên đi để lần sau thử lại.
 */
export function napNgonNguLinhVuc(): Promise<void> {
  daNap ??= dangKyNamespace('linh-vuc', { vi: () => import('./vi.json') })
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
 * Câu chữ đã nạp xong chưa. Nơi gọi `use(napNgonNguLinhVuc())` hỏi trước: `use` trên một promise đã xong nhưng React chưa theo dõi vẫn
 * làm Suspense hiện khung chờ một nhịp rồi mới hiện nội dung (chậm nửa giây ở lần vẽ đầu, nội dung nhảy chỗ).
 */
export const daNapNgonNguLinhVuc = (): boolean => daXong;
