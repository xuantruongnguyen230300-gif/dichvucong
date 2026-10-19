import jsQR from 'jsqr';
import type { Locator, Page } from '@playwright/test';

/** Dữ liệu thử và hàm dùng chung của F05 (tester). Không phụ thuộc mã nguồn ứng dụng. */

export interface LinhVucThu {
  ma: string;
  ten: string;
  tenTimKiem: string;
  soThuTucXa: number;
  soThuTucTinh: number;
}

export interface QuayThu {
  linhVucMa: unknown;
  quay: unknown;
}

const boDau = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

export const lv = (ma: string, ten: string, xa: number, tinh: number): LinhVucThu => ({
  ma,
  ten,
  tenTimKiem: boDau(ten),
  soThuTucXa: xa,
  soThuTucTinh: tinh,
});

/** L8: bộ nhỏ có kiểm soát (testcases.md §0). */
export const L8: LinhVucThu[] = [
  lv('chan-nuoi', 'Chăn nuôi', 3, 2),
  lv('chung-thuc', 'Chứng thực', 4, 4),
  lv('dat-dai', 'Đất đai', 2, 6),
  lv('ho-tich', 'Hộ tịch', 5, 3),
  lv('linh-vuc-chi-tinh-thu-a', 'Lĩnh vực chỉ tỉnh thử A', 0, 3),
  lv('linh-vuc-chi-tinh-thu-b', 'Lĩnh vực chỉ tỉnh thử B', 0, 1),
  lv('nuoi-con-nuoi', 'Nuôi con nuôi', 2, 0),
  lv('quan-ly-dat-dai-thu', 'Quản lý đất đai thử', 1, 0),
];

/** L75: 75 lĩnh vực tên giả; số chia hết cho 4 (18 ô) chỉ cấp tỉnh. */
export const L75: LinhVucThu[] = Array.from({ length: 75 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return (i + 1) % 4 === 0
    ? lv(`linh-vuc-thu-${n}`, `Lĩnh vực thử ${n}`, 0, 2)
    : lv(`linh-vuc-thu-${n}`, `Lĩnh vực thử ${n}`, 2, 1);
});

export const LX: LinhVucThu[] = [
  lv('lx-1', '<img src=x onerror=alert(1)>', 1, 1),
  lv('lx-2', 'Thử <b>đậm</b> & "trích"', 1, 1),
];

export const LD_MA = `${'a-'.repeat(75)}`.slice(0, 150);
export const LD: LinhVucThu[] = [lv(LD_MA, 'x'.repeat(300), 1, 1)];

export async function traLinhVuc(page: Page, ds: unknown, trang = 200) {
  await page.route('**/api/linh-vuc', (r) => r.fulfill({ status: trang, contentType: 'application/json', json: ds }));
}

export async function traQuay(page: Page, ds: unknown, trang = 200) {
  await page.route('**/api/linh-vuc/quay', (r) => r.fulfill({ status: trang, contentType: 'application/json', json: ds }));
}

export const luoi = (p: Page) => p.getByRole('list', { name: 'Danh sách lĩnh vực' });
export const cacO = (p: Page) => luoi(p).locator('> li');
export const cacQr = (p: Page) => p.locator('svg[data-qr]');
export const oTim = (p: Page) => p.getByRole('searchbox', { name: 'Tìm lĩnh vực' });

/** Chờ mạng yên và thêm hai khung hình để IntersectionObserver và lazy chunk xong. */
export async function doiYen(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => new Promise<void>((xong) => requestAnimationFrame(() => requestAnimationFrame(() => xong()))));
  await page.waitForTimeout(150);
}

/** Số ô có ít nhất một phần trong khung nhìn (top < cao và bottom > 0). */
export function demODangThay(page: Page) {
  return page.evaluate(() => {
    const cao = window.innerHeight;
    return [...document.querySelectorAll('ul[aria-label="Danh sách lĩnh vực"] > li')].filter((li) => {
      const r = li.getBoundingClientRect();
      return r.top < cao && r.bottom > 0;
    }).length;
  });
}

/** Giải mã `<svg data-qr>` như camera: dựng ảnh điểm từ viewBox và path đang có trong DOM (nền trắng, ô đen). */
export async function giaiMaDom(svg: Locator): Promise<string | undefined> {
  const { vb, d } = await svg.evaluate((e) => ({
    vb: e.getAttribute('viewBox') ?? '',
    d: e.querySelector('path')?.getAttribute('d') ?? '',
  }));
  return giaiMaTuPath(vb, d);
}

const DIEM = 6;

export function giaiMaTuPath(vb: string, d: string): string | undefined {
  const [x0, y0, rong, cao] = vb.split(' ').map(Number) as [number, number, number, number];
  const w = rong * DIEM;
  const h = cao * DIEM;
  const px = new Uint8ClampedArray(w * h * 4).fill(255);
  for (const m of d.matchAll(/M(-?\d+) (-?\d+)h(\d+)v1h-\d+z/g)) {
    const x = Number(m[1]);
    const y = Number(m[2]);
    const dai = Number(m[3]);
    for (let py = (y - y0) * DIEM; py < (y - y0 + 1) * DIEM; py++) {
      for (let pxx = (x - x0) * DIEM; pxx < (x - x0 + dai) * DIEM; pxx++) {
        const i = (py * w + pxx) * 4;
        px[i] = px[i + 1] = px[i + 2] = 0;
      }
    }
  }
  return jsQR(px, w, h)?.data;
}

/**
 * Giải mã ảnh chụp thật của phần tử (PNG): trình duyệt giải PNG ra điểm ảnh, Node chạy jsQR.
 * Dùng cho vài ô mẫu (chứng minh cả CSS màu, kích thước hiển thị) vì phải chuyển điểm ảnh qua evaluate.
 */
export async function giaiMaAnhChup(page: Page, svg: Locator): Promise<string | undefined> {
  const png = await svg.screenshot({ type: 'png' });
  const b64 = png.toString('base64');
  const tho = await page.evaluate(async (b) => {
    const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
    const bm = await createImageBitmap(new Blob([bin], { type: 'image/png' }));
    const cv = document.createElement('canvas');
    cv.width = bm.width;
    cv.height = bm.height;
    const cx = cv.getContext('2d')!;
    cx.drawImage(bm, 0, 0);
    const dl = cx.getImageData(0, 0, bm.width, bm.height);
    let s = '';
    const u = dl.data;
    for (let i = 0; i < u.length; i += 4) s += String.fromCharCode(u[i]!);
    return { w: bm.width, h: bm.height, g: s };
  }, b64);
  const px = new Uint8ClampedArray(tho.w * tho.h * 4);
  for (let i = 0; i < tho.g.length; i++) {
    const v = tho.g.charCodeAt(i);
    px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v;
    px[i * 4 + 3] = 255;
  }
  return jsQR(px, tho.w, tho.h)?.data;
}

/** Cuộn từng màn hình tới cuối, trả số QR sau mỗi bước. */
export async function cuonTungManHinh(page: Page): Promise<number[]> {
  const soQr: number[] = [];
  const cao = await page.evaluate(() => window.innerHeight);
  for (let i = 0; i < 60; i++) {
    await doiYen(page);
    soQr.push(await cacQr(page).count());
    const het = await page.evaluate((c) => {
      const truoc = window.scrollY;
      window.scrollBy(0, c);
      return window.scrollY === truoc;
    }, cao);
    if (het) break;
  }
  await doiYen(page);
  soQr.push(await cacQr(page).count());
  return soQr;
}
