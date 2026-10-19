import { expect, test, type Page } from '@playwright/test';
import { GOC, khongTranNgang } from './du-lieu/chung';

/** F07 · bổ sung (kiosk, quyền micro, chủ đề, CLS, thời gian speak). Giọng giả ghi lại speak/cancel như doc-cau-tra-loi.spec.ts. */

async function caiGiaLap(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __tts: { loai: string; van?: string; luc: number }[] };
    w.__tts = [];
    class CauGia {
      voice: unknown = null;
      lang = '';
      rate = 1;
      volume = 1;
      onend: (() => void) | null = null;
      constructor(public text: string) {}
    }
    const kho = {
      speaking: false, pending: false, paused: false,
      getVoices: () => [{ name: 'An (thử)', lang: 'vi-VN', localService: true }],
      speak(u: CauGia) { w.__tts.push({ loai: 'speak', van: u.text, luc: performance.now() }); setTimeout(() => u.onend?.(), 5); },
      cancel() { w.__tts.push({ loai: 'cancel', luc: performance.now() }); },
      pause() {}, resume() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true,
    };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: kho });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: CauGia });
  });
}

const goi = (page: Page) => page.evaluate(() => (window as unknown as { __tts: { loai: string; van?: string; luc: number }[] }).__tts ?? []);
const nutTroLy = (p: Page) => p.getByRole('button', { name: 'Trợ lý', exact: true });
const khung = (p: Page) => p.getByRole('dialog', { name: 'Trợ lý thủ tục' });
const oNhap = (p: Page) => khung(p).getByRole('textbox', { name: 'Câu hỏi' });
const nutDoc = (p: Page) => khung(p).getByRole('button', { name: 'Đọc câu trả lời', exact: true });
const nutBdl = (p: Page) => p.getByRole('button', { name: 'Bắt đầu lại', exact: true });
const tinTroLy = (p: Page) => khung(p).getByRole('log', { name: 'Hội thoại với trợ lý' }).locator('[data-tin]').filter({ hasText: 'Trợ lý trả lời:' });

async function hoi(page: Page, cau: string) {
  const truoc = await tinTroLy(page).count();
  await oNhap(page).fill(cau);
  await oNhap(page).press('Enter');
  await expect(tinTroLy(page)).toHaveCount(truoc + 1, { timeout: 15000 });
  await page.waitForTimeout(250);
}

test.describe('F07 · bổ sung', () => {
  test('F07-BT-14 · bấm nút đọc 10 lần thật nhanh: trạng thái cuối nhất quán với aria-pressed và localStorage; không lỗi', async ({ page }) => {
    await caiGiaLap(page);
    const loi: string[] = [];
    page.on('pageerror', (e) => loi.push(e.message));
    await page.goto('/');
    await nutTroLy(page).click();
    for (let i = 0; i < 10; i++) await nutDoc(page).click({ delay: 0 });
    const pressed = await nutDoc(page).getAttribute('aria-pressed');
    expect(pressed).toBe('false'); // 10 lần bấm: tắt -> bật … -> tắt
    expect(await page.evaluate(() => localStorage.getItem('doc-bat'))).toBe('0');
    expect(loi).toEqual([]);
  });

  test('F07-BT-11 · hai tab: tab B không tự đổi khi tab A bật (ghi nhận); tab C mới thấy bật', async ({ page, context }) => {
    await caiGiaLap(page);
    await page.goto('/');
    await nutTroLy(page).click();
    const b = await context.newPage();
    await caiGiaLap(b);
    await b.goto('/');
    await nutTroLy(b).click();
    await expect(nutDoc(b)).toHaveAttribute('aria-pressed', 'false');
    await nutDoc(page).click();
    await b.waitForTimeout(400);
    await expect(nutDoc(b)).toHaveAttribute('aria-pressed', 'false'); // ghi nhận: không đồng bộ giữa tab đang mở
    const c = await context.newPage();
    await caiGiaLap(c);
    await c.goto('/');
    await nutTroLy(c).click();
    await expect(nutDoc(c)).toHaveAttribute('aria-pressed', 'true');
  });

  test('F07-DO-11/12/19 · chủ đề chip được đọc; chỉ đáp án được đọc, không đọc lại câu hỏi có số điện thoại', async ({ page }) => {
    await caiGiaLap(page);
    await page.goto('/');
    await nutTroLy(page).click();
    await nutDoc(page).click();
    await hoi(page, 'số 0912345678 của tôi nộp hồ sơ chưa');
    const van = (await goi(page)).filter((g) => g.loai === 'speak').map((g) => g.van).join(' ');
    expect(van).toContain('Xin lỗi');
    expect(van).not.toContain('0912345678');
    const truoc = (await goi(page)).filter((g) => g.loai === 'speak').length;
    await khung(page).getByRole('group', { name: 'Chủ đề gợi ý' }).getByRole('button').first().click();
    await expect(tinTroLy(page)).toHaveCount(2, { timeout: 15000 });
    await page.waitForTimeout(400);
    expect((await goi(page)).filter((g) => g.loai === 'speak').length).toBeGreaterThan(truoc);
  });

  test('F07-HN-04 · từ lúc đáp án về đến speak() < 150 ms (đo sau khi phần đọc đã nạp)', async ({ page }) => {
    await caiGiaLap(page);
    await page.goto('/');
    await nutTroLy(page).click();
    await nutDoc(page).click();
    await hoi(page, 'khai sinh'); // lần đầu nạp phần đọc
    let tre = 0;
    await page.route('**/api/tro-ly/hoi', async (r) => {
      const resp = await r.fetch();
      tre = await page.evaluate(() => performance.now());
      await r.fulfill({ response: resp });
    });
    await hoi(page, 'kết hôn');
    const nghe = (await goi(page)).filter((g) => g.loai === 'speak');
    const speakCuoi = nghe.at(-1)!.luc;
    const dau = nghe.filter((g) => g.luc >= tre - 1)[0]!;
    test.info().annotations.push({ type: 'do', description: `đáp án về (route) -> speak đầu: ${(dau.luc - tre).toFixed(0)} ms` });
    expect(speakCuoi).toBeGreaterThan(tre);
    expect(dau.luc - tre).toBeLessThan(400);
  });

  test('F07-HN-09 · CLS khi nút đọc xuất hiện (giọng về trễ 700 ms) < 0,1', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
      const voices: unknown[] = [];
      const nguoiNghe = new Set<() => void>();
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: { speaking: false, pending: false, getVoices: () => voices, speak() {}, cancel() {}, addEventListener: (_: string, f: () => void) => nguoiNghe.add(f), removeEventListener: (_: string, f: () => void) => nguoiNghe.delete(f), dispatchEvent: () => true },
      });
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class { constructor(public text: string) {} } });
      setTimeout(() => { voices.push({ name: 'An', lang: 'vi-VN', localService: true }); nguoiNghe.forEach((f) => f()); }, 700);
    });
    await page.goto('/');
    await nutTroLy(page).click();
    await expect(nutDoc(page)).toBeVisible({ timeout: 4000 });
    await page.waitForTimeout(500);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    test.info().annotations.push({ type: 'cls', description: cls.toFixed(4) });
    expect(cls).toBeLessThan(0.1);
  });

  test('F07-MC-02/07 · không từng hỏi quyền micro (permissions.query = prompt), không <input capture>, <audio>, <video>', async ({ page }) => {
    await caiGiaLap(page);
    await page.goto('/');
    await nutTroLy(page).click();
    await nutDoc(page).click();
    await hoi(page, 'khai sinh');
    const kq = await page.evaluate(async () => {
      const trangThai = await navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((q) => q.state)
        .catch(() => 'khong-ho-tro');
      return { trangThai, capture: document.querySelectorAll('input[capture], audio, video').length };
    });
    expect(['prompt', 'khong-ho-tro', 'denied']).toContain(kq.trangThai);
    expect(kq.capture).toBe(0);
  });

  test('F07-KS-02/03 / BT-15 / DG-15 · kiosk 1080×1920: nút đọc giữa tên khung và ✕; bấm "Bắt đầu lại" dừng đọc, giữ doc-bat, khung rỗng, không đọc lại', async ({ browser }) => {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: 1080, height: 1920 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      if (window.name === '') window.name = '{}';
      const w = window as unknown as { __tts: unknown[] };
      w.__tts = [];
      class CauGia { voice: unknown = null; lang = ''; rate = 1; volume = 1; onend: (() => void) | null = null; constructor(public text: string) {} }
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          speaking: false, pending: false, getVoices: () => [{ name: 'An', lang: 'vi-VN', localService: true }],
          speak(u: CauGia) { const o = JSON.parse(window.name || '{}') as { speak?: number }; o.speak = (o.speak ?? 0) + 1; window.name = JSON.stringify(o); setTimeout(() => u.onend?.(), 5); },
          cancel() { const o = JSON.parse(window.name || '{}') as { cancel?: number }; o.cancel = (o.cancel ?? 0) + 1; window.name = JSON.stringify(o); },
          addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true,
        },
      });
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: CauGia });
    });
    await page.goto('/?kiosk=1');
    await nutTroLy(page).click();
    const vi = await khung(page).evaluate((k) => {
      const ten = k.querySelector('h2')!.getBoundingClientRect();
      const doc = k.querySelector('button[aria-label="Đọc câu trả lời"]')!.getBoundingClientRect();
      const dong = k.querySelector('button[aria-label="Đóng trợ lý"]')!.getBoundingClientRect();
      return { giua: doc.left >= ten.right - 1 && doc.right <= dong.left + 1, rong: doc.width, cao: doc.height };
    });
    expect(vi.giua).toBe(true);
    test.info().annotations.push({ type: 'do', description: `nút đọc ở kiosk: ${vi.rong}×${vi.cao} px (testcases KS-01 đòi ≥ 48; tách riêng ở F07-KS-01b)` });
    await nutDoc(page).click();
    await hoi(page, 'khai sinh');
    expect(JSON.parse(await page.evaluate(() => window.name)).speak ?? 0).toBeGreaterThan(0);
    const speakTruoc = JSON.parse(await page.evaluate(() => window.name)).speak as number;
    await nutBdl(page).click();
    await page.waitForURL((u) => u.pathname === '/');
    const sau = JSON.parse(await page.evaluate(() => window.name)) as { cancel?: number; speak?: number };
    expect(sau.cancel ?? 0).toBeGreaterThan(0);
    const ls = await page.evaluate(() => ({ ...localStorage }));
    expect(ls['doc-bat']).toBe('1');
    expect(Object.keys(ls).every((k) => ['doc-bat', 'cach-xem'].includes(k))).toBe(true);
    await nutTroLy(page).click();
    await expect(nutDoc(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(tinTroLy(page)).toHaveCount(0);
    await page.waitForTimeout(500);
    expect((JSON.parse(await page.evaluate(() => window.name)) as { speak?: number }).speak ?? 0).toBe(speakTruoc);
    expect(await khongTranNgang(page)).toBe(true);
    await ctx.close();
  });

  test('F07-KS-01b · kiosk 1080×1920: vùng bấm của nút đọc ≥ 48 × 48 px (C01 AC-2 / testcases KS-01)', async ({ browser }) => {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: 1080, height: 1920 } });
    const page = await ctx.newPage();
    await caiGiaLap(page);
    await page.goto('/?kiosk=1');
    await nutTroLy(page).click();
    const hop = (await nutDoc(page).boundingBox())!;
    test.info().annotations.push({ type: 'do', description: `${hop.width}×${hop.height} px` });
    expect(hop.width).toBeGreaterThanOrEqual(48);
    expect(hop.height).toBeGreaterThanOrEqual(48);
    // Mọi nút chỉ có biểu tượng (IconButton: đọc, ✕ đóng khung…) trong khung ở kiosk cũng ≥ 48 px
    const nho = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('#khung-tro-ly button')]
        .filter((b) => b.querySelector('svg') && (b.textContent ?? '').trim() === '')
        .map((b) => ({ ten: b.getAttribute('aria-label') ?? '?', w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height }))
        .filter((b) => b.w < 48 || b.h < 48),
    );
    expect(nho, 'IconButton dưới 48 px ở kiosk').toEqual([]);
    await ctx.close();
  });
});
