import { expect, test, type Browser, type Page } from '@playwright/test';
import { GOC } from './du-lieu/chung';

/**
 * R1 (F06 test.md): chạy tranh ghi địa chỉ. Gõ ô tìm của trang, mở "Trợ lý" NGAY, hỏi, bấm "Xem chi tiết" NGAY trong khung:
 * popup phải mở (`ma` trên địa chỉ) và `q` phải còn. Lặp ≥ 20 lần ở kiosk 1080×1920 và ở khổ thường (1280×800, 375×812);
 * lần chẵn dùng fill (một lần ghi), lần lẻ gõ từng phím (ghi trễ chồng nhau).
 * Chạy: npx playwright test -c e2e/ban-build.config.ts tranh-ghi-dia-chi --project=chromium
 */

const LAN = Number(process.env.DVC_R1_LAN ?? 20);

const nutTroLy = (p: Page) => p.getByRole('button', { name: 'Trợ lý', exact: true });
const khungChat = (p: Page) => p.getByRole('dialog', { name: 'Trợ lý thủ tục' });
const popup = (p: Page) => p.locator('[role="dialog"]:not(#khung-tro-ly)');

async function mot(browser: Browser, w: number, h: number, kiosk: boolean, lan: number) {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  try {
    await page.goto('/thu-tuc' + (kiosk ? '?kiosk=1' : ''));
    const oTim = page.getByRole('searchbox').first();
    await expect(oTim).toBeVisible();
    if (lan % 2 === 0) await oTim.fill('khai sinh');
    else await oTim.pressSequentially('khai sinh', { delay: 20 });
    await nutTroLy(page).click(); // ngay, không chờ ghi địa chỉ trễ
    const o = khungChat(page).getByRole('textbox', { name: 'Câu hỏi' });
    await o.fill('kết hôn');
    await khungChat(page).getByRole('button', { name: 'Gửi', exact: true }).click();
    const nut = khungChat(page).getByRole('button', { name: /Xem chi tiết/ }).first();
    await expect(nut).toBeVisible({ timeout: 15000 });
    await nut.click(); // ngay khi đáp án hiện
    await expect(popup(page), `lần ${lan}: popup phải mở`).toBeVisible({ timeout: 5000 });
    // Cho các lần ghi trễ chạy xong rồi mới đọc địa chỉ cuối.
    await page.waitForTimeout(700);
    const u = new URL(page.url());
    expect(u.searchParams.get('ma'), `lần ${lan}: ma trên địa chỉ`).toBeTruthy();
    expect(u.searchParams.get('q'), `lần ${lan}: q còn trên địa chỉ`).toBe('khai sinh');
    await expect(popup(page), `lần ${lan}: popup còn mở sau khi địa chỉ ổn định`).toBeVisible();
    await expect(page.getByRole('searchbox').first()).toHaveValue('khai sinh');
  } finally {
    await ctx.close();
  }
}

test.describe('R1 · chạy tranh ghi địa chỉ (ô tìm + Trợ lý + Xem chi tiết)', () => {
  test.setTimeout(20 * 60_000);
  const kho = [
    { ten: 'kiosk 1080×1920', w: 1080, h: 1920, kiosk: true },
    { ten: 'thường 1280×800', w: 1280, h: 800, kiosk: false },
    { ten: 'thường 375×812', w: 375, h: 812, kiosk: false },
  ];
  for (const k of kho) {
    test(`R1 · ${k.ten}: ${LAN} lần, popup luôn mở và q còn trên địa chỉ`, async ({ browser }) => {
      for (let i = 0; i < LAN; i++) await mot(browser, k.w, k.h, k.kiosk, i);
    });
  }
});

/**
 * R1b: không qua khung Trợ lý — gõ ô tìm của trang rồi bấm "Xem chi tiết" ở thẻ đầu tiên đúng lúc lần ghi `q` trễ (~300 ms)
 * sắp chạy. Cửa sổ nguy hiểm: 150–400 ms sau phím cuối. Popup phải mở và `q` còn trên địa chỉ.
 */
test.describe('R1b · chạy tranh ghi địa chỉ không qua Trợ lý (gõ rồi bấm thẻ trong 0–400 ms)', () => {
  test.setTimeout(10 * 60_000);
  for (const kho of [
    { ten: '1280×800', w: 1280, h: 800, kiosk: false },
    { ten: 'kiosk 1080×1920', w: 1080, h: 1920, kiosk: true },
  ]) {
    test(`R1b · ${kho.ten}: popup luôn mở và q còn`, async ({ browser }) => {
      const loi: string[] = [];
      for (const cho of [0, 100, 200, 250, 280, 300, 320, 350, 400]) {
        for (let lan = 0; lan < 3; lan++) {
          const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: kho.w, height: kho.h } });
          const page = await ctx.newPage();
          await page.addInitScript(() => window.localStorage.setItem('cach-xem', 'the')); // dạng thẻ: nút "Xem chi tiết" hiện sẵn
          await page.goto('/thu-tuc' + (kho.kiosk ? '?kiosk=1' : ''));
          const the = page.locator('article, tbody tr').first();
          await expect(the).toBeVisible();
          const oTim = page.getByRole('searchbox').first();
          await oTim.click();
          await page.keyboard.type('khai sinh');
          await page.waitForTimeout(cho);
          const nut = page.getByRole('button', { name: /Xem chi tiết/ }).first();
          await nut.click({ timeout: 5000 });
          await page.waitForTimeout(900);
          const u = new URL(page.url());
          const mo = await page.locator('[role="dialog"]:not(#khung-tro-ly)').isVisible();
          if (!mo || !u.searchParams.get('ma') || u.searchParams.get('q') !== 'khai sinh') {
            loi.push(`cho=${cho}ms lần ${lan}: popup=${mo} ma=${u.searchParams.get('ma')} q=${u.searchParams.get('q')}`);
          }
          await ctx.close();
        }
      }
      expect(loi, loi.join('\n')).toEqual([]);
    });
  }
});
