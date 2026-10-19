import type { Page, Route } from '@playwright/test';

/** Gốc của bản đang kiểm (đặt E2E_BASE_URL để đổi). */
export const GOC = new URL(process.env.E2E_BASE_URL ?? 'https://localhost:7157').origin;

/** Các hàm dùng chung của bộ e2e F02/F03/F04 (tester). Không phụ thuộc mã nguồn ứng dụng. */

export const THE_AXE = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

export const MIEN_TRU =
  'Thông tin chỉ để tham khảo. Thành phần hồ sơ, thời hạn, phí chính thức căn cứ theo Cổng Dịch vụ công Quốc gia.';

export const KHONG_TIM_THAY_THU_TUC = 'Không tìm thấy thủ tục này. Thủ tục có thể đã đổi mã hoặc không còn áp dụng.';

/** Tên miền trong danh sách "Đã bỏ" của lien-ket.md §1. */
export const TEN_MIEN_DA_BO = ['motcua.tayninh.gov.vn', 'vbdh.tayninh.gov.vn', 'dichvucong.tayninh.gov.vn'];

/** Bỏ dấu tiếng Việt, chữ thường (như `chuanHoaTimKiem` của ứng dụng, viết độc lập để dựng dữ liệu thử). */
export function boDau(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function linkDvc(ma: string): string {
  return `https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach?keyword=${encodeURIComponent(ma)}&showAdvanced=false&formalityType=STANDARD&limit=10&activeKey=STANDARD`;
}

/** Gom lỗi console, lỗi trang chưa xử lý. Lỗi "Failed to load resource" do ca cố ý gây thì bỏ qua khi `boQuaTaiTaiNguyen`. */
export function theoDoiLoi(page: Page, boQuaTaiTaiNguyen = false): string[] {
  const loi: string[] = [];
  page.on('pageerror', (e) => loi.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (boQuaTaiTaiNguyen && m.text().includes('Failed to load resource')) return;
    loi.push(`console: ${m.text()}`);
  });
  return loi;
}

export async function themBatCsp(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __csp: string[] };
    w.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      w.__csp.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
}

export const layCsp = (page: Page) => page.evaluate(() => (window as unknown as { __csp: string[] }).__csp ?? []);

export const khongTranNgang = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

/** Hộp thoại (alert/confirm/prompt): gom vào mảng để kiểm không có. */
export function theoDoiHopThoai(page: Page): string[] {
  const ds: string[] = [];
  page.on('dialog', async (d) => {
    ds.push(d.message());
    await d.dismiss();
  });
  return ds;
}

/** Chặn mọi yêu cầu ra ngoài gốc của ứng dụng (không bao giờ gọi mạng thật): trả 200 rỗng và ghi lại địa chỉ. */
export async function chanMangNgoai(page: Page, goc: string): Promise<string[]> {
  const ds: string[] = [];
  // Route ở mức context để cả tab mới (window.open) cũng bị chặn.
  await page.context().route(
    (url) => url.origin !== goc && url.protocol.startsWith('http'),
    async (route: Route) => {
      ds.push(route.request().url());
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<title>ngoai</title>' });
    },
  );
  return ds;
}

/** Danh sách mọi yêu cầu mạng của trang (địa chỉ đầy đủ), theo thứ tự. */
export function ghiYeuCau(page: Page): string[] {
  const ds: string[] = [];
  page.on('request', (r) => ds.push(r.url()));
  return ds;
}

export const duongApi = (ds: string[]) => ds.filter((u) => new URL(u).pathname.startsWith('/api/'));

export async function datKhoLocal(page: Page, khoa: string, giaTri: string | null) {
  await page.addInitScript(
    ([k, v]) => {
      if (v === null) window.localStorage.removeItem(k!);
      else window.localStorage.setItem(k!, v);
    },
    [khoa, giaTri] as const,
  );
}

/** CSS giãn chữ theo WCAG 1.4.12. */
export const CSS_GIAN_CHU = '*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important}';

/**
 * Gắn CSS thử vào trang bằng constructable stylesheet: `page.addStyleTag` bị CSP `style-src 'self'` chặn
 * (đúng thiết kế), còn `adoptedStyleSheets` thì không.
 */
export async function ganCssThu(page: Page, css: string) {
  await page.evaluate((c) => {
    const bang = new CSSStyleSheet();
    bang.replaceSync(c);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, bang];
  }, css);
}
