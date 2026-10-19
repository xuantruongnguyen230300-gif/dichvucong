import { appendFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { L75, L8 } from './du-lieu/linh-vuc';

/**
 * CLS (Cumulative Layout Shift) trên BẢN BUILD, ma trận: trang × khổ màn hình × độ trễ của API (tức thì và 3 giây).
 * Mục tiêu < 0,05 (ngưỡng "tốt" của Web Vitals là 0,1; plan F02 §5 và F09 §5 đòi chặt hơn).
 * Trang: `/`, `/thu-tuc`, `/linh-vuc` (75 ô và 8 ô, dữ liệu giả bằng page.route); API khác đi thẳng tới máy chủ (nguồn Mẫu).
 * Khổ: 375×812, 768×1024, 1280×800 và kiosk 1080×1920 (`?kiosk=1`).
 * Chạy: npx playwright test -c e2e/ban-build.config.ts cls-ma-tran --project=chromium
 * Đặt DVC_KETQUA_DO=<tệp> để ghi mỗi số đo thành một dòng JSON.
 */

const NGUONG = 0.05;

const KHO = [
  { ten: '375', w: 375, h: 812, kiosk: false },
  { ten: '768', w: 768, h: 1024, kiosk: false },
  { ten: '1280', w: 1280, h: 800, kiosk: false },
  { ten: 'kiosk', w: 1080, h: 1920, kiosk: true },
] as const;

const TRANG = [
  { ten: '/', duong: '/', lv: undefined },
  { ten: '/thu-tuc', duong: '/thu-tuc', lv: undefined },
  { ten: '/linh-vuc (75 ô)', duong: '/linh-vuc', lv: L75 },
  { ten: '/linh-vuc (8 ô)', duong: '/linh-vuc', lv: L8 },
] as const;

const TRE = [0, 3000] as const;

test.describe('CLS ma trận (bản build)', () => {
  for (const t of TRANG) {
    for (const k of KHO) {
      for (const tre of TRE) {
        test(`CLS · ${t.ten} · ${k.ten} · API trễ ${tre} ms · < ${NGUONG}`, async ({ browser }) => {
          const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: k.w, height: k.h }, baseURL: process.env.E2E_BASE_URL ?? 'https://localhost:7157' });
          const page = await ctx.newPage();
          const cho = () => (tre ? new Promise<void>((x) => setTimeout(x, tre)) : Promise.resolve());

          // Mọi API còn lại (thủ tục, trung tâm, ô dịch vụ…) trễ cùng mức. Khai báo trước: route khai sau được ưu tiên.
          await page.route('**/api/**', async (r) => {
            await cho();
            await r.continue();
          });

          if (t.lv) {
            await page.route('**/api/linh-vuc', async (r) => {
              await cho();
              await r.fulfill({ status: 200, contentType: 'application/json', json: t.lv });
            });
            await page.route('**/api/linh-vuc/quay', async (r) => {
              await cho();
              await r.fulfill({ status: 200, contentType: 'application/json', json: [] });
            });
          }
          // Mọi API còn lại (thủ tục, trung tâm, ô dịch vụ…) trễ cùng mức.
          await page.route('**/api/**', async (r) => {
            await cho();
            await r.continue();
          });

          await page.addInitScript(() => {
            const w = window as unknown as { __cls: number; __ls: string[] };
            w.__cls = 0;
            w.__ls = [];
            new PerformanceObserver((l) => {
              for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean; startTime: number; sources: { node?: Element; previousRect: DOMRect; currentRect: DOMRect }[] }[]) {
                if (!e.hadRecentInput) w.__cls += e.value;
                w.__ls.push(
                  `${Math.round(e.startTime)}ms ${e.value.toFixed(4)} ${e.sources
                    .map((x) => `${x.node?.nodeName}.${String((x.node as HTMLElement | undefined)?.className ?? '').slice(0, 30)} ${Math.round(x.previousRect.y)}→${Math.round(x.currentRect.y)}`)
                    .join(';')}`,
                );
              }
            }).observe({ type: 'layout-shift', buffered: true });
          });

          await page.goto(t.duong + (k.kiosk ? '?kiosk=1' : ''));
          await page.waitForTimeout(tre + 1500);
          await page.waitForLoadState('networkidle');
          await page.evaluate(() => new Promise<void>((x) => requestAnimationFrame(() => requestAnimationFrame(() => x()))));
          await page.waitForTimeout(800);

          const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
          const ds = await page.evaluate(() => (window as unknown as { __ls: string[] }).__ls);
          const dong = { trang: t.ten, kho: k.ten, tre, cls: Number(cls.toFixed(4)), dich: ds.slice(0, 6) };
          console.log(`CLS ${t.ten} ${k.ten} tre=${tre}: ${cls.toFixed(4)}${cls >= NGUONG ? ' ' + JSON.stringify(ds.slice(0, 4)) : ''}`);
          if (process.env.DVC_KETQUA_DO) appendFileSync(process.env.DVC_KETQUA_DO, JSON.stringify(dong) + '\n');
          test.info().annotations.push({ type: 'cls', description: `${cls.toFixed(4)} ${JSON.stringify(ds)}` });
          expect(cls).toBeLessThan(NGUONG);
          await ctx.close();
        });
      }
    }
  }
});
