import { dangKyNamespace } from '../../i18n';

/** Nạp câu chữ của giao diện kiosk; đi cùng chunk `giaoDienKiosk` qua `napGiaoDienKiosk`. */
export const napNgonNguKiosk = () => dangKyNamespace('kiosk', { vi: () => import('./vi.json') });
