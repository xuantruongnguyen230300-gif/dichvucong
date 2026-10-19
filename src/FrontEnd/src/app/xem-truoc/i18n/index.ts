import { dangKyNamespace } from '../../../core/i18n';

/** Nạp câu chữ của trang xem trước; gọi trong `lazy` của route để đi cùng chunk nạp lười. */
export const napNgonNguXemTruoc = () => dangKyNamespace('xem-truoc', { vi: () => import('./vi.json') });
