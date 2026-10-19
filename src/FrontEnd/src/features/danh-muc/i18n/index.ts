import { dangKyNamespace } from '../../../core/i18n';

let daNap: Promise<void> | null = null;

/**
 * Nạp câu chữ của danh mục thủ tục; gọi trong `lazy` của route để đi cùng chunk nạp lười.
 * Nhớ promise: gọi nhiều lần chỉ nạp một lần; nạp lỗi thì quên đi để lần sau thử lại.
 */
export function napNgonNguDanhMuc(): Promise<void> {
  daNap ??= dangKyNamespace('danh-muc', { vi: () => import('./vi.json') }).catch((loi: unknown) => {
    daNap = null;
    throw loi;
  });
  return daNap;
}
