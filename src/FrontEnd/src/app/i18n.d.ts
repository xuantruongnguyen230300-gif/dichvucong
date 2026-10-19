// Kiểu cho khoá i18n. Thêm tính năng mới: thêm một dòng vào `resources` bên dưới.
import type common from '../core/i18n/vi/common.json';
import type chatbot from '../features/chatbot/i18n/vi.json';
import type kiosk from '../core/kiosk/i18n/vi.json';
import type danhMuc from '../features/danh-muc/i18n/vi.json';
import type linhVuc from '../features/linh-vuc/i18n/vi.json';
import type thuTuc from '../features/thu-tuc/i18n/vi.json';
import type trangChu from '../features/trang-chu/i18n/vi.json';
import type xemTruoc from './xem-truoc/i18n/vi.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      'danh-muc': typeof danhMuc;
      chatbot: typeof chatbot;
      kiosk: typeof kiosk;
      'linh-vuc': typeof linhVuc;
      'thu-tuc': typeof thuTuc;
      'trang-chu': typeof trangChu;
      'xem-truoc': typeof xemTruoc;
    };
  }
}
