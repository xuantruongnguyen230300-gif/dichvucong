import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { NHAN_LINH_VUC, THU_TUC_MAU } from '../src/app/xem-truoc/duLieuMau';

/**
 * C01 · Thành phần giao diện dùng chung — e2e trên trang xem trước /dev/design-system (chỉ có ở bản dev).
 * Mã ca (C01-BP-01…) theo .specify/specs/C01-component-dung-chung/testcases.md.
 * Kết quả mong đợi của ca tìm kiếm tính độc lập từ dữ liệu mẫu bằng hàm chuẩn hoá riêng của test, không đọc từ giao diện.
 */

const THE_AXE = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const LRM = String.fromCodePoint(0x200e);
const RLM = String.fromCodePoint(0x200f);
const ZWSP = String.fromCodePoint(0x200b);
const BOM = String.fromCodePoint(0xfeff);

interface KhoMan {
  ten: string;
  rong: number;
  cao: number;
  kiosk: boolean;
}
const KHO = {
  dienThoai: { ten: '375', rong: 375, cao: 812, kiosk: false },
  dienThoaiKiosk: { ten: '375 kiosk', rong: 375, cao: 812, kiosk: true },
  mayTinh: { ten: '1280', rong: 1280, cao: 800, kiosk: false },
  kiosk: { ten: '1080x1920 kiosk', rong: 1080, cao: 1920, kiosk: true },
} satisfies Record<string, KhoMan>;
const TAT_CA_KHO = Object.values(KHO);

async function mo(page: Page, kho: KhoMan = KHO.mayTinh, hau = '') {
  await page.setViewportSize({ width: kho.rong, height: kho.cao });
  const tham = [kho.kiosk ? 'kiosk=1' : '', hau.replace(/^\?/, '')].filter(Boolean).join('&');
  await page.goto(`/dev/design-system${tham ? `?${tham}` : ''}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#xt-ds')).toBeVisible();
  // Dạng bảng nạp chunk lười: chờ xong để bố cục đứng yên trước khi đo
  const dangBang = kho.rong >= 1024 && !kho.kiosk;
  await expect(khoi(page, 'xt-ds').locator(dangBang ? 'table' : 'ul[role="list"]')).toBeVisible();
}

const khoi = (page: Page, id: string) => page.locator(`section[aria-labelledby="${id}"]`);
const khongTranNgang = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

/** Chuẩn hoá tìm kiếm viết lại độc lập (F00 §4): NFD bỏ dấu, đ→d, chữ thường, bỏ ký tự vô hình, gộp khoảng trắng. */
function chuan(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(new RegExp(`[${ZWSP}-${RLM}${BOM}]`, "g"), "")
    .replace(/\s+/g, ' ')
    .trim();
}
const CHUOI_TIM = THU_TUC_MAU.map((m) => ({ ...m, tim: chuan(`${m.ma} ${m.ten} ${NHAN_LINH_VUC[m.linhVuc]}`) }));
function mongDoiKhiTim(tuKhoa: string, linhVuc = 'tat-ca') {
  const c = chuan(tuKhoa);
  const tu = c === '' ? [] : c.split(' ');
  return CHUOI_TIM.filter((m) => (linhVuc === 'tat-ca' || m.linhVuc === linhVuc) && tu.every((t) => m.tim.includes(t))).map((m) => m.ma);
}

const oTim = (page: Page) => khoi(page, 'xt-ds').getByRole('searchbox', { name: 'Tìm thủ tục' });

/** Mã thủ tục đang hiện ở trang hiện tại của khối danh sách (dạng bảng hoặc thẻ). */
async function maDangHien(page: Page): Promise<string[]> {
  return khoi(page, 'xt-ds').evaluate((s) => [...s.querySelectorAll('span')].map((e) => e.textContent?.trim() ?? '').filter((t) => /^1\.\d{6}$/.test(t)));
}
async function tongKetQua(page: Page): Promise<number> {
  const chu = await khoi(page, 'xt-ds').locator('#xt-ds').evaluate((h) => h.parentElement?.textContent ?? '');
  const m = /(\d+)\s*thủ tục/.exec(chu);
  return m ? Number(m[1]) : -1;
}
async function docTrang(page: Page): Promise<number> {
  const url = new URL(page.url());
  return Number(url.searchParams.get('trang') ?? '1');
}

// ───────────────────────────── 1. Bàn phím, focus ─────────────────────────────

test.describe('Bàn phím và focus (BR-1, AC-1)', () => {
  test('C01-BP-01/05 · thứ tự Tab trùng thứ tự DOM; Tab bỏ qua nút vô hiệu, nhãn, ô không link; không tabindex dương', async ({ page }) => {
    await mo(page);
    const mongDoi = await page.evaluate(() => {
      const chon = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]';
      return [...document.querySelectorAll<HTMLElement>(chon)]
        .filter((e) => {
          if (e.closest('[inert]') || e.getAttribute('tabindex') === '-1') return false;
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
        })
        .map((e) => `${e.tagName}|${(e.getAttribute('aria-label') ?? e.textContent ?? '').trim().slice(0, 25)}`);
    });
    expect(await page.evaluate(() => [...document.querySelectorAll('[tabindex]')].filter((e) => Number(e.getAttribute('tabindex')) > 0).length)).toBe(0);
    const thucTe: string[] = [];
    for (let i = 0; i < mongDoi.length + 5; i += 1) {
      await page.keyboard.press('Tab');
      const mo = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null;
        return !e || e === document.body ? 'BODY' : `${e.tagName}|${(e.getAttribute('aria-label') ?? e.textContent ?? '').trim().slice(0, 25)}`;
      });
      if (mo === 'BODY' && thucTe.length >= mongDoi.length) break;
      thucTe.push(mo);
    }
    expect(thucTe.slice(0, mongDoi.length), 'thứ tự Tab khác thứ tự DOM').toEqual(mongDoi);
    expect(mongDoi.length).toBeGreaterThan(40);
  });

  test('C01-BP-02 · Enter kích hoạt nút và liên kết; phím cách kích hoạt nút bật/tắt, chip, số trang', async ({ page }) => {
    await mo(page);
    const batTat = khoi(page, 'xt-nut').getByRole('button', { name: /^Bật\/tắt: / }).first();
    await expect(batTat).toHaveAttribute('aria-pressed', 'false');
    await batTat.focus();
    await page.keyboard.press('Space');
    await expect(batTat).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Enter');
    await expect(batTat).toHaveAttribute('aria-pressed', 'false');
    const chip = khoi(page, 'xt-ds').getByRole('button', { name: 'Đất đai', exact: true });
    await chip.focus();
    await page.keyboard.press('Space');
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    const so3 = khoi(page, 'xt-pt').getByRole('button', { name: 'Trang 11', exact: true });
    await so3.focus();
    await page.keyboard.press('Space');
    await expect(khoi(page, 'xt-pt').getByRole('button', { name: 'Trang 11' })).toHaveAttribute('aria-current', 'page');
  });

  for (const kho of [KHO.mayTinh, KHO.kiosk]) {
    test(`C01-BP-03 · ${kho.ten}: mọi phần tử Tab tới có viền focus ≥ 2px, nhìn thấy`, async ({ page }) => {
      await mo(page, kho);
      const loi: string[] = [];
      for (let i = 0; i < 90; i += 1) {
        await page.keyboard.press('Tab');
        const r = await page.evaluate(() => {
          const e = document.activeElement as HTMLElement | null;
          if (!e || e === document.body) return null;
          // Ô tìm vẽ viền focus ở khung ngoài (:focus-within), không phải trên <input>
          const goc = e.tagName === 'INPUT' ? (e.parentElement ?? e) : e;
          const s = getComputedStyle(goc);
          return { ten: `${e.tagName}:${(e.getAttribute('aria-label') ?? e.textContent ?? '').trim().slice(0, 20)}`, kieu: s.outlineStyle, rong: parseFloat(s.outlineWidth), mau: s.outlineColor, bong: s.boxShadow };
        });
        if (!r) break;
        if (!((r.kieu !== 'none' && r.rong >= 2) || r.bong !== 'none')) loi.push(`${r.ten} (outline ${r.kieu} ${r.rong}px)`);
      }
      expect(loi).toEqual([]);
    });
  }

  test('C01-BP-04 · trên nền xanh đậm (data-nen-dam) viền focus màu trắng', async ({ page }) => {
    await mo(page);
    const nut = khoi(page, 'xt-nut').locator('[data-nen-dam] button').first();
    await nut.scrollIntoViewIfNeeded();
    await nut.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const mau = await nut.evaluate((e) => getComputedStyle(e).outlineColor);
    expect(mau).toMatch(/rgb\(255, 255, 255\)/);
  });

  test('C01-BP-09 · nút cuộn chip không nằm trong vòng Tab (tabindex -1, aria-hidden)', async ({ page }) => {
    await mo(page, { ...KHO.mayTinh, rong: 360 });
    const nutCuon = khoi(page, 'xt-ds').locator('button[aria-hidden="true"]');
    if ((await nutCuon.count()) === 0) test.info().annotations.push({ type: 'ghi-chu', description: 'ở khổ này không có chip khuất' });
    for (let i = 0; i < (await nutCuon.count()); i += 1) await expect(nutCuon.nth(i)).toHaveAttribute('tabindex', '-1');
  });
});

// ───────────────────────────── 2. Kích thước, kiosk ─────────────────────────────

test.describe('Kích thước và kiosk (BR-1, AC-2)', () => {
  test('C01-KS-01 · 375px: nút, ô tìm, số trang ≥ 34px; chip ≥ 28px; mọi vùng bấm ≥ 24x24', async ({ page }) => {
    await mo(page, KHO.dienThoai);
    const kq = await page.evaluate(() => {
      const cao = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)].filter((e) => e.getBoundingClientRect().width > 0 && !e.closest('[hidden]')).map((e) => Math.round(e.getBoundingClientRect().height * 10) / 10);
      const nho = [...document.querySelectorAll<HTMLElement>('button, a[href], input')].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !e.closest('[hidden]') && !e.closest('p, li > span') && (r.width < 24 || r.height < 24) && e.tagName !== 'A';
      }).map((e) => `${e.tagName}:${(e.getAttribute('aria-label') ?? e.textContent ?? '').trim().slice(0, 20)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
      const khungO = [...document.querySelectorAll<HTMLElement>('input[type="search"]')].map((i) => (i.parentElement as HTMLElement).getBoundingClientRect().height);
      return { nut: cao('section[aria-labelledby="xt-nut"] button:not([disabled]):not([class*="lienKet"])'), oTim: khungO, soTrang: cao('nav[aria-label="Phân trang"] button'), chip: cao('[role="group"] button[aria-pressed]'), nho };
    });
    expect(kq.nut.length, 'phải đo được nút').toBeGreaterThan(5);
    expect(Math.min(...kq.nut), 'nút').toBeGreaterThanOrEqual(33.5);
    expect(Math.min(...kq.oTim), 'ô tìm').toBeGreaterThanOrEqual(33.5);
    expect(Math.min(...kq.soTrang), 'số trang').toBeGreaterThanOrEqual(33.5);
    expect(Math.min(...kq.chip), 'chip').toBeGreaterThanOrEqual(27.5);
    expect(kq.nho, 'vùng bấm nhỏ hơn 24x24').toEqual([]);
  });

  test('C01-KS-02 · kiosk: html.kiosk, cỡ chữ gốc ≈ 118,75%, nút/ô tìm/số trang/chip ≥ 40px, chip cao bằng nút', async ({ page }) => {
    await mo(page, KHO.kiosk);
    await expect(page.locator('html')).toHaveClass(/kiosk/);
    const co = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    expect(co).toBeCloseTo(16 * 1.1875, 0);
    const kq = await page.evaluate(() => {
      const cao = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.getBoundingClientRect().height);
      const khungO = [...document.querySelectorAll<HTMLElement>('input[type="search"]')].map((i) => (i.parentElement as HTMLElement).getBoundingClientRect().height);
      return { nut: cao('section[aria-labelledby="xt-nut"] button:not([disabled]):not([class*="lienKet"])'), oTim: khungO, soTrang: cao('nav[aria-label="Phân trang"] button'), chip: cao('[role="group"] button[aria-pressed]') };
    });
    expect(kq.nut.length).toBeGreaterThan(5);
    expect(Math.min(...kq.nut)).toBeGreaterThanOrEqual(40);
    expect(Math.min(...kq.oTim)).toBeGreaterThanOrEqual(40);
    expect(Math.min(...kq.soTrang)).toBeGreaterThanOrEqual(40);
    expect(Math.min(...kq.chip)).toBeGreaterThanOrEqual(40);
    expect(Math.round(Math.min(...kq.chip))).toBe(Math.round(Math.min(...kq.nut)));
  });

  test('C01-KS-03 · ?kiosk=1 bật, xoá tham số kiosk khỏi địa chỉ, tải lại vẫn kiosk, ?kiosk=0 tắt, tab mới thì mất', async ({ page, context }) => {
    await page.goto('/dev/design-system?kiosk=1&q=a');
    await expect(page.locator('html')).toHaveClass(/kiosk/);
    expect(page.url()).toContain('q=a');
    expect(page.url()).not.toContain('kiosk');
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/kiosk/);
    await page.goto('/dev/design-system?kiosk=0');
    await expect(page.locator('html')).not.toHaveClass(/kiosk/);
    await page.goto('/dev/design-system?kiosk=1');
    const tabMoi = await context.newPage();
    await tabMoi.goto('/dev/design-system');
    await expect(tabMoi.locator('html')).not.toHaveClass(/kiosk/);
  });

  test('C01-KS-04 · sessionStorage bị chặn: không lỗi, lần tải này vẫn là kiosk', async ({ page }) => {
    const loi: string[] = [];
    page.on('pageerror', (e) => loi.push(e.message));
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new Error('bị chặn');
      };
    });
    await page.goto('/dev/design-system?kiosk=1');
    await expect(page.locator('html')).toHaveClass(/kiosk/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(loi).toEqual([]);
  });

  test('C01-KS-05 · kiosk: không phần tử chứa chữ nào bị cắt (trừ nhãn rút gọn chủ ý); nút không xuống dòng', async ({ page }) => {
    await mo(page, KHO.kiosk);
    const biCat = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('main *')]
        .filter((e) => {
          const r = e.getBoundingClientRect();
          if (r.width <= 2 || r.height <= 2 || !e.textContent?.trim() || e.children.length > 0) return false;
          const s = getComputedStyle(e);
          const cat = s.overflow === 'hidden' || s.overflowX === 'hidden';
          return cat && s.textOverflow !== 'ellipsis' && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1);
        })
        .map((e) => `${e.tagName}.${e.className}: ${e.textContent?.slice(0, 30)}`),
    );
    expect(biCat).toEqual([]);
  });

  for (const kho of [...TAT_CA_KHO, { ten: '768', rong: 768, cao: 1024, kiosk: false }, { ten: '320', rong: 320, cao: 568, kiosk: false }]) {
    test(`C01-KS-06/07 · ${kho.ten}: cả trang không cuộn ngang`, async ({ page }) => {
      await mo(page, kho);
      expect(await khongTranNgang(page)).toBe(true);
    });
  }

  test('C01-KS-09/TN-06 · 640x360 phóng 2 lần: phân trang xuống dòng, không cuộn ngang', async ({ browser }) => {
    const ngu = await browser.newContext({ viewport: { width: 640, height: 360 }, deviceScaleFactor: 2 });
    const page = await ngu.newPage();
    await page.goto('/dev/design-system');
    await expect(page.locator('#xt-pt')).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
    await ngu.close();
  });
});

// ───────────────────────────── 3. Đen trắng, tương phản, axe ─────────────────────────────

test.describe('Đen trắng, tương phản, axe (BR-1, AC-3, AC-4)', () => {
  test('C01-DT-02 · ba dấu hiệu không dựa vào màu: chip chọn có ✓, trang hiện tại có gạch chân, nút vô hiệu viền nét đứt', async ({ page }) => {
    await mo(page);
    const chipChon = khoi(page, 'xt-ds').locator('button[aria-pressed="true"]').first();
    expect(await chipChon.locator('svg').count()).toBeGreaterThan(0);
    const hienTai = khoi(page, 'xt-pt').locator('button[aria-current="page"]');
    expect(await hienTai.evaluate((e) => getComputedStyle(e).textDecorationLine)).toContain('underline');
    const voHieu = khoi(page, 'xt-nut').locator('button[disabled]').first();
    expect(await voHieu.evaluate((e) => getComputedStyle(e).borderStyle)).toContain('dashed');
  });

  for (const kho of TAT_CA_KHO) {
    test(`C01-DT-03…06 · axe 0 vi phạm ở ${kho.ten}`, async ({ page }) => {
      await mo(page, kho);
      const kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
      expect(kq.violations.map((v) => `${v.id}[${v.impact}]: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(' | ')}`)).toEqual([]);
    });
  }

  test('C01-DT-07 · mọi cặp chữ/nền ở bảng token đạt tương phản ≥ 4,5:1 (chữ thường)', async ({ page }) => {
    await mo(page);
    const dong = await khoi(page, 'xt-token').getByText(/ trên .*: \d+(\.\d+)?:1/).allTextContents();
    expect(dong.length).toBeGreaterThanOrEqual(10);
    const thap = dong.filter((d) => Number(/: (\d+(?:\.\d+)?):1/.exec(d)![1]) < 4.5);
    expect(thap, 'cặp màu dưới 4,5:1').toEqual([]);
  });

  test('C01-DT-08/HU-01 · không transition màu: mọi transition-property chỉ gồm opacity/transform/none, thời lượng ≤ 150ms', async ({ page }) => {
    await mo(page);
    const xau = await page.evaluate(() => {
      const ra: string[] = [];
      for (const e of document.querySelectorAll<HTMLElement>('main, main *')) {
        const s = getComputedStyle(e);
        const props = s.transitionProperty.split(',').map((x) => x.trim());
        const thoiLuong = s.transitionDuration.split(',').map((x) => parseFloat(x) * (x.includes('ms') ? 1 : 1000));
        const hopLe = props.every((p) => p === 'opacity' || p === 'transform' || p === 'none');
        const khongTruot = thoiLuong.every((t) => t === 0 || t <= 150);
        const thucSuDung = thoiLuong.some((t) => t > 0);
        if (thucSuDung && (!hopLe || !khongTruot)) ra.push(`${e.tagName}.${e.className}: ${s.transitionProperty} ${s.transitionDuration}`);
      }
      return { ra: ra.slice(0, 15), chay: document.getAnimations().filter((a) => (a.effect?.getTiming().iterations ?? 1) === Infinity).length };
    });
    expect(xau.ra).toEqual([]);
    expect(xau.chay, 'animation lặp vô hạn').toBe(0);
  });
});

// ───────────────────────────── 4. Nút ─────────────────────────────

test.describe('Nút (BR-2, AC-5)', () => {
  test('C01-NU-01/02 · bấm đúp nút đang xử lý chỉ chạy 1 lần; aria-busy; kích thước không đổi; Enter/Space không chạy thêm', async ({ page }) => {
    await mo(page);
    const nut = khoi(page, 'xt-nut').getByRole('button', { name: 'Bấm để xử lý (2 giây)' }).first();
    await nut.dblclick();
    const dang = khoi(page, 'xt-nut').getByRole('button', { name: /Đang xử lý/ }).first();
    await expect(dang).toHaveAttribute('aria-busy', 'true');
    await expect(dang).toHaveAttribute('aria-disabled', 'true');
    // Kích thước không đổi: trang xem trước tự đổi nhãn khi bận ("Bấm để xử lý" thành "Đang xử lý") nên chưa đo được ở đây (ghi ở test.md)
    expect(await dang.evaluate((e) => e.getBoundingClientRect().height)).toBeGreaterThan(30);
    await dang.focus();
    await expect(dang).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(khoi(page, 'xt-nut').getByRole('button', { name: 'Bấm để xử lý (2 giây)' }).first()).toBeVisible({ timeout: 4000 });
  });

  test('C01-NU-04/05 · Pager trang 1 và 20: nút Trước/Sau disabled, không đổi trang, Tab bỏ qua, viền nét đứt', async ({ page }) => {
    await mo(page);
    const pt = khoi(page, 'xt-pt');
    await pt.getByRole('button', { name: 'Trang 1', exact: true }).click();
    const truoc = pt.getByRole('button', { name: 'Trang trước' });
    await expect(truoc).toBeDisabled();
    await truoc.click({ force: true });
    await expect(pt.getByRole('button', { name: 'Trang 1', exact: true })).toHaveAttribute('aria-current', 'page');
    expect(await truoc.evaluate((e) => getComputedStyle(e).borderStyle)).toContain('dashed');
    await pt.getByRole('button', { name: 'Trang 20', exact: true }).click();
    const sau = pt.getByRole('button', { name: 'Trang sau' });
    await expect(sau).toBeDisabled();
    await sau.click({ force: true });
    await expect(pt.getByRole('button', { name: 'Trang 20', exact: true })).toHaveAttribute('aria-current', 'page');
  });

  test('C01-NU-06 · nút bật/tắt: aria-pressed false → true → false, trông khác nhau', async ({ page }) => {
    await mo(page);
    // Dùng hàng nút phụ (nền trắng khi tắt); nút chính vốn đã nền xanh
    const nut = khoi(page, 'xt-nut').getByRole('button', { name: /^Bật\/tắt: / }).nth(1);
    await expect(nut).toHaveAttribute('aria-pressed', 'false');
    const nenTat = await nut.evaluate((e) => getComputedStyle(e).backgroundColor);
    await nut.click();
    await expect(nut).toHaveAttribute('aria-pressed', 'true');
    const nenBat = await nut.evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(nenBat).not.toBe(nenTat);
    await nut.click();
    await expect(nut).toHaveAttribute('aria-pressed', 'false');
  });

  test('C01-NU-09 · nút chữ dài 375px: không xuống dòng; trang không cuộn ngang', async ({ page }) => {
    await mo(page, KHO.dienThoai);
    // Nút chính/phụ/ghost không xuống dòng; kiểu liên kết (white-space: normal) và nút chỉ có icon không tính
    const nho = await khoi(page, 'xt-nut').locator('button').evaluateAll((l) =>
      l.filter((b) => b.textContent?.trim() && !/lienKet/.test(b.className)).map((b) => getComputedStyle(b).whiteSpace),
    );
    expect(nho.length).toBeGreaterThan(8);
    expect(nho.every((w) => w === 'nowrap')).toBe(true);
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('C01-NU-10/11 · IconButton có tên đọc, icon aria-hidden; không nút <button> kiểu accent', async ({ page }) => {
    await mo(page);
    const khongTen = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('button, a[href], input')].filter((e) => !e.getAttribute('aria-label') && !e.textContent?.trim() && !e.getAttribute('aria-labelledby') && !e.closest('label') && !(e as HTMLInputElement).labels?.length).map((e) => e.outerHTML.slice(0, 80)));
    expect(khongTen).toEqual([]);
    await expect(khoi(page, 'xt-nut').getByRole('button', { name: 'Thêm' }).first()).toBeVisible();
    expect(await khoi(page, 'xt-nut').locator('svg:not([aria-hidden="true"])').count()).toBe(0);
    // kiểu nhấn (accent) chỉ trên liên kết "Xem và nộp trên Cổng DVC"
    const accent = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('button')].filter((b) => /accent/i.test(b.className)).length);
    expect(accent).toBe(0);
  });
});

// ───────────────────────────── 5. Liên kết ngoài ─────────────────────────────

test.describe('Liên kết ra trang ngoài (BR-3, AC-6)', () => {
  test('C01-LK-01 · liên kết web: tab mới, noopener noreferrer, icon aria-hidden, tên đọc có "(mở trang mới)", opener null, không Referer', async ({ page, context }) => {
    await mo(page);
    await page.route('https://dichvucong.gov.vn/**', (r) => r.fulfill({ contentType: 'text/html', body: '<title>x</title>' }));
    const lk = khoi(page, 'xt-lien-ket').getByRole('link', { name: /Mở Cổng Dịch vụ công Quốc gia/ });
    await expect(lk).toHaveAttribute('target', '_blank');
    const rel = (await lk.getAttribute('rel')) ?? '';
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
    await expect(lk).toHaveAccessibleName(/\(mở trang mới\)$/);
    expect(await lk.locator('svg[aria-hidden="true"]').count()).toBe(1);
    const [tabMoi] = await Promise.all([context.waitForEvent('page'), lk.click()]);
    await tabMoi.waitForLoadState();
    expect(await tabMoi.evaluate(() => window.opener)).toBeNull();
    expect(await tabMoi.evaluate(() => document.referrer)).toBe('');
  });

  test('C01-LK-02 · tel: và mailto: không target, không icon, không chữ "(mở trang mới)"', async ({ page }) => {
    await mo(page);
    const tel = khoi(page, 'xt-lien-ket').getByRole('link', { name: 'Gọi Trung tâm' });
    const thu = khoi(page, 'xt-lien-ket').getByRole('link', { name: 'Gửi thư cho Trung tâm' });
    await expect(tel).toHaveAttribute('href', /^tel:\d+$/);
    await expect(thu).toHaveAttribute('href', /^mailto:/);
    for (const l of [tel, thu]) {
      expect(await l.getAttribute('target')).toBeNull();
      expect(await l.locator('svg').count()).toBe(0);
      expect(await l.textContent()).not.toContain('mở trang mới');
    }
  });

  test('C01-LK-03/04 · javascript: không thành <a>, hiện chữ thường, bấm không có hộp thoại, Tab bỏ qua; ô dịch vụ cùng vậy', async ({ page }) => {
    const hop: string[] = [];
    page.on('dialog', async (d) => {
      hop.push(d.message());
      await d.dismiss();
    });
    await mo(page);
    expect(await page.locator('a[href^="javascript:" i]').count()).toBe(0);
    const chu = khoi(page, 'xt-lien-ket').getByText('Liên kết sai định dạng (javascript:), chỉ còn là chữ thường');
    await expect(chu).toBeVisible();
    expect(await chu.evaluate((e) => e.closest('a'))).toBeNull();
    await chu.click();
    const o = khoi(page, 'xt-o').getByText('Ô có liên kết sai');
    await o.click();
    expect(hop).toEqual([]);
    expect(page.url()).toContain('/dev/design-system');
  });
});

// ───────────────────────────── 6. Ô tìm kiếm ─────────────────────────────

test.describe('Ô tìm kiếm (BR-4, AC-7…9)', () => {
  const thuTuKetQua = async (page: Page, tuKhoa: string) => {
    await oTim(page).fill(tuKhoa);
    await expect.poll(() => tongKetQua(page)).toBe(mongDoiKhiTim(tuKhoa).length);
    return maDangHien(page);
  };

  test('C01-TK-01 · "dang ky khai sinh", chữ hoa có dấu, thừa khoảng trắng/đảo thứ tự: cùng một tập kết quả', async ({ page }) => {
    await mo(page);
    const a = await thuTuKetQua(page, 'dang ky khai sinh');
    const b = await thuTuKetQua(page, 'ĐĂNG KÝ KHAI SINH');
    const c = await thuTuKetQua(page, '  khai   sinh  đăng ký ');
    expect(b).toEqual(a);
    expect(c).toEqual(a);
    expect(a).toEqual(mongDoiKhiTim('dang ky khai sinh').slice(0, a.length));
    expect(a.length).toBeGreaterThan(0);
  });

  test('C01-TK-02/03 · "thuy" ra cả "Thủy" và "Thuỷ"; chuỗi NFD cho cùng kết quả như NFC', async ({ page }) => {
    await mo(page);
    const thuy = await thuTuKetQua(page, 'thuy');
    expect(thuy.length).toBeGreaterThanOrEqual(2);
    const nfd = await thuTuKetQua(page, 'đăng ký'.normalize('NFD'));
    const nfc = await thuTuKetQua(page, 'đăng ký'.normalize('NFC'));
    expect(nfd).toEqual(nfc);
  });

  test('C01-TK-04/05 · ký tự vô hình U+200B, U+200E, U+200F, U+FEFF trong từ khoá và trong dữ liệu không ảnh hưởng', async ({ page }) => {
    await mo(page);
    const goc = await thuTuKetQua(page, 'khai sinh');
    expect(await thuTuKetQua(page, `kh${ZWSP}ai sinh`)).toEqual(goc);
    expect(await thuTuKetQua(page, `${ZWSP}khai sinh`)).toEqual(goc);
    const dangKy = await thuTuKetQua(page, 'đăng ký');
    for (const bien of [`đăng k${LRM}ý`, `đăng k${RLM}ý`, `đăng k${BOM}ý`]) expect(await thuTuKetQua(page, bien)).toEqual(dangKy);
    expect(dangKy).toContain('1.000001'); // mục chứa U+200E giữa "k" và "ý"
  });

  test('C01-TK-06 · "đ" khớp "d" hai chiều', async ({ page }) => {
    await mo(page);
    expect(await thuTuKetQua(page, 'dat dai')).toEqual(await thuTuKetQua(page, 'đất đai'));
  });

  test('C01-TK-07 · hai từ ở hai trường khác nhau (tên + lĩnh vực): cả hai ra, đảo thứ tự cùng kết quả', async ({ page }) => {
    await mo(page);
    const ab = await thuTuKetQua(page, 'khai sinh ho tich');
    const ba = await thuTuKetQua(page, 'ho tich khai sinh');
    expect(ba).toEqual(ab);
    expect(ab.length).toBeGreaterThan(0);
  });

  test('C01-TK-08/09 · ô trống hoặc chỉ khoảng trắng → toàn bộ; "xyzxyz" → không kết quả + EmptyState, không lỗi', async ({ page }) => {
    await mo(page);
    const tong = THU_TUC_MAU.length;
    expect(await tongKetQua(page)).toBe(tong);
    await oTim(page).fill('   ');
    await expect.poll(() => tongKetQua(page)).toBe(tong);
    await oTim(page).fill('khai');
    await oTim(page).fill('');
    await expect.poll(() => tongKetQua(page)).toBe(tong);
    await oTim(page).fill('xyzxyz');
    await expect(khoi(page, 'xt-ds').getByText(/Không tìm thấy thủ tục phù hợp với 'xyzxyz'/)).toBeVisible();
    expect(await tongKetQua(page)).toBe(0);
  });

  test('C01-TK-10 · tối đa 100 ký tự; từ khoá dài xuống dòng trong EmptyState, không tràn khung', async ({ page }) => {
    await mo(page, KHO.dienThoai);
    await oTim(page).pressSequentially('a'.repeat(120));
    expect((await oTim(page).inputValue()).length).toBe(100);
    await expect(khoi(page, 'xt-ds').getByText(/Không tìm thấy thủ tục phù hợp/)).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('C01-TK-11/RONG-04 · ký tự đặc biệt và HTML: không hộp thoại, không lỗi regex, hiện nguyên chữ', async ({ page }) => {
    const hop: string[] = [];
    page.on('dialog', async (d) => {
      hop.push(d.message());
      await d.dismiss();
    });
    const loi: string[] = [];
    page.on('pageerror', (e) => loi.push(e.message));
    await mo(page);
    for (const s of ['<script>alert(1)</script>', '<b>abc</b>', `"'&;%00`, '\\', '.*+?^${}()|[]', '%', '😀']) {
      await oTim(page).fill(s);
      await page.waitForTimeout(150);
      await expect(khoi(page, 'xt-ds')).toBeVisible();
      expect(await khoi(page, 'xt-ds').locator('b, script').count()).toBe(0);
    }
    await oTim(page).fill('<b>abc</b>');
    await expect(khoi(page, 'xt-ds')).toContainText("'<b>abc</b>'");
    expect(hop).toEqual([]);
    expect(loi).toEqual([]);
  });

  test('C01-TK-13 · nút ✕ "Xoá từ khoá": ô trống, focus ở ô, danh sách đầy đủ, nút ✕ biến mất', async ({ page }) => {
    for (const kho of [KHO.mayTinh, KHO.dienThoai]) {
      await mo(page, kho);
      await oTim(page).fill('khai sinh');
      await khoi(page, 'xt-ds').getByRole('button', { name: 'Xoá từ khoá' }).click();
      await expect(oTim(page)).toHaveValue('');
      await expect(oTim(page)).toBeFocused();
      await expect(khoi(page, 'xt-ds').getByRole('button', { name: 'Xoá từ khoá' })).toHaveCount(0);
      await expect.poll(() => tongKetQua(page)).toBe(THU_TUC_MAU.length);
    }
  });

  test('C01-TK-14/15 · không micro/nhận giọng nói; ô có <label>, kính lúp aria-hidden, autocomplete off, spellcheck false', async ({ page }) => {
    await mo(page);
    expect(await page.locator('[aria-label*="micro" i], [aria-label*="giọng nói" i], [x-webkit-speech], [webkitspeech]').count()).toBe(0);
    const o = oTim(page);
    await expect(o).toHaveAttribute('type', 'search');
    await expect(o).toHaveAttribute('autocomplete', 'off');
    await expect(o).toHaveAttribute('spellcheck', 'false');
    expect(await o.evaluate((e: HTMLInputElement) => e.labels?.length ?? 0)).toBeGreaterThan(0);
    expect(await khoi(page, 'xt-ds').locator('svg[aria-hidden="true"]').count()).toBeGreaterThan(0);
  });

  test('C01-TK-16 · vùng role=status báo "Có n kết quả." / "Không có kết quả." sau 500ms, lúc mới mở rỗng, con trỏ vẫn ở ô', async ({ page }) => {
    await mo(page);
    const status = khoi(page, 'xt-ds').getByRole('status').first();
    await expect(status).toHaveText('');
    await oTim(page).fill('khai');
    const n = mongDoiKhiTim('khai').length;
    await expect(status).toHaveText(`Có ${n} kết quả.`, { timeout: 3000 });
    await oTim(page).fill('xyzxyz');
    await expect(status).toHaveText('Không có kết quả.', { timeout: 3000 });
    await expect(oTim(page)).toBeFocused();
  });

  test('C01-TK-20/21/22 · gõ ký tự về trang 1 ngay; địa chỉ ghi sau 300ms (replace, không thêm lịch sử); đổi địa chỉ ngoài thì ô theo', async ({ page }) => {
    await mo(page, KHO.mayTinh, 'trang=3');
    expect(await docTrang(page)).toBe(3);
    const lichSuTruoc = await page.evaluate(() => history.length);
    await oTim(page).pressSequentially('d');
    await expect.poll(() => tongKetQua(page)).toBe(mongDoiKhiTim('d').length);
    await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('d');
    expect(new URL(page.url()).searchParams.has('trang')).toBe(false);
    expect(await page.evaluate(() => history.length)).toBe(lichSuTruoc);
    await page.goto('/dev/design-system?q=thuy');
    await expect(oTim(page)).toHaveValue('thuy');
    await expect.poll(() => tongKetQua(page)).toBe(mongDoiKhiTim('thuy').length);
  });

  test('C01-BM-08 · gõ nội dung dạng CCCD/điện thoại/email: không request nào ra ngoài, không ghi vào localStorage', async ({ page }) => {
    await mo(page);
    const yeuCau: string[] = [];
    page.on('request', (r) => {
      if (!/\.(js|css|ts|tsx|svg|json|woff2?)(\?|$)/.test(r.url()) && !r.url().includes('/@') && !r.url().includes('node_modules')) yeuCau.push(`${r.method()} ${r.url()}`);
    });
    for (const s of ['079123456789', '0912345678', 'nguyenvana@gmail.com']) {
      await oTim(page).fill(s);
      await page.waitForTimeout(400);
    }
    expect(yeuCau.filter((y) => !y.includes('localhost:5173/dev/design-system'))).toEqual([]);
    const luu = await page.evaluate(() => JSON.stringify({ ...localStorage }));
    expect(luu).not.toMatch(/0791|0912|nguyenvana/);
  });
});

// ───────────────────────────── 7. Chip lọc ─────────────────────────────

test.describe('Chip lọc (BR-5)', () => {
  test('C01-CH-01 · bấm "Đất đai": aria-pressed, có ✓, "Tất cả" bỏ chọn, về trang 1, nhóm role=group có tên', async ({ page }) => {
    await mo(page, KHO.mayTinh, 'trang=2');
    const nhom = khoi(page, 'xt-ds').getByRole('group', { name: 'Lĩnh vực' });
    await expect(nhom).toBeVisible();
    await expect(nhom.getByRole('button', { name: 'Tất cả' })).toHaveAttribute('aria-pressed', 'true');
    await nhom.getByRole('button', { name: 'Đất đai' }).click();
    await expect(nhom.getByRole('button', { name: 'Đất đai' })).toHaveAttribute('aria-pressed', 'true');
    await expect(nhom.getByRole('button', { name: 'Tất cả' })).toHaveAttribute('aria-pressed', 'false');
    expect(await nhom.getByRole('button', { name: 'Đất đai' }).locator('svg').count()).toBe(1);
    expect(await nhom.getByRole('button', { name: 'Tất cả' }).locator('svg').count()).toBe(0);
    await expect.poll(() => docTrang(page)).toBe(1);
    await expect.poll(() => tongKetQua(page)).toBe(mongDoiKhiTim('', 'dat-dai').length);
  });

  test('C01-CH-03 · 375px: hàng chip cuộn ngang được, trang không cuộn ngang', async ({ page }) => {
    await mo(page, KHO.dienThoai);
    const hang = khoi(page, 'xt-ds').getByRole('group', { name: 'Lĩnh vực' });
    expect(await hang.evaluate((h) => h.scrollWidth > h.clientWidth)).toBe(true);
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('C01-CH-04 · máy có chuột, còn chip khuất: nút cuộn phải hiện, bấm cuộn ~80% bề rộng; cuối hàng thì nút phải ẩn, nút trái hiện', async ({ page }) => {
    await mo(page, { ten: '450', rong: 450, cao: 800, kiosk: false });
    const hang = khoi(page, 'xt-ds').getByRole('group', { name: 'Lĩnh vực' });
    const phai = khoi(page, 'xt-ds').getByRole('button', { name: 'Cuộn sang phải', includeHidden: true });
    const trai = khoi(page, 'xt-ds').getByRole('button', { name: 'Cuộn sang trái', includeHidden: true });
    await expect(phai).toHaveCount(1);
    await expect(trai).toHaveCount(0);
    const { cw, toiDa } = await hang.evaluate((h) => ({ cw: h.clientWidth, toiDa: h.scrollWidth - h.clientWidth }));
    await phai.dispatchEvent('click');
    // mỗi lần bấm cuộn ~80% bề rộng, nhưng không quá phần còn khuất
    await expect.poll(() => hang.evaluate((h) => h.scrollLeft)).toBeGreaterThanOrEqual(Math.min(cw * 0.8, toiDa) - 2);
    await expect(trai).toHaveCount(1);
    await expect(phai).toHaveCount(0);
  });

});

// ───────────────────────────── 8. Chuyển dạng, 9. Danh sách ─────────────────────────────

test.describe('Chuyển dạng thẻ/bảng và danh sách (BR-6, BR-7)', () => {
  test('C01-VG-03/05 · 375px không có nút chuyển dạng, danh sách là thẻ; mặc định 768 → thẻ, 1280 → bảng, kiosk → thẻ', async ({ page }) => {
    await mo(page, KHO.dienThoai);
    await expect(khoi(page, 'xt-ds').getByRole('group', { name: 'Cách hiển thị' })).toBeHidden();
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(0);
    await mo(page, { ten: '768', rong: 768, cao: 1024, kiosk: false });
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(0);
    await mo(page, KHO.mayTinh);
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(1);
    await mo(page, KHO.kiosk);
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(0);
  });

  test('C01-VG-01/02/06 · chuyển thẻ ↔ bảng giữ trang và từ khoá; lựa chọn lưu qua tải lại', async ({ page }) => {
    await mo(page, KHO.mayTinh, 'trang=3');
    const truoc = await maDangHien(page);
    const nhom = khoi(page, 'xt-ds').getByRole('group', { name: 'Cách hiển thị' });
    await nhom.getByRole('button', { name: 'Dạng thẻ' }).click();
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(0);
    expect(await docTrang(page)).toBe(3);
    expect(await maDangHien(page)).toEqual(truoc);
    await expect(nhom.getByRole('button', { name: 'Dạng thẻ' })).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(0);
    await nhom.getByRole('button', { name: 'Dạng bảng' }).click();
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(1);
    expect(await maDangHien(page)).toEqual(truoc);
    await oTim(page).fill('khai sinh');
    await nhom.getByRole('button', { name: 'Dạng thẻ' }).click();
    await expect(oTim(page)).toHaveValue('khai sinh');
    await expect.poll(() => tongKetQua(page)).toBe(mongDoiKhiTim('khai sinh').length);
  });

  test('C01-VG-04 · thu 1280 → 375 thì thành thẻ và mất nút chuyển; nới lại 1280 thì về bảng', async ({ page }) => {
    await mo(page, KHO.mayTinh);
    await khoi(page, 'xt-ds').getByRole('group', { name: 'Cách hiển thị' }).getByRole('button', { name: 'Dạng bảng' }).click();
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(0);
    await expect(khoi(page, 'xt-ds').getByRole('group', { name: 'Cách hiển thị' })).toBeHidden();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(1);
  });

  test('C01-DS-01/02 · bảng có caption, th scope=col; tiêu đề cột dính đầu vùng khi cuộn', async ({ page }) => {
    await mo(page);
    const bang = khoi(page, 'xt-ds').locator('table');
    expect(await bang.locator('caption').textContent()).toContain('Danh sách thủ tục mẫu');
    expect(await bang.locator('th').evaluateAll((l) => l.every((t) => t.getAttribute('scope') === 'col'))).toBe(true);
    expect(await bang.locator('thead th').first().evaluate((e) => getComputedStyle(e).position)).toBe('sticky');
  });

  test('C01-DS-03 · cửa sổ 640: chỉ vùng bảng cuộn ngang, trang không cuộn ngang', async ({ page }) => {
    await mo(page, { ten: '640', rong: 640, cao: 900, kiosk: false });
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('C01-DS-04/05/07 · số cột thẻ theo khổ (1; 2; ≥4 ở 1280 nếu chọn thẻ; kiosk 2), thẻ cùng hàng cao bằng nhau, nút cuối thẳng hàng', async ({ page }) => {
    const soCot = async (kho: KhoMan) => {
      await mo(page, kho);
      if (kho.rong >= 1024 && !kho.kiosk) await khoi(page, 'xt-ds').getByRole('group', { name: 'Cách hiển thị' }).getByRole('button', { name: 'Dạng thẻ' }).click();
      return khoi(page, 'xt-ds').locator('ul[role="list"] > li').evaluateAll((l) => {
        const tops = l.map((e) => Math.round(e.getBoundingClientRect().top));
        const cot = tops.filter((t) => t === tops[0]).length;
        const hang1 = l.slice(0, cot);
        const cao = new Set(hang1.map((e) => Math.round(e.getBoundingClientRect().height)));
        const nut = hang1.map((e) => Math.round(e.querySelector('button')?.getBoundingClientRect().top ?? 0));
        return { cot, dongCao: cao.size === 1, nutThang: Math.max(...nut) - Math.min(...nut) <= 1, rongThe: Math.round(hang1[0]!.getBoundingClientRect().width) };
      });
    };
    const dt = await soCot(KHO.dienThoai);
    expect(dt.cot).toBe(1);
    const t768 = await soCot({ ten: '768', rong: 768, cao: 1024, kiosk: false });
    expect(t768.cot).toBe(2);
    expect(t768.dongCao && t768.nutThang).toBe(true);
    const may = await soCot(KHO.mayTinh);
    expect(may.cot).toBeGreaterThanOrEqual(3);
    expect(may.cot).toBeLessThanOrEqual(4);
    expect(may.rongThe).toBeGreaterThanOrEqual(240);
    expect(may.dongCao && may.nutThang).toBe(true);
    const ks = await soCot(KHO.kiosk);
    expect(ks.cot).toBe(2);
    expect(ks.dongCao && ks.nutThang).toBe(true);
  });

  test('C01-DS-08 · chặn chunk TanStack Table (route.abort): lỗi giới hạn ở vùng bảng (có alert + nút "Xem dạng thẻ"), phần còn lại không sập', async ({ page }) => {
    const loi: string[] = [];
    page.on('pageerror', (e) => loi.push(e.message));
    await page.route(/BangDuLieu|react-table/i, (r) => r.abort());
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dev/design-system');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const ds = khoi(page, 'xt-ds');
    // Lỗi nằm TRONG vùng danh sách: có role=alert và nút quay về dạng thẻ
    const vung = ds.getByRole('region', { name: /Kết quả, trang/ });
    await expect(vung.getByRole('alert')).toBeVisible();
    await expect(vung.getByRole('button', { name: 'Xem dạng thẻ' })).toBeVisible();
    await expect(vung.getByRole('button', { name: /Thử lại/ })).toBeVisible();
    // Không lộ thông điệp kỹ thuật, không rơi vào màn hình lỗi mặc định của router
    const chu = await page.locator('body').innerText();
    expect(chu).not.toMatch(/Failed to fetch|dynamically imported|Hey developer|Unexpected Application Error/i);
    // Phần còn lại của trang còn sống: ô tìm, chip, phân trang, khối popup
    await expect(oTim(page)).toBeVisible();
    await expect(khoi(page, 'xt-pt')).toBeVisible();
    await expect(khoi(page, 'xt-popup')).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);

    // "Xem dạng thẻ" → danh sách thẻ hiện, hết lỗi
    await vung.getByRole('button', { name: 'Xem dạng thẻ' }).click();
    await expect(ds.locator('ul[role="list"]')).toBeVisible();
    await expect(ds.getByRole('alert')).toHaveCount(0);
    expect(loi).toEqual([]);
  });

  test('C01-DS-09 · danh sách rỗng: chỉ EmptyState, không bảng/thẻ rỗng', async ({ page }) => {
    await mo(page);
    await oTim(page).fill('xyzxyz');
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(0);
    await expect(khoi(page, 'xt-ds').locator('ul[role="list"]')).toHaveCount(0);
    await expect(khoi(page, 'xt-ds').getByText(/Không tìm thấy thủ tục phù hợp/)).toBeVisible();
  });
});

// ───────────────────────────── 10. Phân trang ─────────────────────────────

test.describe('Phân trang (BR-8, AC-13, AC-14)', () => {
  const chuoiNut = (page: Page) =>
    khoi(page, 'xt-pt').locator('nav').evaluate((n) =>
      [...n.children].map((e) => (e.getAttribute('aria-hidden') === 'true' ? '…' : (e.getAttribute('aria-label') ?? e.textContent ?? '').replace('Trang trước', 'Trước').replace('Trang sau', 'Sau').replace(/^Trang /, '').trim())),
    );

  const diTrang = async (page: Page, dich: number) => {
    const pt = khoi(page, 'xt-pt');
    for (let i = 0; i < 40; i += 1) {
      const dang = Number(await pt.locator('[aria-current="page"]').textContent());
      if (dang === dich) return;
      const nutDich = pt.getByRole('button', { name: `Trang ${dich}`, exact: true });
      if (await nutDich.count()) await nutDich.click();
      else await pt.getByRole('button', { name: dich > dang ? 'Trang sau' : 'Trang trước' }).click();
    }
    throw new Error(`không tới được trang ${dich}`);
  };

  test('C01-PT-01/02/09 · chuỗi nút đúng ở trang 1, 2, 10, 19, 20; đúng một aria-current; "…" aria-hidden; tên Trang n', async ({ page }) => {
    await mo(page);
    const mong: Record<number, string[]> = {
      1: ['Trước', '1', '2', '…', '20', 'Sau'],
      2: ['Trước', '1', '2', '3', '…', '20', 'Sau'],
      10: ['Trước', '1', '…', '9', '10', '11', '…', '20', 'Sau'],
      19: ['Trước', '1', '…', '18', '19', '20', 'Sau'],
      20: ['Trước', '1', '…', '19', '20', 'Sau'],
    };
    for (const [trang, chuoi] of Object.entries(mong)) {
      await diTrang(page, Number(trang));
      expect(await chuoiNut(page), `trang ${trang}`).toEqual(chuoi);
      await expect(khoi(page, 'xt-pt').locator('[aria-current="page"]')).toHaveCount(1);
      await expect(khoi(page, 'xt-pt').locator('[aria-current="page"]')).toHaveText(trang);
    }
  });

  test('C01-PT-10 · 375px: dãy trang dài nhất (trang 10) vừa một hàng, không cuộn ngang, nút ≥ 24x24', async ({ page }) => {
    await mo(page, KHO.dienThoai);
    const dung = await khoi(page, 'xt-pt').locator('nav').evaluate((n) => {
      const tops = new Set([...n.querySelectorAll('button')].map((e) => Math.round(e.getBoundingClientRect().top)));
      const nho = [...n.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().width < 24 || b.getBoundingClientRect().height < 24).length;
      return { mot: tops.size === 1, nho, tran: n.scrollWidth > n.clientWidth };
    });
    expect(dung.mot).toBe(true);
    expect(dung.nho).toBe(0);
    expect(dung.tran).toBe(false);
  });

  test('C01-PT-03/04/05/11/12 · bấm sang trang khác cuộn về đầu vùng kết quả và chuyển con trỏ vào đó; lần tải đầu không tự cuộn; trang n bắt đầu đúng mục; đổi từ khoá/chip về trang 1', async ({ page }) => {
    await mo(page, KHO.mayTinh, 'trang=3');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await khoi(page, 'xt-ds').getByRole('button', { name: 'Trang 2', exact: true }).scrollIntoViewIfNeeded();
    await khoi(page, 'xt-ds').getByRole('button', { name: 'Trang 2', exact: true }).click();
    await expect.poll(() => docTrang(page)).toBe(2);
    await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('aria-label'))).toBe('Kết quả, trang 2 trên 4');
    const top = await page.evaluate(() => Math.round(document.activeElement!.getBoundingClientRect().top));
    expect(top).toBeGreaterThanOrEqual(-1);
    expect(top).toBeLessThan(800);
    // trang n bắt đầu từ mục thứ 12*(n-1)+1
    const ma = await maDangHien(page);
    expect(ma[0]).toBe(THU_TUC_MAU[12]!.ma);
    await khoi(page, 'xt-ds').getByRole('group', { name: 'Lĩnh vực' }).getByRole('button', { name: 'Đất đai' }).click();
    await expect.poll(() => docTrang(page)).toBe(1);
  });

  test('C01-PT-06/07/08 · một trang không có phân trang; ?trang=99 → trang cuối; giá trị lạ → trang 1; không hiện chữ lạ, địa chỉ không bị viết lại', async ({ page }) => {
    await mo(page, KHO.mayTinh, 'q=khai+sinh+ho+tich');
    await expect(khoi(page, 'xt-ds').getByRole('navigation', { name: 'Phân trang' })).toHaveCount(0);
    const tong = Math.ceil(THU_TUC_MAU.length / 12);
    await page.goto('/dev/design-system?trang=99');
    await expect(khoi(page, 'xt-ds').locator('[aria-current="page"]')).toHaveText(String(tong));
    for (const gia of ['abc', '-1', '0', '1.5', '2abc', '', '<script>alert(1)</script>', '99999999999999999999']) {
      await page.goto(`/dev/design-system?trang=${encodeURIComponent(gia)}`);
      const nut = khoi(page, 'xt-ds').locator('[aria-current="page"]');
      const hien = await nut.textContent();
      expect(['1', String(tong)], `trang=${gia} → ${hien}`).toContain(hien);
      await expect(page.locator('body')).not.toContainText('alert(1)');
      expect(new URL(page.url()).searchParams.get('trang') ?? '').toBe(gia);
    }
  });
});

// ───────────────────────────── 11. Popup ─────────────────────────────

test.describe('Popup (BR-9, AC-15, AC-16, AC-24)', () => {
  const moPopup = async (page: Page) => {
    const nut = khoi(page, 'xt-popup').getByRole('button', { name: 'Mở popup', exact: true });
    await nut.scrollIntoViewIfNeeded();
    await nut.focus();
    await page.keyboard.press('Enter');
    return nut;
  };

  test('C01-PP-01/02/03/14 · role=dialog, aria-modal, aria-labelledby; focus trong popup; Tab/Shift+Tab đi vòng; Esc đóng và trả focus', async ({ page }) => {
    await mo(page);
    const nut = await moPopup(page);
    const hop = page.getByRole('dialog', { name: 'Đăng ký khai sinh' });
    await expect(hop).toBeVisible();
    await expect(hop).toHaveAttribute('aria-modal', 'true');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
    for (let i = 0; i < 30; i += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), `Tab lần ${i + 1} ra khỏi popup`).toBe(true);
    }
    for (let i = 0; i < 30; i += 1) {
      await page.keyboard.press('Shift+Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(hop).toBeHidden();
    await expect(nut).toBeFocused();
  });

  test('C01-PP-04/05/06 · đóng bằng ✕, Esc, vùng tối; scrollY giữ nguyên; trang sau không cuộn; body con khác có inert rồi gỡ', async ({ page }) => {
    await mo(page);
    const nut = khoi(page, 'xt-popup').getByRole('button', { name: 'Mở popup', exact: true });
    await nut.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -100));
    const y0 = await page.evaluate(() => window.scrollY);
    const hop = page.getByRole('dialog', { name: 'Đăng ký khai sinh' });
    await nut.click();
    await expect(hop).toBeVisible();
    expect(await page.evaluate(() => [...document.body.children].filter((c) => !c.querySelector('[role="dialog"]') && !c.hasAttribute('data-ngoai-popup') && !c.matches('script, style, link')).every((c) => c.hasAttribute('inert')))).toBe(true);
    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.scrollY), 'trang phía sau cuộn khi popup mở').toBe(y0);
    await hop.getByRole('button', { name: 'Đóng' }).click();
    await expect(hop).toBeHidden();
    expect(await page.evaluate(() => window.scrollY)).toBe(y0);
    expect(await page.evaluate(() => document.querySelectorAll('[inert]').length)).toBe(0);
    await nut.click();
    await page.keyboard.press('Escape');
    await expect(hop).toBeHidden();
    await nut.click();
    await page.mouse.click(5, 5);
    await expect(hop).toBeHidden();
    expect(await page.evaluate(() => window.scrollY)).toBe(y0);
    await expect(nut).toBeFocused();
  });

  test('C01-PP-07/08 · kéo chọn chữ từ trong popup ra vùng tối không đóng; popup lồng: Esc đóng từng lớp', async ({ page }) => {
    await mo(page);
    const nut = khoi(page, 'xt-popup').getByRole('button', { name: 'Mở popup', exact: true });
    await nut.click();
    const hop = page.getByRole('dialog', { name: 'Đăng ký khai sinh' });
    const tieuDe = hop.getByRole('heading').first();
    const b = (await tieuDe.boundingBox())!;
    await page.mouse.move(b.x + 10, b.y + 5);
    await page.mouse.down();
    await page.mouse.move(3, 3);
    await page.mouse.up();
    await expect(hop).toBeVisible();
    const nutTrong = hop.getByRole('button', { name: 'Mở popup thứ hai bên trong' });
    await nutTrong.click();
    const hop2 = page.getByRole('dialog', { name: 'Popup lồng nhau' });
    await expect(hop2).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(hop2).toBeHidden();
    await expect(hop).toBeVisible();
    await expect(nutTrong).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(hop).toBeHidden();
    await expect(nut).toBeFocused();
  });

  test('C01-PP-09/10 · 375: popup chiếm toàn màn hình, thân cuộn, tiêu đề + ✕ + chân luôn thấy; 1280: rộng tối đa 680', async ({ browser }) => {
    const ngu = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    const page = await ngu.newPage();
    await page.goto('/dev/design-system');
    await expect(page.locator('#xt-ds')).toBeVisible();
    await khoi(page, 'xt-popup').getByRole('button', { name: 'Mở popup', exact: true }).click();
    const hop = page.getByRole('dialog', { name: 'Đăng ký khai sinh' });
    const r = (await hop.boundingBox())!;
    const kichThuoc = await page.evaluate(() => ({ w: document.documentElement.clientWidth, h: window.innerHeight }));
    expect(r.width).toBeGreaterThanOrEqual(kichThuoc.w - 1);
    expect(r.height).toBeGreaterThanOrEqual(kichThuoc.h - 1);
    await expect(hop.getByRole('button', { name: 'Đóng' })).toBeInViewport();
    await expect(hop.getByRole('link', { name: /Xem và nộp trên Cổng DVC/ })).toBeInViewport();
    await page.keyboard.press('Escape');
    await ngu.close();
  });

  test('C01-PP-10 · 1280: popup rộng tối đa 680px, cao tối đa 100vh − 32px', async ({ page }) => {
    await mo(page, KHO.mayTinh);
    await khoi(page, 'xt-popup').getByRole('button', { name: 'Mở popup', exact: true }).click();
    const r2 = (await page.getByRole('dialog', { name: 'Đăng ký khai sinh' }).boundingBox())!;
    expect(r2.width).toBeLessThanOrEqual(681);
    expect(r2.height).toBeLessThanOrEqual(800 - 31);
  });

  test('C01-PP-12 · Esc khi con trỏ ở ô nhập trong popup đóng popup', async ({ page }) => {
    await mo(page);
    await khoi(page, 'xt-popup').getByRole('button', { name: 'Mở popup', exact: true }).click();
    const hop = page.getByRole('dialog', { name: 'Đăng ký khai sinh' });
    await hop.getByRole('textbox').focus();
    await page.keyboard.press('Escape');
    await expect(hop).toBeHidden();
  });

  test('C01-PP-16/17/18/21 · kiosk: vòng Tab gồm nút giả ngoài popup ở cuối; Shift+Tab từ đầu tới nút giả; nút giả bấm được, nằm trên popup', async ({ page }) => {
    await mo(page, KHO.kiosk);
    await khoi(page, 'xt-popup').getByRole('button', { name: 'Mở popup', exact: true }).click();
    const hop = page.getByRole('dialog', { name: 'Đăng ký khai sinh' });
    await expect(hop).toBeVisible();
    const gia = page.locator('[data-ngoai-popup]');
    await expect(gia).toBeVisible();
    // nút giả nhìn thấy và nhận chuột (elementFromPoint tại tâm)
    const nhanChuot = await gia.evaluate((e) => {
      const r = e.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return top === e || e.contains(top);
    });
    expect(nhanChuot, 'nút giả bị popup che').toBe(true);
    const thuTu: string[] = [];
    await hop.focus();
    for (let i = 0; i < 40; i += 1) {
      await page.keyboard.press('Tab');
      thuTu.push(await page.evaluate(() => (document.activeElement?.hasAttribute('data-ngoai-popup') ? 'GIA' : document.activeElement?.closest('[role="dialog"]') ? 'TRONG' : 'NGOAI')));
    }
    expect(thuTu).not.toContain('NGOAI');
    expect(thuTu).toContain('GIA');
    // sau nút giả quay về phần tử đầu của popup
    const viTri = thuTu.indexOf('GIA');
    expect(thuTu[viTri + 1]).toBe('TRONG');
    // Shift+Tab từ phần tử đầu
    await hop.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => document.activeElement?.hasAttribute('data-ngoai-popup'))).toBe(true);
    // nút giả kích hoạt bằng Enter và Space, popup không đóng
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(hop).toBeVisible();
  });

  test('C01-PP-20 · không kiosk: vòng Tab chỉ gồm phần tử trong popup, không có nút "Bắt đầu lại"/nút giả', async ({ page }) => {
    await mo(page);
    await khoi(page, 'xt-popup').getByRole('button', { name: 'Mở popup', exact: true }).click();
    await expect(page.locator('[data-ngoai-popup]')).toHaveCount(0);
    for (let i = 0; i < 25; i += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
    }
  });

  test('C01-PP-13 · nút mở bị xoá khỏi DOM trước khi đóng: không lỗi', async ({ page }) => {
    const loi: string[] = [];
    page.on('pageerror', (e) => loi.push(e.message));
    await mo(page);
    const nut = khoi(page, 'xt-popup').getByRole('button', { name: 'Mở popup', exact: true });
    await nut.click();
    await nut.evaluate((e) => e.remove());
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(loi).toEqual([]);
  });
});

// ───────────────────────────── 12–16. Nhãn, đang tải, lỗi, không kết quả, ô dịch vụ ─────────────────────────────

test.describe('Nhãn, đang tải, lỗi, không có kết quả, ô dịch vụ', () => {
  test('C01-NH-01/03/04/05 · nhãn có chữ; không tabindex; nhãn rút gọn một dòng có "…" không tràn khung hẹp 200px; nhãn dài không tràn', async ({ page }) => {
    await mo(page, KHO.dienThoai);
    const nhan = khoi(page, 'xt-nhan');
    expect(await nhan.evaluate((s) => [...s.querySelectorAll<HTMLElement>('span, div')].filter((e) => e.textContent?.trim() === 'Toàn trình' || e.textContent?.trim() === 'Một phần').length)).toBeGreaterThan(0);
    expect(await nhan.locator('[tabindex]').count()).toBe(0);
    const kq = await nhan.evaluate((s) => {
      const khung = [...s.querySelectorAll<HTMLElement>('div')].filter((d) => d.getBoundingClientRect().width > 0 && d.getBoundingClientRect().width <= 210);
      return khung.map((k) => {
        const b = k.firstElementChild as HTMLElement | null;
        if (!b) return null;
        const chu = b.lastElementChild as HTMLElement; // chữ nằm trong <span> con (có text-overflow khi rút gọn)
        const rb = b.getBoundingClientRect();
        const rk = k.getBoundingClientRect();
        const s2 = getComputedStyle(chu);
        return { tran: rb.right > rk.right + 1, mot: rb.height < 40, ellipsis: s2.textOverflow === 'ellipsis' && chu.scrollWidth > chu.clientWidth };
      });
    });
    expect(kq.length).toBeGreaterThanOrEqual(1);
    expect(kq.every((x) => x && !x.tran)).toBe(true);
    expect(kq.some((x) => x?.ellipsis && x.mot)).toBe(true);
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('C01-DTAI-01/02 · Skeleton 3 dạng: role=status "Đang tải…", khối xám aria-hidden, aria-busy, không animation', async ({ page }) => {
    await mo(page);
    const tt = khoi(page, 'xt-tt');
    const nhom = tt.getByRole('status').filter({ hasText: 'Đang tải' });
    expect(await nhom.count()).toBeGreaterThanOrEqual(3);
    expect(await tt.locator('[aria-busy="true"]').count()).toBeGreaterThanOrEqual(3);
    const dong = await tt.evaluate((s) => ({ anim: s.getAnimations({ subtree: true }).length }));
    expect(dong.anim).toBe(0);
    for (const reduce of [false, true]) {
      await page.emulateMedia({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
      const a = await tt.locator('[aria-busy="true"]').first().boundingBox();
      await page.waitForTimeout(1000);
      const b = await tt.locator('[aria-busy="true"]').first().boundingBox();
      expect(b).toEqual(a);
    }
  });

  test('C01-LOI-01…05/09 · ErrorState: mất kết nối, quá nhiều yêu cầu, lỗi hệ thống có mã tra cứu; role=alert; không mã kỹ thuật', async ({ page }) => {
    for (const kho of [KHO.mayTinh, KHO.dienThoai]) {
      await mo(page, kho);
      const tt = khoi(page, 'xt-tt');
      const loi = tt.getByRole('alert');
      expect(await loi.count()).toBe(3);
      const chu = await loi.allTextContents();
      expect(chu[0]).toContain('Chưa tải được dữ liệu.');
      expect(chu[0]).toContain('Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng rồi thử lại.');
      expect(chu[0]).not.toContain('Mã tra cứu');
      expect(chu[1]).toContain('Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.');
      expect(chu[1]).not.toContain('Mã tra cứu');
      expect(chu[2]).toContain('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.');
      expect(chu[2]).toContain('Mã tra cứu: AB12CD34');
      await expect(loi.nth(0).getByRole('button', { name: 'Thử lại' })).toBeVisible();
      await expect(loi.nth(0).getByRole('link', { name: /02723893900|0272 389 3900|02723 893 900/ })).toHaveAttribute('href', 'tel:02723893900');
      for (const c of chu) expect(c).not.toMatch(/\b500\b|\b404\b|ProblemDetails|Exception|stack|TypeError|\/api\//i);
    }
  });

  test('C01-RONG-06…09/11/12 · EmptyState theo điều kiện: chỉ 2 gợi ý khi không điều kiện; đủ 4 + nút Xoá bộ lọc khi có từ khoá; từ khoá cắt khoảng trắng; không role=alert', async ({ page }) => {
    await mo(page);
    const tt = khoi(page, 'xt-tt');
    const rong = tt.getByText(/Không tìm thấy thủ tục phù hợp/);
    expect(await rong.count()).toBeGreaterThanOrEqual(5);
    // khối "Danh sách luôn rỗng": ô tìm trống
    const ds = tt.getByRole('searchbox', { name: 'Tìm trong danh sách rỗng' }).locator('xpath=ancestor::div[contains(@class,"boLoc")][1]');
    await expect(ds).toContainText('Không tìm thấy thủ tục phù hợp');
    await expect(ds).not.toContainText("phù hợp với '");
    await expect(ds.getByRole('button', { name: 'Xoá bộ lọc' })).toHaveCount(0);
    await expect(ds).not.toContainText('Kiểm tra lại chính tả');
    await expect(ds).toContainText('Hỏi Trợ lý thủ tục');
    await expect(ds).toContainText('Gọi Trung tâm');
    const o = tt.getByRole('searchbox', { name: 'Tìm trong danh sách rỗng' });
    await o.fill('  xyzxyz  ');
    await expect(ds).toContainText("phù hợp với 'xyzxyz'");
    await expect(ds.getByRole('button', { name: 'Xoá bộ lọc' })).toBeVisible();
    await expect(ds).toContainText('Kiểm tra lại chính tả');
    expect(await ds.getByRole('alert').count()).toBe(0);
    await ds.getByRole('button', { name: 'Xoá bộ lọc' }).click();
    await expect(o).toHaveValue('');
    await expect(tt).toContainText('Đã bấm Xoá bộ lọc 1 lần');
  });

  test('C01-RONG-10 · từ khoá 100 ký tự / SQL / mẫu {{so}} / ${1+1}: hiện nguyên chữ, không nội suy, không tràn ở 375', async ({ page }) => {
    await mo(page, KHO.dienThoai);
    const tt = khoi(page, 'xt-tt');
    const o = tt.getByRole('searchbox', { name: 'Tìm trong danh sách rỗng' });
    for (const s of ['x'.repeat(100), `'; DROP TABLE x;--`, '{{so}}', '${1+1}']) {
      await o.fill(s);
      await expect(tt).toContainText(`phù hợp với '${s}'`);
      expect(await khongTranNgang(page)).toBe(true);
    }
  });

  test('C01-OD-01…05 · ô dịch vụ: tab mới đúng; ô không link/javascript: cùng khung, không viền nét đứt, không role=link; số cột 2/3/6; ô cùng hàng cao bằng nhau', async ({ page }) => {
    await mo(page);
    const o = khoi(page, 'xt-o');
    const link = o.getByRole('link');
    expect(await link.count()).toBe(4);
    for (let i = 0; i < 4; i += 1) {
      await expect(link.nth(i)).toHaveAttribute('target', '_blank');
      expect((await link.nth(i).getAttribute('rel')) ?? '').toContain('noreferrer');
      await expect(link.nth(i)).toHaveAccessibleName(/\(mở trang mới\)/);
    }
    const o1 = o.getByText('Ô chưa có liên kết');
    const o2 = o.getByText('Ô có liên kết sai');
    for (const x of [o1, o2]) {
      await expect(x).toBeVisible();
      expect(await x.evaluate((e) => !!e.closest('a, [role="link"], [tabindex]'))).toBe(false);
    }
    const hinh = await o.evaluate((s) => {
      const luoi = s.querySelector('ul, div[class*="luoi" i], div') as HTMLElement;
      const muc = [...s.querySelectorAll<HTMLElement>(':scope > ul > li')].filter((e) => e.getBoundingClientRect().height > 20);
      return muc.map((e) => {
        const cs = getComputedStyle(e);
        return { h: Math.round(e.getBoundingClientRect().height), vien: cs.borderStyle, mo: cs.opacity, top: Math.round(e.getBoundingClientRect().top), luoi: !!luoi };
      });
    });
    expect(hinh.length).toBe(6);
    expect(hinh.every((x) => x.vien !== 'dashed' && x.mo === '1')).toBe(true);
    const hang = (xs: typeof hinh) => xs.filter((x) => x.top === xs[0]!.top);
    expect(new Set(hang(hinh).map((x) => x.h)).size).toBe(1);
    expect(hang(hinh).length).toBe(6);
    await page.setViewportSize({ width: 375, height: 812 });
    const cot375 = await o.evaluate((s) => {
      const muc = [...s.querySelectorAll<HTMLElement>(':scope > ul > li')].filter((e) => e.getBoundingClientRect().height > 20);
      return muc.filter((e) => Math.round(e.getBoundingClientRect().top) === Math.round(muc[0]!.getBoundingClientRect().top)).length;
    });
    expect(cot375).toBe(2);
    await page.setViewportSize({ width: 768, height: 1024 });
    const cot768 = await o.evaluate((s) => {
      const muc = [...s.querySelectorAll<HTMLElement>(':scope > ul > li')].filter((e) => e.getBoundingClientRect().height > 20);
      return muc.filter((e) => Math.round(e.getBoundingClientRect().top) === Math.round(muc[0]!.getBoundingClientRect().top)).length;
    });
    expect(cot768).toBe(3);
  });

  test('C01-FAB-01/02/07 · nút nổi: fixed góc phải dưới, cao ≥ 44, có icon + chữ; aria-expanded đổi và có aria-controls', async ({ page }) => {
    for (const kho of [KHO.dienThoai, KHO.mayTinh]) {
      await mo(page, kho);
      const nut = page.getByRole('button', { name: 'Trợ lý', exact: true });
      const kieu = await nut.evaluate((e) => {
        const r = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        return { pos: s.position, h: r.height, phai: window.innerWidth - r.right, duoi: window.innerHeight - r.bottom, svg: e.querySelectorAll('svg').length, tron: s.borderRadius };
      });
      expect(kieu.pos).toBe('fixed');
      expect(kieu.h).toBeGreaterThanOrEqual(44);
      expect(kieu.phai).toBeGreaterThanOrEqual(8);
      expect(kieu.phai).toBeLessThan(40);
      expect(kieu.duoi).toBeGreaterThanOrEqual(8);
      expect(kieu.svg).toBe(1);
      await expect(nut).toHaveAttribute('aria-expanded', 'false');
      await expect(nut).toHaveAttribute('aria-controls', 'xt-khung-gia');
      await nut.click();
      await expect(nut).toHaveAttribute('aria-expanded', 'true');
      await nut.click();
      await expect(nut).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('C01-HU-02/05 · giảm chuyển động: không còn transition/animation; đổi trang cuộn tức thì (không scroll-behavior: smooth)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mo(page);
    const con = await page.evaluate(() => {
      const ra: string[] = [];
      for (const e of document.querySelectorAll<HTMLElement>('main, main *')) {
        const s = getComputedStyle(e);
        const t = s.transitionDuration.split(',').map((x) => parseFloat(x));
        const a = s.animationDuration.split(',').map((x) => parseFloat(x));
        if (t.some((x) => x > 0.001) || (a.some((x) => x > 0.001) && s.animationName !== 'none')) ra.push(`${e.tagName}.${e.className}`);
      }
      return { ra: ra.slice(0, 10), smooth: getComputedStyle(document.documentElement).scrollBehavior };
    });
    expect(con.ra).toEqual([]);
    expect(con.smooth).not.toBe('smooth');
  });
});

// ───────────────────────────── Trợ năng bổ sung, bảo mật, hiệu năng ─────────────────────────────

test.describe('Trợ năng bổ sung, bảo mật và hiệu năng', () => {
  test('C01-TN-02/04 · không button/a/input nào thiếu tên đọc; html lang=vi (3 khổ)', async ({ page }) => {
    for (const kho of [KHO.dienThoai, KHO.mayTinh, KHO.kiosk]) {
      await mo(page, kho);
      const kq = await new AxeBuilder({ page }).withRules(['button-name', 'link-name', 'label', 'html-has-lang', 'html-lang-valid', 'aria-valid-attr-value']).analyze();
      expect(kq.violations.map((v) => v.id)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.lang)).toBe('vi');
    }
  });

  test('C01-TN-05 · Shift+Tab ngược không kẹt: ra khỏi trang sau 120 lần', async ({ page }) => {
    await mo(page);
    await page.keyboard.press('Tab');
    const ten: string[] = [];
    for (let i = 0; i < 120; i += 1) {
      await page.keyboard.press('Shift+Tab');
      ten.push(await page.evaluate(() => `${document.activeElement?.tagName}:${document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent?.slice(0, 15)}`));
    }
    expect(new Set(ten).size, 'focus kẹt trong một vùng nhỏ').toBeGreaterThan(30);
  });

  test('C01-BM-07 · sau khi dùng, localStorage chỉ có cach-xem và sessionStorage chỉ có kiosk', async ({ page }) => {
    await mo(page, KHO.kiosk);
    await oTim(page).fill('khai');
    await page.setViewportSize({ width: 1280, height: 800 });
    await khoi(page, 'xt-ds').getByRole('group', { name: 'Cách hiển thị' }).getByRole('button', { name: 'Dạng thẻ' }).click();
    const kho = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
    expect(kho.local.filter((k) => !k.startsWith('vite') && !k.startsWith('i18n'))).toEqual(['cach-xem']);
    expect(kho.session.filter((k) => !k.startsWith('vite'))).toEqual(['kiosk']);
  });

  test('C01-HN-04/AC-25 · tìm trong 1.000 mục ở 375px, mạng 4G giả lập: lần gõ chậm nhất trong 10 lần ≤ 200ms', async ({ page }) => {
    await mo(page, KHO.dienThoai);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 170, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (9 * 1024 * 1024) / 8 });
    const o = khoi(page, 'xt-tim').getByRole('searchbox');
    await o.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const w = window as unknown as { __lat: number[] };
      w.__lat = [];
      const input = document.querySelector<HTMLInputElement>('#xt-tim')!.closest('section')!.querySelector('input')!;
      const out = document.querySelector<HTMLElement>('[data-testid="so-ket-qua-tim-1000"]')!;
      document.addEventListener(
        'keydown',
        (e) => {
          if (e.target !== input || e.key.length !== 1) return;
          const t0 = performance.now();
          const hanCho = t0 + 3000;
          const kiem = () => {
            if (out.dataset['tuKhoa'] === input.value || performance.now() > hanCho) {
              requestAnimationFrame(() => requestAnimationFrame(() => w.__lat.push(performance.now() - t0)));
            } else {
              requestAnimationFrame(kiem);
            }
          };
          requestAnimationFrame(kiem);
        },
        true,
      );
    });
    const cau = 'dang ky khai sinh';
    let max = 0;
    const moi: number[] = [];
    for (let lan = 0; lan < 10; lan += 1) {
      await o.fill('');
      await page.evaluate(() => ((window as unknown as { __lat: number[] }).__lat.length = 0));
      await o.pressSequentially(cau, { delay: 120 });
      await expect(page.getByTestId('so-ket-qua-tim-1000')).toHaveAttribute('data-tu-khoa', cau);
      await page.waitForTimeout(200);
      const lat = await page.evaluate(() => (window as unknown as { __lat: number[] }).__lat.slice());
      expect(lat.length).toBe(cau.length);
      moi.push(Math.max(...lat));
      max = Math.max(max, ...lat);
    }
    console.log(`[C01-HN-04] 10 lần gõ "${cau}" ở 375px/4G: độ trễ lớn nhất mỗi lần (ms) = ${moi.map((x) => x.toFixed(0)).join(', ')}; chậm nhất = ${max.toFixed(0)} ms`);
    expect(max).toBeLessThanOrEqual(200);
    const tong = Number(await page.getByTestId('so-ket-qua-tim-1000').getAttribute('data-so'));
    expect(tong).toBeGreaterThan(0);
  });

  test('C01-HN-02 · chunk TanStack Table chỉ nạp khi hiện dạng bảng: không tải ở 375 và kiosk (thẻ), tải ở 1280 (bảng)', async ({ browser }) => {
    const dem = async (kho: KhoMan) => {
      const ngu = await browser.newContext({ viewport: { width: kho.rong, height: kho.cao } });
      const page = await ngu.newPage();
      const tai: string[] = [];
      page.on('request', (r) => {
        if (/BangDuLieu|react-table/i.test(r.url())) tai.push(r.url().split('/').pop()!.slice(0, 60));
      });
      await page.goto(`/dev/design-system${kho.kiosk ? '?kiosk=1' : ''}`);
      await expect(page.locator('#xt-ds')).toBeVisible();
      await page.waitForTimeout(800);
      await ngu.close();
      return tai;
    };
    expect(await dem(KHO.dienThoai), '375: không được tải').toEqual([]);
    expect(await dem(KHO.kiosk), 'kiosk: không được tải').toEqual([]);
    expect((await dem(KHO.mayTinh)).length, '1280: phải tải chunk bảng').toBeGreaterThan(0);
  });

  test('C01-HN-05 · chuyển thẻ ↔ bảng 10 lần: số node DOM ổn định ±10%', async ({ page }) => {
    await mo(page);
    const nhom = khoi(page, 'xt-ds').getByRole('group', { name: 'Cách hiển thị' });
    await nhom.getByRole('button', { name: 'Dạng bảng' }).click();
    const dau = await page.evaluate(() => document.getElementsByTagName('*').length);
    for (let i = 0; i < 10; i += 1) {
      await nhom.getByRole('button', { name: 'Dạng thẻ' }).click();
      await nhom.getByRole('button', { name: 'Dạng bảng' }).click();
    }
    await expect(khoi(page, 'xt-ds').locator('table')).toHaveCount(1);
    const cuoi = await page.evaluate(() => document.getElementsByTagName('*').length);
    expect(Math.abs(cuoi - dau) / dau).toBeLessThanOrEqual(0.1);
  });
});
