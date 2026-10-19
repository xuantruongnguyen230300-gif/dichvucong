import { expect, test, type Page } from '@playwright/test';
import { CSS_GIAN_CHU, GOC, ganCssThu, ghiYeuCau, khongTranNgang } from './du-lieu/chung';

/** F09 · bổ sung ca bố cục/bàn phím/nạp chunk ở kiosk (mã ca F09-… theo testcases.md). Chạy cùng cấu hình ban-build. */

const KIOSK = { width: 1080, height: 1920 };
const nutBdl = (p: Page) => p.getByRole('button', { name: 'Bắt đầu lại', exact: true });
const nutTroLy = (p: Page) => p.getByRole('button', { name: 'Trợ lý', exact: true });
const khungChat = (p: Page) => p.getByRole('dialog', { name: 'Trợ lý thủ tục' });
const oNhapChat = (p: Page) => khungChat(p).getByRole('textbox', { name: 'Câu hỏi' });
const dongNhac = (p: Page) => p.getByText('Nhớ đăng xuất khi dùng xong', { exact: true });
const popup = (p: Page) => p.locator('[role="dialog"]:not(#khung-tro-ly)');

async function taoKiosk(browser: import('@playwright/test').Browser, kho: { width: number; height: number } = KIOSK) {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: kho });
  return { ctx, page: await ctx.newPage() };
}

async function hoiChat(page: Page, cau: string) {
  const truoc = await khungChat(page).locator('[data-tin]').filter({ hasText: 'Trợ lý trả lời:' }).count();
  await oNhapChat(page).fill(cau);
  await oNhapChat(page).press('Enter');
  await expect(khungChat(page).locator('[data-tin]').filter({ hasText: 'Trợ lý trả lời:' })).toHaveCount(truoc + 1, { timeout: 15000 });
}

const giao = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

test.describe('F09 · bổ sung', () => {
  test('F09-KB-09 · kiosk không thêm API/dữ liệu: tập yêu cầu /api/ ở trang chủ giống trang chủ thường', async ({ browser }) => {
    const tap = async (duong: string) => {
      const { ctx, page } = await taoKiosk(browser, { width: 1280, height: 900 });
      const ds = ghiYeuCau(page);
      await page.goto(duong);
      await page.waitForLoadState('networkidle');
      await ctx.close();
      return [...new Set(ds.filter((u) => new URL(u).pathname.startsWith('/api/')).map((u) => new URL(u).pathname))].sort();
    };
    expect(await tap('/?kiosk=1')).toEqual(await tap('/?kiosk=0'));
  });

  test('F09-KB-11 / NV-16 · kiosk ở 375: không cuộn ngang; nút "Bắt đầu lại" (trái) không che nút "Trợ lý" (phải)', async ({ browser }) => {
    const { ctx, page } = await taoKiosk(browser, { width: 375, height: 812 });
    await page.goto('/?kiosk=1');
    await expect(nutBdl(page)).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
    const a = (await nutBdl(page).boundingBox())!;
    const b = (await nutTroLy(page).boundingBox())!;
    expect(giao(a, b), `Bắt đầu lại ${JSON.stringify(a)} giao Trợ lý ${JSON.stringify(b)}`).toBe(false);
    await ctx.close();
  });

  test('F09-NV-07 · khung trợ lý mở: nút "Bắt đầu lại" ở trái, khung ở phải, không che ô nhập hay nút Gửi', async ({ browser }) => {
    const { ctx, page } = await taoKiosk(browser);
    await page.goto('/?kiosk=1');
    await nutTroLy(page).click();
    await expect(oNhapChat(page)).toBeFocused();
    const bdl = (await nutBdl(page).boundingBox())!;
    for (const el of [khungChat(page), oNhapChat(page), khungChat(page).getByRole('button', { name: 'Gửi', exact: true })]) {
      expect(giao(bdl, (await el.boundingBox())!)).toBe(false);
    }
    expect(bdl.x).toBeLessThan((await khungChat(page).boundingBox())!.x);
    await ctx.close();
  });

  test('F09-NV-06 · popup mở: nút nằm trên lớp phủ (hit-test đúng nút), bấm được, không che chân popup', async ({ browser }) => {
    const { ctx, page } = await taoKiosk(browser);
    await page.goto('/?kiosk=1&ma=1.001193');
    await expect(popup(page)).toBeVisible();
    await page.waitForTimeout(300);
    const dau = await nutBdl(page).evaluate((n) => {
      const r = n.getBoundingClientRect();
      const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !!e && (e === n || n.contains(e));
    });
    expect(dau).toBe(true);
    const nut = (await nutBdl(page).boundingBox())!;
    const chan = await popup(page).getByRole('link', { name: /Xem và nộp trên Cổng DVC/ }).boundingBox();
    if (chan) expect(giao(nut, chan), 'nút Bắt đầu lại che liên kết Cổng DVC của popup').toBe(false);
    await ctx.close();
  });

  test('F09-NV-12 / TN-02 · Tab tới nút, Enter và Space đều kích hoạt (về /?kiosk=1); viền focus nhìn thấy', async ({ browser }) => {
    for (const phim of ['Enter', 'Space']) {
      const { ctx, page } = await taoKiosk(browser);
      await page.goto('/thu-tuc?kiosk=1');
      await expect(nutBdl(page)).toBeVisible();
      await nutBdl(page).focus();
      const vien = await nutBdl(page).evaluate((e) => {
        const s = getComputedStyle(e);
        return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
      });
      expect(vien).toBe(true);
      await page.keyboard.press(phim);
      await page.waitForURL((u) => u.pathname === '/' && !u.search);
      await expect(page.locator('html')).toHaveClass(/kiosk/);
      await ctx.close();
    }
  });

  test('F09-NV-14 · chữ "Bắt đầu lại" và "Nhớ đăng xuất…" chỉ ở chunk kiosk, không ở bundle chính (index, vendor)', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const chinh = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]!);
    expect(chinh.length).toBeGreaterThan(0);
    for (const u of chinh) {
      const js = await (await request.get(u)).text();
      expect(js, u).not.toContain('Bắt đầu lại');
      expect(js, u).not.toContain('Nhớ đăng xuất khi dùng xong');
    }
  });

  test('F09-NV-17 · chunk kiosk về chậm 3 giây: chưa có nút trong khoảng đó, về rồi nút xuất hiện, không lỗi', async ({ browser }) => {
    const { ctx, page } = await taoKiosk(browser);
    const loi: string[] = [];
    page.on('pageerror', (e) => loi.push(e.message));
    await page.route(/giaoDienKiosk-[^/]+\.js/, async (r) => {
      await new Promise((x) => setTimeout(x, 3000));
      await r.continue();
    });
    await page.goto('/?kiosk=1');
    await page.waitForTimeout(1200);
    await expect(nutBdl(page)).toHaveCount(0);
    await expect(nutBdl(page)).toBeVisible({ timeout: 8000 });
    expect(loi).toEqual([]);
    await ctx.close();
  });

  test('F09-NH-14/15/18 · khung chat: mở trống 0 dòng; chỉ câu về số điện thoại, email, địa chỉ, giờ làm việc, giá vàng -> 0 dòng; /linh-vuc và 404 -> 0 dòng', async ({ browser }) => {
    const { ctx, page } = await taoKiosk(browser);
    await page.goto('/?kiosk=1');
    await nutTroLy(page).click();
    await expect(khungChat(page).getByText('Nhớ đăng xuất khi dùng xong')).toHaveCount(0);
    for (const c of ['số điện thoại trung tâm', 'email trung tâm', 'trung tâm ở đâu', 'mấy giờ làm việc', 'giá vàng hôm nay']) {
      await hoiChat(page, c);
      await expect(khungChat(page).getByText('Nhớ đăng xuất khi dùng xong')).toHaveCount(0);
    }
    for (const d of ['/linh-vuc', '/khong-co-trang-nay']) {
      await page.goto(d);
      await page.waitForLoadState('networkidle');
      await expect(dongNhac(page)).toHaveCount(0);
    }
    await ctx.close();
  });

  test('F09-KT-08 · không bấm "Bắt đầu lại": câu có số điện thoại vẫn còn trên màn hình khi đóng rồi mở lại khung (đúng thiết kế BR-3)', async ({ browser }) => {
    const { ctx, page } = await taoKiosk(browser);
    await page.goto('/?kiosk=1');
    await nutTroLy(page).click();
    await hoiChat(page, 'số 0912345678 của tôi nộp hồ sơ chưa');
    await page.keyboard.press('Escape');
    await nutTroLy(page).click();
    await expect(khungChat(page)).toContainText('0912345678');
    const kho = await page.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage }, c: document.cookie, h: history.state, u: location.href }));
    expect(kho).not.toContain('0912345678');
    await ctx.close();
  });

  test('F09-TN-06/07/09 · kiosk 1080×1920: không cuộn ngang ở / /thu-tuc /linh-vuc, giãn chữ không tràn; sau "Bắt đầu lại" con trỏ ở đầu trang và có h1', async ({ browser }) => {
    const { ctx, page } = await taoKiosk(browser);
    for (const d of ['/?kiosk=1', '/thu-tuc', '/linh-vuc']) {
      await page.goto(d);
      await page.waitForLoadState('networkidle');
      expect(await khongTranNgang(page), d).toBe(true);
      await ganCssThu(page, CSS_GIAN_CHU);
      expect(await khongTranNgang(page), `${d} giãn chữ`).toBe(true);
    }
    await nutBdl(page).click();
    await page.waitForURL((u) => u.pathname === '/');
    await expect(page.locator('h1').first()).toBeAttached();
    expect(await page.evaluate(() => document.activeElement === document.body || document.activeElement === document.documentElement)).toBe(true);
    await ctx.close();
  });

  test('F09-BL-24 · trước khi bấm: sau khi hỏi câu có số điện thoại, storage/cookie/history.state/địa chỉ không chứa câu hỏi', async ({ browser }) => {
    const { ctx, page } = await taoKiosk(browser);
    await page.goto('/?kiosk=1');
    await nutTroLy(page).click();
    await hoiChat(page, 'số 0912345678 của tôi nộp hồ sơ chưa');
    const kho = await page.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage }, c: document.cookie, h: history.state, u: location.href }));
    expect(kho).not.toContain('0912345678');
    expect(kho).not.toContain('nộp hồ sơ');
    await ctx.close();
  });
});
