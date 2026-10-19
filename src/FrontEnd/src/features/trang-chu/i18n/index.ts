import { dangKyNamespace } from '../../../core/i18n';

/** Nạp câu chữ của tính năng; gọi trong `lazy` của route để đi cùng chunk nạp lười. */
export const napNgonNguTrangChu = () =>
  dangKyNamespace('trang-chu', { vi: () => import('./vi.json') });
