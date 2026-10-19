import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import {
  chanMangNgoai,
  CSS_GIAN_CHU,
  ganCssThu,
  duongApi,
  ghiYeuCau,
  GOC,
  khongTranNgang,
  layCsp,
  TEN_MIEN_DA_BO,
  THE_AXE,
  theoDoiHopThoai,
  theoDoiLoi,
  themBatCsp,
} from './du-lieu/chung';
import {
  DANG_MO,
  G1,
  G2,
  G3,
  G4,
  G5,
  G7,
  G8,
  G9,
  MOC,
  MUI_GIO,
  NGOAI_GIO,
  O6G,
  O7,
  OE,
  o,
  tg,
  trungTam,
  traTrungTam,
  type GioThu,
  type TrungTamThu,
} from './du-lieu/trang-chu';
import { boT43, traDanhMuc } from './du-lieu/thuong-gap';

/**
 * F02 · Trang chủ — e2e trên bản build do API phục vụ (ban-build.config.ts).
 * Mã ca (F02-DV-01…) theo .specify/specs/F02-trang-chu/testcases.md. /api/trung-tam giả bằng page.route (bộ TT-A…D, G1…G9, O6g, O7, OE);
 * ca "dữ liệu thật" dùng nguồn Mẫu. Ca giờ: page.clock.install đặt TRƯỚC khi mở trang; múi giờ máy qua browser.newContext({ timezoneId }).
 */

const trangThai = (p: Page) => p.getByText(/^(Đang trong giờ làm việc|Ngoài giờ làm việc)$/);
const ODichVu = (p: Page) => p.getByRole('region', { name: 'Dịch vụ nhanh' });
const GioLamViec = (p: Page) => p.locator('section').filter({ has: p.getByRole('heading', { name: 'Thời gian làm việc' }) });
const dongGio = (p: Page) => GioLamViec(p).getByRole('listitem');
const o6 = () => O6G;

async function chuanBi(page: Page, tt: TrungTamThu = trungTam(), opt: { thuTuc?: boolean; tre?: number; dem?: string[] } = {}) {
  await traTrungTam(page, tt, opt.tre ?? 0, opt.dem);
  if (opt.thuTuc !== false) await traDanhMuc(page, boT43());
  await chanMangNgoai(page, GOC);
}

async function vao(page: Page, duong = '/') {
  await page.goto(duong);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

/** Mở một trang mới trong `ctx` với đồng hồ đặt TRƯỚC khi vào trang, dữ liệu Trung tâm giả. */
async function moVoiGio(ctx: BrowserContext, iso: string, tt: TrungTamThu, duong = '/') {
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date(iso) });
  await traTrungTam(p, tt);
  await traDanhMuc(p, boT43());
  await p.goto(duong);
  return p;
}

const nhan = async (p: Page) => {
  await expect(trangThai(p)).toBeVisible();
  return (await trangThai(p).textContent())!.trim();
};

async function nguCanhTz(browser: Browser, timezoneId: string, viewport = { width: 1280, height: 900 }) {
  return browser.newContext({ timezoneId, viewport, ignoreHTTPSErrors: true });
}

test.describe.configure({ mode: 'default' });

// ───────────────────────────── 1. Ô dịch vụ nhanh (BR-1, BR-4, BR-6; AC-1, 3, 6, 8, 13) ─────────────────────────────

test.describe('Ô dịch vụ nhanh', () => {
  for (const [w, h] of [[1280, 900], [375, 812]] as const) {
    test(`F02-DV-01/02/04 (AC-1) · ${w}px: 6 ô đúng tên và thứ tự; bấm "Tra cứu hồ sơ" mở tab mới đúng địa chỉ, rel đủ, opener null`, async ({ page, context }) => {
      await page.setViewportSize({ width: w, height: h });
      await chuanBi(page);
      await vao(page);
      const chuO = await ODichVu(page).getByRole('listitem').allInnerTexts();
      expect(chuO).toHaveLength(6);
      o6().forEach((x, i) => expect(chuO[i]).toContain(x.ten));
      const lk = ODichVu(page).getByRole('link', { name: 'Tra cứu hồ sơ (mở trang mới)' });
      await expect(lk).toHaveAttribute('target', '_blank');
      expect((await lk.getAttribute('rel')) ?? '').toMatch(/noopener/);
      expect((await lk.getAttribute('rel')) ?? '').toMatch(/noreferrer/);
      await expect(lk).toContainText('Trang ngoài');
      const url = page.url();
      const [tab] = await Promise.all([context.waitForEvent('page'), lk.click()]);
      await tab.waitForLoadState();
      expect(tab.url()).toBe('https://tracuu.example.test/ho-so');
      expect(await tab.evaluate(() => window.opener)).toBeNull();
      await tab.close();
      expect(page.url()).toBe(url);
    });
  }

  test('F02-DV-03 · Tab tới ô "Tra cứu hồ sơ", Enter mở tab mới đúng địa chỉ', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    const lk = ODichVu(page).getByRole('link', { name: /Tra cứu hồ sơ/ });
    await lk.focus();
    await expect(lk).toBeFocused();
    const [tab] = await Promise.all([context.waitForEvent('page'), page.keyboard.press('Enter')]);
    await tab.waitForLoadState();
    expect(tab.url()).toBe('https://tracuu.example.test/ho-so');
    await tab.close();
  });

  test('F02-DV-05/06 · dữ liệu thật (nguồn Mẫu): 6 ô theo lien-ket.md §1; 4 địa chỉ đúng; bấm từng ô mở tab mới đúng địa chỉ; không tên miền "Đã bỏ"', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const ngoai = await chanMangNgoai(page, GOC);
    await page.goto('/');
    await expect(ODichVu(page).getByRole('listitem')).toHaveCount(6);
    const ten = await ODichVu(page).getByRole('listitem').allInnerTexts();
    expect(ten.map((t) => t.split('\n')[0])).toEqual([
      'Bốc số thứ tự / Đặt lịch hẹn', 'Đánh giá hài lòng', 'Tra cứu hồ sơ', 'Thanh toán trực tuyến', 'Cổng Dịch vụ công Quốc gia', 'Cổng thông tin điện tử xã Cần Giuộc',
    ]);
    const hrefs = await ODichVu(page).getByRole('link').evaluateAll((a) => a.map((x) => x.getAttribute('href')));
    expect(hrefs).toEqual([
      'https://dichvucong.gov.vn/tra-cuu-ho-so',
      'https://dichvucong.gov.vn/thanh-toan-truc-tuyen',
      'https://dichvucong.gov.vn/thu-tuc-hanh-chinh',
      'https://cangiuoc.tayninh.gov.vn/',
    ]);
    for (const href of await page.locator('a[href^="http"]').evaluateAll((a) => a.map((x) => (x as HTMLAnchorElement).hostname))) {
      expect(TEN_MIEN_DA_BO).not.toContain(href);
    }
    for (const lk of await ODichVu(page).getByRole('link').all()) {
      const dich = await lk.getAttribute('href');
      const [tab] = await Promise.all([context.waitForEvent('page'), lk.click()]);
      await tab.waitForLoadState('domcontentloaded').catch(() => undefined);
      expect(tab.url().replace(/\/$/, '')).toBe(dich!.replace(/\/$/, ''));
      await tab.close();
    }
    expect(ngoai.length).toBeGreaterThanOrEqual(4);
  });

  test('F02-DV-08/09 (AC-3) · O7 hiện 7 ô, ô thứ 7 ở cuối mở tab mới; màu/biểu tượng theo khoá khi đổi vị trí', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page, trungTam({ oDichVu: O7 }));
    await vao(page);
    await expect(ODichVu(page).getByRole('listitem')).toHaveCount(7);
    await expect(ODichVu(page).getByRole('listitem').last()).toContainText('Ô mới thử');
    const [tab] = await Promise.all([context.waitForEvent('page'), ODichVu(page).getByRole('link', { name: /Ô mới thử/ }).click()]);
    await tab.waitForLoadState();
    expect(tab.url()).toBe('https://moi.example.test/');
    await tab.close();
    const mau = async () => ODichVu(page).getByRole('link', { name: /Tra cứu hồ sơ/ }).locator('span[aria-hidden="true"]').first().evaluate((e) => getComputedStyle(e).backgroundColor + '|' + e.innerHTML.length);
    const truoc = await mau();
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await chuanBi(page, trungTam({ oDichVu: [o('Ô chèn đầu', 'lien-ket', 'https://dau.example.test'), ...O7] }));
    await page.reload();
    await expect(ODichVu(page).getByRole('listitem')).toHaveCount(8);
    expect(await mau()).toBe(truoc);
  });

  test('F02-DV-10/21/23 / AC-13 · bieuTuong lạ → biểu tượng mặc định không lỗi; oDichVu [] → không lưới, không ErrorState; moTa không hiện ở đâu', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const loi = theoDoiLoi(page);
    await chuanBi(page, trungTam({ oDichVu: [o('Ô lạ', 'khong-co-khoa', 'https://la.example.test', 'Mô tả thử A'), o('Ô không link', 'boc-so', null, 'Mô tả thử A')] }));
    await vao(page);
    await expect(ODichVu(page).getByRole('listitem')).toHaveCount(2);
    const toanBo = await page.evaluate(() => document.documentElement.outerHTML);
    expect(toanBo).not.toContain('Mô tả thử A');
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await chuanBi(page, trungTam({ oDichVu: [] }));
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(ODichVu(page).getByRole('list')).toHaveCount(0);
    await expect(page.getByText('Chưa tải được dữ liệu.')).toHaveCount(0);
    await expect(GioLamViec(page)).toBeVisible();
    expect(loi).toEqual([]);
  });

  for (const [w, h] of [[1280, 900], [375, 812]] as const) {
    test(`F02-DV-11…15 (AC-8) · ${w}px: hai ô không link cùng kích thước, không viền nét đứt/mờ/ghi chú, bấm không làm gì, Tab bỏ qua, không phải link`, async ({ page, context }) => {
      await page.setViewportSize({ width: w, height: h });
      await chuanBi(page);
      await vao(page);
      const muc = ODichVu(page).getByRole('listitem');
      const hop = async (i: number) => (await muc.nth(i).locator('> *').first().boundingBox())!;
      const [a, b, c] = [await hop(0), await hop(1), await hop(2)];
      console.log(`F02-DV-11 ${w}px: ô1 ${a.width.toFixed(1)}x${a.height.toFixed(1)} · ô2 ${b.width.toFixed(1)}x${b.height.toFixed(1)} · ô3 (có link) ${c.width.toFixed(1)}x${c.height.toFixed(1)}`);
      // Ô không link (ô 2, tên 1 dòng) so với ô có link (ô 3, tên 1 dòng): cùng rộng, cao chênh <= 4 px
      expect(Math.abs(b.width - c.width)).toBeLessThan(2);
      // Có thanh cuộn cổ điển (Chromium headless, Windows) `scrollbar-gutter: stable` bớt 15 px chiều rộng ở 375 px nên tên ô có thể xuống thêm một dòng: cho phép lệch tối đa một dòng chữ (≤ 20 px)
      expect(Math.abs(b.height - c.height)).toBeLessThan(w === 375 ? 20 : 4);
      expect(Math.abs(a.width - c.width)).toBeLessThan(2);
      for (const i of [0, 1]) {
        const kieu = await muc.nth(i).locator('> *').first().evaluate((e) => ({ vien: getComputedStyle(e).borderStyle, mo: getComputedStyle(e).opacity, mau: getComputedStyle(e.querySelector('span:last-child') ?? e).color }));
        expect(kieu.vien).not.toBe('dashed');
        expect(kieu.mo).toBe('1');
        const chuCoLink = await muc.nth(2).locator('span[class*="ten"]').evaluate((e) => getComputedStyle(e).color);
        expect(kieu.mau).toBe(chuCoLink);
        await expect(muc.nth(i)).not.toContainText(/chưa có link|sắp ra mắt/i);
        await expect(muc.nth(i).locator('a, [tabindex], [role=link], [role=button]')).toHaveCount(0);
      }
      // bấm hai ô: không tab, không đổi địa chỉ
      let moTab = 0;
      context.on('page', () => moTab++);
      const url = page.url();
      await muc.nth(0).click();
      await muc.nth(1).click();
      await page.waitForTimeout(300);
      expect(moTab).toBe(0);
      expect(page.url()).toBe(url);
      await expect(ODichVu(page).getByRole('link', { name: 'Đánh giá hài lòng' })).toHaveCount(0);
      // Tab: dừng ở 4 ô có link, không dừng ở hai ô kia
      await page.locator('body').click({ position: { x: 1, y: 1 } });
      const dung: string[] = [];
      await ODichVu(page).getByRole('link').first().focus();
      dung.push((await page.evaluate(() => document.activeElement?.textContent ?? '')).trim());
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab');
        dung.push((await page.evaluate(() => document.activeElement?.textContent ?? '')).trim());
      }
      expect(dung.join('|')).toContain('Tra cứu hồ sơ');
      expect(dung.join('|')).toContain('Thanh toán trực tuyến');
      expect(dung.join('|')).not.toContain('Đánh giá hài lòng');
      expect(dung.join('|')).not.toContain('Bốc số');
    });
  }

  test('F02-DV-17/BM-05 · OE: địa chỉ độc hại/sai định dạng hiện như ô thường, không <a>; HTTP viết hoa được nhận; 0 hộp thoại', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const hopThoai = theoDoiHopThoai(page);
    await chuanBi(page, trungTam({ oDichVu: OE }));
    await vao(page);
    await expect(ODichVu(page).getByRole('listitem')).toHaveCount(8);
    const links = await ODichVu(page).getByRole('link').evaluateAll((a) => a.map((x) => x.getAttribute('href')));
    console.log('F02-DV-17: link được nhận:', JSON.stringify(links));
    expect(links).toEqual(['http://upper.example.test/']);
    for (const li of await ODichVu(page).getByRole('listitem').all()) {
      const t = await li.innerText();
      if (!/Ô http viết hoa/.test(t)) {
        await expect(li.locator('a')).toHaveCount(0);
        await li.click();
      }
    }
    expect(await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => /^(javascript|data):|^\/\//i.test(h ?? '')))).toEqual([]);
    await expect(ODichVu(page).getByText('<b>đậm</b> & "x"')).toBeVisible();
    expect(await ODichVu(page).locator('b').count()).toBe(0);
    expect(hopThoai).toEqual([]);
  });

  test('F02-DV-18 · ghi nhận: ô trỏ tới tên miền "Đã bỏ" vẫn hiện (F02 không có mã chặn)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page, trungTam({ oDichVu: [o('Ô cấm thử', 'lien-ket', 'https://motcua.tayninh.gov.vn')] }));
    await vao(page);
    const href = await ODichVu(page).getByRole('link').getAttribute('href');
    console.log(`F02-DV-18: F02 không chặn tên miền "Đã bỏ": href=${href}`);
    expect(href).toContain('motcua.tayninh.gov.vn');
  });

  test('F02-DV-19 · tên 120 ký tự và có HTML: nguyên văn, tối đa 2 dòng, không làm lưới vỡ (375, 1280)', async ({ page }) => {
    for (const [w, h] of [[375, 812], [1280, 900]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await chuanBi(page, trungTam({ oDichVu: [o('Tên rất dài của một dịch vụ nhanh '.repeat(4).slice(0, 120), 'lien-ket', 'https://a.example.test'), ...O6G.slice(0, 3)] }));
      await vao(page);
      expect(await khongTranNgang(page)).toBe(true);
      const hinh = await ODichVu(page).getByRole('listitem').evaluateAll((l) => l.map((x) => ({ cao: Math.round(x.getBoundingClientRect().height), tran: x.scrollWidth > x.clientWidth + 1 })));
      console.log(`F02-DV-19 ${w}px: chiều cao ô ${hinh.map((x) => x.cao).join(', ')}`);
      expect(hinh.some((x) => x.tran)).toBe(false);
      expect(Math.max(...hinh.map((x) => x.cao))).toBeLessThan(170);
      const dong = await ODichVu(page).getByRole('listitem').first().locator('span[class*="ten"]').evaluate((e) => {
        const lh = parseFloat(getComputedStyle(e).lineHeight);
        return Math.round(e.getBoundingClientRect().height / lh);
      });
      expect(dong).toBeLessThanOrEqual(2);
    }
  });

  test('F02-DV-20 · số cột lưới ô: 375→2, 600/768→3, 1024/1280/K→6; ô cùng hàng cao bằng nhau; không cuộn ngang', async ({ page }) => {
    await chuanBi(page);
    const ghi: string[] = [];
    for (const [w, h, mong] of [[375, 812, 2], [599, 900, 2], [600, 900, 3], [768, 1024, 3], [1023, 900, 3], [1024, 900, 6], [1280, 900, 6], [1080, 1920, 6]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await vao(page);
      const cot = await ODichVu(page).getByRole('listitem').evaluateAll((l) => new Set(l.map((x) => Math.round(x.getBoundingClientRect().x))).size);
      ghi.push(`${w}px: ${cot}`);
      expect(cot, `${w}px`).toBe(mong);
      expect(await khongTranNgang(page)).toBe(true);
    }
    console.log('F02-DV-20:', ghi.join(' · '));
  });
});

// ───────────────────────────── 2. Trạng thái "đang trong giờ làm việc" ─────────────────────────────

test.describe('Giờ làm việc (giờ Việt Nam)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F02-GL-01…06 (AC-2, AC-7) · G1 và G2 ở các mốc I1…I5', async ({ browser }) => {
    const ctx = await nguCanhTz(browser, 'Asia/Ho_Chi_Minh');
    const ca: [string, GioThu[], string, string][] = [
      ['GL-01', G1, 'I1', DANG_MO], ['GL-02', G1, 'I2', NGOAI_GIO], ['GL-03', G1, 'I3', NGOAI_GIO],
      ['GL-04', G2, 'I3', DANG_MO], ['GL-05', G2, 'I4', NGOAI_GIO], ['GL-06', G2, 'I5', NGOAI_GIO],
    ];
    for (const [id, gio, moc, mong] of ca) {
      const p = await moVoiGio(ctx, MOC[moc]!, trungTam({ gioLamViec: gio }));
      expect(await nhan(p), `${id} (${moc})`).toBe(mong);
      await p.close();
    }
    await ctx.close();
  });

  test('F02-GL-07/08/09/17 (AC-5) · ghi chú ngày nghỉ; 02/9/2026 10:00 vẫn "Đang"; không ghi chú thì không dòng; ngày lễ khác', async ({ browser }) => {
    const ctx = await nguCanhTz(browser, 'Asia/Ho_Chi_Minh');
    const GHI = 'Trừ ngày nghỉ, lễ, Tết theo quy định';
    let p = await moVoiGio(ctx, MOC.I14!, trungTam({ gioLamViec: G1, ghiChuNgayNghi: GHI }));
    expect(await nhan(p)).toBe(DANG_MO);
    await expect(GioLamViec(p).getByText(GHI, { exact: true })).toBeVisible();
    const cuoi = await GioLamViec(p).evaluate((s, ghi) => s.lastElementChild?.textContent === ghi, GHI);
    expect(cuoi).toBe(true);
    await p.close();
    p = await moVoiGio(ctx, MOC.I14!, trungTam({ gioLamViec: G1, ghiChuNgayNghi: null }));
    expect(await nhan(p)).toBe(DANG_MO);
    await expect(GioLamViec(p).locator('p')).toHaveCount(0);
    await p.close();
    p = await moVoiGio(ctx, '2027-01-01T03:00:00Z', trungTam({ gioLamViec: G1 }));
    expect(await nhan(p)).toBe(DANG_MO);
    await p.close();
    await ctx.close();
  });

  test('F02-GL-10 / RG-01…05 (AC-10) · ranh giới 06:59/07:00, 11:29/11:30, 13:29/13:30, 16:59/17:00 và nửa đêm', async ({ browser }) => {
    const ctx = await nguCanhTz(browser, 'Asia/Ho_Chi_Minh');
    const ca: [string, string, string][] = [
      ['I6 06:59', MOC.I6!, NGOAI_GIO], ['I7 07:00', MOC.I7!, DANG_MO],
      ['I8 11:29', MOC.I8!, DANG_MO], ['I9 11:30', MOC.I9!, NGOAI_GIO],
      ['I10 13:29', MOC.I10!, NGOAI_GIO], ['I11 13:30', MOC.I11!, DANG_MO],
      ['I12 16:59', MOC.I12!, DANG_MO], ['I13 17:00', MOC.I13!, NGOAI_GIO],
      ['T2 00:00 (UTC CN 17:00)', '2026-10-11T17:00:00Z', NGOAI_GIO],
      ['T2 23:59', '2026-10-12T16:59:00Z', NGOAI_GIO],
      ['T3 00:00', '2026-10-12T17:00:00Z', NGOAI_GIO],
    ];
    for (const [id, iso, mong] of ca) {
      const p = await moVoiGio(ctx, iso, trungTam({ gioLamViec: G1 }));
      expect(await nhan(p), id).toBe(mong);
      await p.close();
    }
    await ctx.close();
  });

  test('F02-GL-11/12 (BR-7) · G7 mỗi ngày một giờ; G8 chỉ chiều', async ({ browser }) => {
    const ctx = await nguCanhTz(browser, 'Asia/Ho_Chi_Minh');
    // G7 Thứ Hai: sáng 07:00–11:11 -> 10:00 đang; Thứ Ba (thu 2): sáng 08:00–11:12 -> 07:30 ngoài giờ
    let p = await moVoiGio(ctx, '2026-10-12T03:00:00Z', trungTam({ gioLamViec: G7 }));
    expect(await nhan(p)).toBe(DANG_MO);
    await p.close();
    p = await moVoiGio(ctx, '2026-10-12T17:00:00Z', trungTam({ gioLamViec: G7 })); // Thứ Ba 00:00 -> ngoài
    expect(await nhan(p)).toBe(NGOAI_GIO);
    await p.close();
    p = await moVoiGio(ctx, '2026-10-13T00:30:00Z', trungTam({ gioLamViec: G7 })); // Thứ Ba 07:30, sáng bắt đầu 08:00
    expect(await nhan(p)).toBe(NGOAI_GIO);
    await p.close();
    p = await moVoiGio(ctx, MOC.I1!, trungTam({ gioLamViec: G8 })); // 10:00, G8 chỉ chiều
    expect(await nhan(p)).toBe(NGOAI_GIO);
    await p.close();
    p = await moVoiGio(ctx, '2026-10-12T07:00:00Z', trungTam({ gioLamViec: G8 })); // 14:00
    expect(await nhan(p)).toBe(DANG_MO);
    await p.close();
    await ctx.close();
  });

  test('F02-GL-13 / TL-07 (AC-12, BR-10) · không có dòng giờ nào: ẩn cả khối, không chữ "Ngoài giờ làm việc"; ô dịch vụ và khối thường gặp vẫn hiện', async ({ page }) => {
    for (const [w, h] of [[1280, 900], [375, 812]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await chuanBi(page, trungTam({ gioLamViec: [] }));
      await vao(page);
      await expect(ODichVu(page).getByRole('listitem')).toHaveCount(6);
      await expect(page.getByRole('heading', { name: 'Thời gian làm việc' })).toHaveCount(0);
      await expect(page.getByText(NGOAI_GIO)).toHaveCount(0);
      await expect(page.getByRole('heading', { name: 'Thủ tục thường gặp' })).toBeVisible();
    }
  });

  test('F02-GL-14/15 / TL-09 · G5 (buổi hỏng): bỏ buổi hỏng, không "25:00/NaN/undefined", ngày không còn buổi = nghỉ, nhãn và dòng giờ nhất quán', async ({ browser }) => {
    const ctx = await nguCanhTz(browser, 'Asia/Ho_Chi_Minh');
    const loi: string[] = [];
    const p = await moVoiGio(ctx, MOC.I1!, trungTam({ gioLamViec: G5 })); // Thứ Hai 10:00: buổi sáng hỏng -> ngoài giờ
    p.on('pageerror', (e) => loi.push(e.message));
    expect(await nhan(p)).toBe(NGOAI_GIO);
    const chu = await GioLamViec(p).innerText();
    expect(chu).not.toMatch(/25:00|NaN|undefined|12:60|(^|[^0-9])7:00 –/);
    console.log(`F02-GL-14: G5 -> ${JSON.stringify(chu.replace(/\s+/g, ' '))}`);
    await p.close();
    // Thứ Bảy 09:00: ngày tốt vẫn đúng
    const p2 = await moVoiGio(ctx, MOC.I3!, trungTam({ gioLamViec: G5 }));
    expect(await nhan(p2)).toBe(DANG_MO);
    await p2.close();
    // Thứ Hai 14:00: chiều tốt nhưng buổi sáng hỏng; ngày Thứ Hai vẫn có buổi chiều
    const p3 = await moVoiGio(ctx, '2026-10-12T07:00:00Z', trungTam({ gioLamViec: G5 }));
    expect(await nhan(p3)).toBe(DANG_MO);
    await expect(dongGio(p3).filter({ hasText: 'Thứ Hai' })).toContainText('13:30 – 17:00');
    expect(loi).toEqual([]);
    await p3.close();
    await ctx.close();
  });

  test('F02-GL-16 · đồng hồ máy lệch 3 giờ: nhãn theo giờ của máy (hạn chế đã biết), trang không lỗi', async ({ browser }) => {
    const ctx = await nguCanhTz(browser, 'Asia/Ho_Chi_Minh');
    const p = await moVoiGio(ctx, '2026-10-12T06:00:00Z', trungTam({ gioLamViec: G1 })); // máy ghi 13:00 VN thật ra 10:00
    expect(await nhan(p)).toBe(NGOAI_GIO);
    await p.close();
    await ctx.close();
  });

  test('F02-GL-18 · giờ thật (không giả clock): nhãn khớp giờ Việt Nam hiện tại', async ({ page }) => {
    await chuanBi(page, trungTam({ gioLamViec: G1 }));
    await vao(page);
    const bay = new Date(Date.now() + 7 * 3_600_000);
    const thu = bay.getUTCDay() || 7;
    const phut = bay.getUTCHours() * 60 + bay.getUTCMinutes();
    const mo = thu >= 1 && thu <= 5 && ((phut >= 420 && phut < 690) || (phut >= 810 && phut < 1020));
    const dongHoTruoc = Date.now();
    const kq = await nhan(page);
    // cho phép lệch một phút quanh ranh giới
    if (Math.abs(dongHoTruoc - Date.now()) < 5000) expect(kq).toBe(mo ? DANG_MO : NGOAI_GIO);
  });
});

// ───────────────────────────── 3. Múi giờ máy khách ─────────────────────────────

test.describe('Múi giờ máy khách', () => {
  test('F02-MG-01…05 (AC-2, AC-7) · 8 múi giờ: kết quả không đổi theo múi giờ máy (G1: I1 Đang, I2 Ngoài, I3 Ngoài; G2: I3 Đang, I4 Ngoài, I5 Ngoài)', async ({ browser }) => {
    test.setTimeout(240_000);
    const bang: string[] = [];
    for (const tz of MUI_GIO) {
      const ctx = await nguCanhTz(browser, tz);
      for (const [gio, moc, mong] of [[G1, 'I1', DANG_MO], [G1, 'I2', NGOAI_GIO], [G1, 'I3', NGOAI_GIO], [G2, 'I3', DANG_MO], [G2, 'I4', NGOAI_GIO], [G2, 'I5', NGOAI_GIO]] as const) {
        const p = await moVoiGio(ctx, MOC[moc]!, trungTam({ gioLamViec: gio as GioThu[] }));
        const kq = await nhan(p);
        bang.push(`${tz} ${gio === G1 ? 'G1' : 'G2'}/${moc}=${kq === DANG_MO ? 'Đang' : 'Ngoài'}`);
        expect(kq, `${tz} ${moc}`).toBe(mong);
        await p.close();
      }
      await ctx.close();
    }
    console.log('F02-MG-01…05:', bang.length, 'tổ hợp đều đạt');
  });

  test('F02-MG-05…09 · biên: LA (máy là Chủ nhật 20:00), Kiritimati +14 (06:59 VN), Kolkata +5:30 (11:29/11:30), Auckland và New York đổi giờ', async ({ browser }) => {
    test.setTimeout(240_000);
    const ca: [string, string, string][] = [
      ['America/Los_Angeles', MOC.I1!, DANG_MO],
      ['Pacific/Kiritimati', MOC.I6!, NGOAI_GIO],
      ['Asia/Kolkata', MOC.I8!, DANG_MO],
      ['Asia/Kolkata', MOC.I9!, NGOAI_GIO],
      ['Pacific/Auckland', MOC.I15!, DANG_MO],
      ['America/New_York', MOC.I16!, DANG_MO],
    ];
    for (const [tz, iso, mong] of ca) {
      const ctx = await nguCanhTz(browser, tz);
      const p = await moVoiGio(ctx, iso, trungTam({ gioLamViec: G1 }));
      expect(await nhan(p), `${tz} ${iso}`).toBe(mong);
      await ctx.close();
    }
  });

  test('F02-MG-10/11 · giờ trong khối là nguyên văn HH:mm Việt Nam, không đổi theo múi giờ hay locale máy', async ({ browser }) => {
    for (const [tz, locale] of [['America/New_York', 'en-US'], ['Pacific/Auckland', 'ar'], ['Asia/Tokyo', 'ja-JP']] as const) {
      const ctx = await browser.newContext({ timezoneId: tz, locale, viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
      const p = await moVoiGio(ctx, MOC.I1!, trungTam({ gioLamViec: G1 }));
      expect(await nhan(p)).toBe(DANG_MO);
      await expect(dongGio(p)).toContainText('07:00 – 11:30');
      await expect(dongGio(p)).toContainText('13:30 – 17:00');
      expect(await GioLamViec(p).innerText()).not.toMatch(/[٠-٩]/);
      await ctx.close();
    }
  });
});

// ───────────────────────────── 4. Gộp ngày (BR-8; AC-9) ─────────────────────────────

test.describe('Gộp ngày liền nhau (1280, 375)', () => {
  const dong = async (p: Page) => (await dongGio(p).allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());

  for (const [w, h] of [[1280, 900], [375, 812]] as const) {
    test(`F02-GD-01/02/03 (AC-9) · ${w}px: G2 đúng 2 dòng; không dòng Chủ nhật; G1 đúng 1 dòng`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await chuanBi(page, trungTam({ gioLamViec: G2 }));
      await vao(page);
      await expect(GioLamViec(page)).toBeVisible();
      const d = await dong(page);
      expect(d).toEqual(['Thứ Hai – Thứ Sáu Buổi sáng 07:00 – 11:30 Buổi chiều 13:30 – 17:00', 'Thứ Bảy Buổi sáng 07:00 – 11:30']);
      await expect(GioLamViec(page).getByText('Chủ nhật')).toHaveCount(0);
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await chuanBi(page, trungTam({ gioLamViec: G1 }));
      await page.reload();
      await expect(GioLamViec(page)).toBeVisible();
      expect(await dong(page)).toEqual(['Thứ Hai – Thứ Sáu Buổi sáng 07:00 – 11:30 Buổi chiều 13:30 – 17:00']);
    });
  }

  test('F02-GD-04…09 · G3 ngày nghỉ chen giữa; G4 không nối vòng tuần; G9 sắp theo thứ; G7 bảy dòng; G8 chỉ chiều; khác buổi không gộp', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const thu = async (gio: GioThu[]) => {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await chuanBi(page, trungTam({ gioLamViec: gio }));
      await page.goto('/');
      await expect(GioLamViec(page)).toBeVisible();
      return dong(page);
    };
    expect((await thu(G3)).map((s) => s.split(' Buổi')[0])).toEqual(['Thứ Hai – Thứ Ba', 'Thứ Năm – Thứ Sáu']);
    expect((await thu(G4)).map((s) => s.split(' Buổi')[0])).toEqual(['Thứ Hai', 'Chủ nhật']);
    expect((await thu(G9)).map((s) => s.split(' Buổi')[0])).toEqual(['Thứ Hai – Thứ Sáu']);
    const g7 = await thu(G7);
    expect(g7).toHaveLength(7);
    expect(await khongTranNgang(page)).toBe(true);
    const g8 = await thu(G8);
    expect(g8).toEqual(['Thứ Hai – Thứ Sáu Buổi chiều 13:30 – 17:00']);
    const khac = await thu([tg(1), tg(2, '07:00', '11:30', null, null)]);
    expect(khac.map((s) => s.split(' Buổi')[0])).toEqual(['Thứ Hai', 'Thứ Ba']);
  });
});

// ───────────────────────────── 5. Đồng hồ khi trang mở lâu ─────────────────────────────

test.describe('Đồng hồ khi trang mở lâu', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F02-DH-01/02 (AC-11) · 11:28:30 → 11:30:30 không tải lại: "Đang" → "Ngoài"; 12:59:30 → 13:30:30: "Ngoài" → "Đang"; không thêm yêu cầu mạng', async ({ browser }) => {
    const ctx = await nguCanhTz(browser, 'Asia/Ho_Chi_Minh');
    const dem: string[] = [];
    let p = await ctx.newPage();
    await p.clock.install({ time: new Date('2026-10-12T04:28:30Z') });
    await traTrungTam(p, trungTam({ gioLamViec: G1 }), 0, dem);
    await traDanhMuc(p, boT43());
    await p.goto('/');
    expect(await nhan(p)).toBe(DANG_MO);
    const truoc = dem.length;
    await p.clock.fastForward(60_000);
    expect(await nhan(p)).toBe(DANG_MO); // 11:29:30
    await p.clock.fastForward(60_000);
    await expect(trangThai(p)).toHaveText(NGOAI_GIO); // 11:30:30
    expect(dem.length).toBe(truoc);
    await p.close();
    p = await ctx.newPage();
    await p.clock.install({ time: new Date('2026-10-12T05:59:30Z') });
    await traTrungTam(p, trungTam({ gioLamViec: G1 }));
    await traDanhMuc(p, boT43());
    await p.goto('/');
    expect(await nhan(p)).toBe(NGOAI_GIO);
    await p.clock.fastForward(31 * 60_000); // 12:59:30 → 13:30:30
    await expect(trangThai(p)).toHaveText(DANG_MO);
    await ctx.close();
  });

  test('F02-DH-03 · tab ẩn rồi hiện lại: cập nhật ngay (không chờ bộ đếm)', async ({ browser }) => {
    const ctx = await nguCanhTz(browser, 'Asia/Ho_Chi_Minh');
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date('2026-10-12T09:00:00Z') }); // 16:00
    await traTrungTam(p, trungTam({ gioLamViec: G1 }));
    await traDanhMuc(p, boT43());
    await p.goto('/');
    expect(await nhan(p)).toBe(DANG_MO);
    await p.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await p.clock.fastForward(3 * 3_600_000 - 1000); // qua 17:00, không có bộ đếm nào kịp chạy khi tab ẩn tuỳ cài đặt
    await p.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(trangThai(p)).toHaveText(NGOAI_GIO, { timeout: 2000 });
    await ctx.close();
  });

  test('F02-DH-05/06 / KS-04 · kiosk để yên 15 phút (tua đồng hồ) qua 11:30: đổi nhãn không tải lại; nhãn không phải aria-live', async ({ browser }) => {
    const ctx = await browser.newContext({ timezoneId: 'Asia/Ho_Chi_Minh', viewport: { width: 1080, height: 1920 }, ignoreHTTPSErrors: true });
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date('2026-10-12T04:20:00Z') }); // 11:20
    await traTrungTam(p, trungTam({ gioLamViec: G1 }));
    await traDanhMuc(p, boT43());
    await p.goto('/?kiosk=1');
    expect(await nhan(p)).toBe(DANG_MO);
    await p.evaluate(() => ((window as unknown as { __marker: number }).__marker = 1));
    for (let i = 0; i < 15; i++) await p.clock.fastForward(60_000);
    await expect(trangThai(p)).toHaveText(NGOAI_GIO);
    expect(await p.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(1);
    expect(await trangThai(p).evaluate((e) => !!e.closest('[aria-live]'))).toBe(false);
    await ctx.close();
  });
});

// ───────────────────────────── 6. Banner và bố cục (BN, BC) ─────────────────────────────

test.describe('Banner và bố cục', () => {
  for (const [w, h] of [[1280, 900], [375, 812]] as const) {
    test(`F02-BN-01/02 · ${w}px: h1 = tên Trung tâm, dòng cơ quan chủ quản, câu mô tả cố định; cơ quan trống thì không dòng`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await chuanBi(page, trungTam());
      await vao(page);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trung tâm thử A');
      const banner = page.locator('main section').first();
      await expect(banner.getByText('UBND phường thử B')).toBeVisible();
      await expect(banner.getByText('Tra cứu thủ tục hành chính, hồ sơ cần chuẩn bị và nơi nộp hồ sơ.')).toBeVisible();
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await chuanBi(page, trungTam({ coQuanChuQuan: null }));
      await page.reload();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trung tâm thử A');
      await expect(page.locator('main section').first().locator('p')).toHaveCount(1);
    });
  }

  test('F02-BN-03/04 · TT-C (tên 200, cơ quan 120) không tràn; TT-D (HTML) hiện nguyên văn dạng chữ, 0 hộp thoại', async ({ page }) => {
    const hopThoai = theoDoiHopThoai(page);
    for (const [w, h] of [[375, 812], [1280, 900]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await chuanBi(page, trungTam({ ten: 'Trung tâm có tên rất dài '.repeat(9).slice(0, 200), coQuanChuQuan: 'Cơ quan chủ quản dài '.repeat(7).slice(0, 120) }));
      await vao(page);
      expect(await khongTranNgang(page)).toBe(true);
      await expect(ODichVu(page)).toBeVisible();
    }
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await chuanBi(page, trungTam({ ten: 'Trung tâm "thử" & <b>D</b>', coQuanChuQuan: '<script>alert(1)</script>' }));
    await vao(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trung tâm "thử" & <b>D</b>');
    await expect(page.getByText('<script>alert(1)</script>').first()).toBeVisible();
    expect(await page.locator('main b, main script').count()).toBe(0);
    expect(hopThoai).toEqual([]);
  });

  test('F02-BN-05 / TL-03/04/05 · API 500, 404, 429: h1 dự phòng "Tra cứu thủ tục hành chính", đúng 1 ErrorState, khối giờ ẩn, khối thường gặp vẫn hiện', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const [st, code, cau] of [[500, 'loi-he-thong', 'Hệ thống đang gặp sự cố'], [404, 'khong-tim-thay', 'Không tìm thấy nội dung'], [429, 'qua-nhieu-yeu-cau', 'Bạn thao tác quá nhanh']] as const) {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await traDanhMuc(page, boT43());
      await page.route('**/api/trung-tam', (r) => r.fulfill({ status: st, contentType: 'application/problem+json', json: { status: st, code, maTraCuu: 'MA123456' } }));
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tra cứu thủ tục hành chính', { timeout: 20_000 });
      await expect(page.getByText('Chưa tải được dữ liệu.')).toHaveCount(1, { timeout: 20_000 });
      await expect(page.getByText(cau, { exact: false }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Thời gian làm việc' })).toHaveCount(0);
      await expect(page.getByRole('heading', { name: 'Thủ tục thường gặp' })).toBeVisible();
      const chu = await page.locator('main').innerText();
      expect(chu).not.toMatch(/undefined|\bnull\b/);
      expect(chu).not.toContain(String(st));
    }
  });

  test('F02-TL-02 · /api/trung-tam 500 rồi 200: "Thử lại" ở khối ô dịch vụ làm mới cả đầu/chân trang', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    let pha: 500 | 200 = 500;
    await traDanhMuc(page, boT43());
    await page.route('**/api/trung-tam', async (route) => {
      if (pha === 500) await route.fulfill({ status: 500, contentType: 'application/problem+json', json: { status: 500, code: 'loi-he-thong', maTraCuu: 'MA123456' } });
      else await route.fulfill({ json: trungTam() });
    });
    await page.goto('/');
    await expect(page.getByText('Chưa tải được dữ liệu.')).toBeVisible({ timeout: 20_000 });
    pha = 200;
    await ODichVu(page).getByRole('button', { name: 'Thử lại' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trung tâm thử A');
    await expect(ODichVu(page).getByRole('listitem')).toHaveCount(6);
    await expect(page.locator('footer')).toContainText('thu@example.gov.vn');
  });

  test('F02-BN-06 / TL-01 · API trễ 5 giây: câu mô tả hiện ngay, ô dịch vụ là khung giữ chỗ "Đang tải…", sau đó nội dung thật', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page, trungTam(), { tre: 5000 });
    await page.goto('/');
    await expect(page.getByText('Tra cứu thủ tục hành chính, hồ sơ cần chuẩn bị và nơi nộp hồ sơ.')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('header')).toBeVisible();
    // Chân trang ẩn trong lúc có khung chờ (sửa CLS của ui-core-dev) — xem ca F08-TL-04 về xung đột với F08 BR-11/AC-13.
    await expect(ODichVu(page).getByText('Đang tải…')).toBeAttached();
    await expect(GioLamViec(page).getByText('Đang tải…')).toBeAttached();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trung tâm thử A', { timeout: 15_000 });
  });

  test('F02-BN-07 / HN-11 · không ảnh, không font do trang chủ gây ra', async ({ page }) => {
    const yc = ghiYeuCau(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page);
    await vao(page);
    expect(yc.filter((u) => /\.(png|jpe?g|webp|avif|gif|woff2?|ttf|otf|svg)(\?|$)/.test(u))).toEqual([]);
  });

  test('F02-BC-01/02/03/04/10/11 · thứ tự DOM banner → dịch vụ nhanh → thường gặp → giờ; h1 + 3 h2; địa chỉ/điện thoại/email đúng 1 lần; không khối thừa; thứ tự Tab', async ({ page }) => {
    for (const [w, h] of [[1280, 900], [375, 812]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await chuanBi(page);
      await vao(page);
      await expect(page.getByRole('heading', { name: 'Thời gian làm việc' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Thủ tục thường gặp' })).toBeVisible();
      await expect(page.locator('footer')).toBeVisible(); // chân trang chỉ hiện khi hết khung chờ
      await expect(page.locator('footer')).toContainText('Địa chỉ thử, phường thử B');
      const thuTu = await page.locator('main h1, main h2').evaluateAll((e) => e.map((x) => `${x.tagName}:${x.textContent?.trim()}`));
      expect(thuTu).toEqual(['H1:Trung tâm thử A', 'H2:Dịch vụ nhanh', 'H2:Thủ tục thường gặp', 'H2:Thời gian làm việc']);
      expect(await page.getByRole('heading', { level: 1 }).count()).toBe(1);
      const tong = await page.locator('body').innerText();
      for (const thu of ['Địa chỉ thử, phường thử B', '0000.000.000', 'thu@example.gov.vn']) {
        expect(tong.split(thu).length - 1, `${thu} xuất hiện`).toBe(1);
      }
      for (const re of [/lịch hành chính lưu động/i, /chữ lớn/i, /đọc to/i, /^Zalo/i]) await expect(page.locator('main').getByText(re)).toHaveCount(0);
    }
    // Tab: bỏ qua → thương hiệu → điều hướng → 4 ô → ...
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await expect(ODichVu(page)).toBeVisible();
    const dung: string[] = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      dung.push((await page.evaluate(() => (document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent ?? '').trim().slice(0, 30))));
    }
    console.log('F02-BC-10 thứ tự Tab:', dung.join(' → '));
    const iTra = dung.findIndex((s) => s.startsWith('Tra cứu hồ sơ'));
    const iThanhToan = dung.findIndex((s) => s.startsWith('Thanh toán'));
    expect(iTra).toBeGreaterThan(0);
    expect(iThanhToan).toBe(iTra + 1);
    expect(dung.some((s) => s.startsWith('Đánh giá'))).toBe(false);
  });

  test('F02-BC-06/07/08 · khối thường gặp rỗng không để khoảng trống; /api/thu-tuc lỗi chỉ ảnh hưởng khối thường gặp; /api/trung-tam lỗi vẫn có khối thường gặp', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await traTrungTam(page, trungTam());
    await page.route('**/api/linh-vuc', (r) => r.fulfill({ json: [] }));
    await page.route('**/api/thu-tuc', (r) => r.fulfill({ status: 500, contentType: 'application/problem+json', json: { status: 500, code: 'loi-he-thong', maTraCuu: 'MA123456' } }));
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'Thủ tục thường gặp' }).getByText('Chưa tải được dữ liệu.')).toBeVisible({ timeout: 20_000 });
    await expect(ODichVu(page).getByRole('listitem')).toHaveCount(6);
    await expect(GioLamViec(page)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trung tâm thử A');
  });

  test('F02-BC-09 · /?ma=1.001193: đúng 1 dialog (do F03), ô dịch vụ ở nền bị vô hiệu', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/?ma=1.001193');
    await expect(page.getByRole('dialog')).toHaveCount(1);
    expect(await ODichVu(page).evaluate((e) => !!e.closest('[inert]'))).toBe(true);
    await expect(page.getByRole('region', { name: 'Thủ tục thường gặp', exact: true }).getByRole('searchbox')).toBeVisible();
  });

  test('F02-BC-05 · điều hướng chính có "Danh mục thủ tục", "Lĩnh vực và mã QR"; trang chủ không lặp lối vào riêng', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page);
    await vao(page);
    const nav = page.getByRole('navigation', { name: 'Điều hướng chính' });
    await expect(nav.getByRole('link')).toHaveCount(3);
    await expect(page.locator('main').getByRole('link', { name: /Danh mục thủ tục|Lĩnh vực và mã QR/ })).toHaveCount(0);
  });
});

// ───────────────────────────── 7. Tải, lỗi khác ─────────────────────────────

test.describe('Dữ liệu bất thường', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F02-TL-08 · chunk TrangChu lỗi tải: LoiTrang trong vùng nội dung, đầu/chân trang còn', async ({ page }) => {
    await chuanBi(page);
    await page.route('**/assets/TrangChu-*.js', (r) => r.abort());
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible({ timeout: 20_000 });
    await page.unroute('**/assets/TrangChu-*.js');
    await page.getByRole('button', { name: 'Thử lại' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 });
  });

  test('F02-TL-09/10 · gioLamViec thiếu khoá/trường lạ không ném lỗi; ghi chú 500 ký tự có <script> hiện nguyên văn, không tràn (375)', async ({ page }) => {
    const loi = theoDoiLoi(page);
    const hopThoai = theoDoiHopThoai(page);
    await page.setViewportSize({ width: 375, height: 812 });
    const gio = [{ thu: 1, chieuTu: '13:30', chieuDen: '17:00', la: 1 } as unknown as GioThu, tg(2)];
    await chuanBi(page, trungTam({ gioLamViec: gio, ghiChuNgayNghi: '<script>alert(1)</script> ' + 'ghi chú dài '.repeat(45) }));
    await vao(page);
    await expect(GioLamViec(page)).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
    await expect(GioLamViec(page).locator('p')).toContainText('<script>alert(1)</script>');
    expect(await GioLamViec(page).locator('script').count()).toBe(0);
    expect(loi).toEqual([]);
    expect(hopThoai).toEqual([]);
  });
});

// ───────────────────────────── 9. Trợ năng ─────────────────────────────

test.describe('Trợ năng', () => {
  for (const [w, h, kiosk] of [[375, 812, false], [1280, 900, false], [1080, 1920, true]] as const) {
    test(`F02-TN-01/02 · axe ${w}px${kiosk ? ' kiosk' : ''}: trang chủ 0 vi phạm (đủ dữ liệu, đang tải, lỗi, giờ ẩn, ô rỗng)`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      const duong = kiosk ? '/?kiosk=1' : '/';
      await chuanBi(page);
      await page.goto(duong);
      await expect(GioLamViec(page)).toBeVisible();
      await expect(page.getByRole('region', { name: 'Thủ tục thường gặp', exact: true }).locator('tbody tr, article').first()).toBeVisible();
      let kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
      expect(kq.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
      for (const bien of [trungTam({ gioLamViec: [] }), trungTam({ oDichVu: [] })]) {
        await page.unrouteAll({ behavior: 'ignoreErrors' });
        await chuanBi(page, bien);
        await page.goto(duong);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
        expect(kq.violations.map((v) => v.id)).toEqual([]);
      }
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await traDanhMuc(page, boT43());
      await page.route('**/api/trung-tam', (r) => r.fulfill({ status: 500, contentType: 'application/problem+json', json: { status: 500, code: 'loi-he-thong', maTraCuu: 'MA123456' } }));
      await page.goto(duong);
      await expect(page.getByText('Chưa tải được dữ liệu.')).toBeVisible({ timeout: 20_000 });
      kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
      expect(kq.violations.map((v) => v.id)).toEqual([]);
    });
  }

  test('F02-TN-03/05/09/13/14 · nhãn trạng thái có icon + chữ; mỗi khối là section có tên; tên đọc ô chứa chữ nhìn thấy; vùng chạm ô >= 44 px ở 375; dòng giờ là danh sách', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page);
    await vao(page);
    await expect(trangThai(page)).toBeVisible();
    expect(await trangThai(page).evaluate((e) => e.parentElement?.querySelector('svg') !== null)).toBe(true);
    await expect(page.locator('main section[aria-labelledby]')).toHaveCount(await page.locator('main section').count());
    await expect(page.locator('main nav:not([aria-label="Phân trang"])')).toHaveCount(0);
    await expect(ODichVu(page).getByRole('link', { name: 'Tra cứu hồ sơ (mở trang mới)' })).toBeVisible();
    const hop = await ODichVu(page).getByRole('listitem').first().locator('> *').first().boundingBox();
    console.log(`F02-TN-13: ô dịch vụ ${hop!.width.toFixed(0)}x${hop!.height.toFixed(0)}`);
    expect(hop!.height).toBeGreaterThanOrEqual(44);
    expect(await dongGio(page).count()).toBeGreaterThan(0);
  });

  test('F02-TN-07/08 · 320 px và giãn chữ: không cuộn ngang, không mất nội dung', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await chuanBi(page, trungTam({ gioLamViec: G7, ten: 'Trung tâm có tên rất dài '.repeat(8) }));
    await vao(page);
    await expect(GioLamViec(page)).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
    await ganCssThu(page, CSS_GIAN_CHU);
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('F02-TN-12 · "Bỏ qua, tới nội dung chính": Enter đưa con trỏ vào main; Tab kế tới ô dịch vụ đầu có link', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Bỏ qua, tới nội dung chính' })).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    expect((await page.evaluate(() => document.activeElement?.textContent ?? '')).trim()).toContain('Tra cứu hồ sơ');
  });
});

// ───────────────────────────── 10. Bảo mật ─────────────────────────────

test.describe('Bảo mật', () => {
  for (const [w, h] of [[375, 812], [1280, 900]] as const) {
    test(`F02-BM-02/03/04/09 · ${w}px: 0 vi phạm CSP, 0 console.error; mọi request cùng gốc; /api/trung-tam đúng 1 lần; rel đủ; không gửi giờ máy`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      const loi = theoDoiLoi(page, true);
      await themBatCsp(page);
      const yc = ghiYeuCau(page);
      const dem: string[] = [];
      await chuanBi(page, trungTam(), { dem });
      await vao(page);
      await expect(GioLamViec(page)).toBeVisible();
      await page.waitForTimeout(500);
      expect(await layCsp(page)).toEqual([]);
      expect(loi).toEqual([]);
      const goc = new URL(page.url()).origin;
      expect(yc.filter((u) => /^https?:/.test(u) && new URL(u).origin !== goc)).toEqual([]);
      expect(dem.length).toBe(1);
      expect(duongApi(yc).map((u) => new URL(u).pathname).filter((p) => p === '/api/trung-tam')).toHaveLength(1);
      const lk = await ODichVu(page).locator('a').evaluateAll((a) => a.map((x) => ({ t: x.getAttribute('target'), r: x.getAttribute('rel') })));
      for (const l of lk) {
        expect(l.t).toBe('_blank');
        expect(l.r ?? '').toMatch(/noopener/);
        expect(l.r ?? '').toMatch(/noreferrer/);
      }
      for (const li of await ODichVu(page).getByRole('listitem').all()) {
        if ((await li.locator('a').count()) === 0) {
          expect(await li.locator('> *').first().getAttribute('target')).toBeNull();
          expect(await li.locator('> *').first().getAttribute('rel')).toBeNull();
        }
      }
      expect(await page.locator('script:not([src])').count()).toBe(0);
    });
  }

  test('F02-BM-01 (Development, HTTPS) · header của "/", /api/trung-tam, tài nguyên tĩnh', async ({ request }) => {
    const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
    const html = await request.get('/');
    const js = (await html.text()).match(/\/assets\/[^"']+\.js/)![0];
    for (const r of [html, await request.get('/api/trung-tam'), await request.get(js)]) {
      const h = r.headers();
      expect(h['content-security-policy']).toBe(CSP);
      expect(h['x-content-type-options']).toBe('nosniff');
      expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(h['permissions-policy']).toBe('microphone=(), camera=(), geolocation=()');
      expect(h['server']).toBeUndefined();
      expect(h['x-powered-by']).toBeUndefined();
    }
  });

  test('F02-BM-08/HD-07 · /api/trung-tam: chỉ trường của F08; giờ HH:mm, thu 1–7', async ({ request }) => {
    const j = (await (await request.get('/api/trung-tam')).json()) as Record<string, unknown> & { gioLamViec: Record<string, unknown>[]; oDichVu: Record<string, unknown>[] };
    expect(Object.keys(j).sort()).toEqual([
      'banDo', 'chucVuNguoiChiuTrachNhiem', 'coQuanChuQuan', 'diaChi', 'dienThoai', 'email', 'ghiChuNgayNghi', 'gioLamViec', 'lienKet', 'mangXaHoi',
      'ngayCapNhatThuTuc', 'nguoiChiuTrachNhiem', 'oDichVu', 'ten', 'tinh', 'xa',
    ]);
    for (const g of j.gioLamViec) {
      expect([1, 2, 3, 4, 5, 6, 7]).toContain(g['thu']);
      for (const k of ['sangTu', 'sangDen', 'chieuTu', 'chieuDen']) if (g[k] !== null) expect(String(g[k])).toMatch(/^\d{2}:\d{2}$/);
    }
    expect(JSON.stringify(j)).not.toMatch(/maDonViCongDvc|"id"|thuTu|tenFile/);
    // `moTa` đã bỏ khỏi API (không có chỗ hiển thị; F02 plan §4.5, F08 plan §3 còn ghi) — response chỉ có trường màn hình cần dùng
    expect(Object.keys(j.oDichVu[0]!).sort()).toEqual(['bieuTuong', 'ten', 'url']);
  });
});

// ───────────────────────────── 11. Hiệu năng ─────────────────────────────

test.describe('Hiệu năng', () => {
  for (const [w, h] of [[375, 812], [1280, 900]] as const) {
    for (const [ten, tt, tre] of [
      ['API thật (nguồn Mẫu)', null, 0],
      ['TT-A, API giả tức thì', trungTam(), 0],
      ['TT-A, API trễ 5 giây', trungTam(), 5000],
      ['TT-B (cơ quan trống), trễ 5 giây', trungTam({ coQuanChuQuan: null }), 5000],
      ['TT-C (tên dài), trễ 5 giây', trungTam({ ten: 'Trung tâm có tên rất dài '.repeat(9).slice(0, 200), coQuanChuQuan: 'Cơ quan chủ quản dài '.repeat(7).slice(0, 120) }), 5000],
    ] as const) {
      test(`F02-HN-05 · CLS ${w}px · ${ten} <= 0,1 (mục tiêu 0,05)`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.addInitScript(() => {
          const w2 = window as unknown as { __cls: number };
          w2.__cls = 0;
          new PerformanceObserver((l) => {
            for (const e of l.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) if (!e.hadRecentInput) w2.__cls += e.value;
          }).observe({ type: 'layout-shift', buffered: true });
        });
        await traDanhMuc(page, boT43());
        if (tt) await traTrungTam(page, tt, tre);
        await page.goto('/');
        await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('Tra cứu thủ tục hành chính', { timeout: 15_000 });
        await expect(page.getByRole('region', { name: 'Thủ tục thường gặp', exact: true }).locator('tbody tr, article').first()).toBeVisible();
        await page.waitForTimeout(1000);
        const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
        console.log(`F02-HN-05: ${w}px · ${ten}: CLS = ${cls.toFixed(3)}`);
        expect(cls).toBeLessThan(0.1);
      });
    }
  }

  test('F02-HN-06 · CLS khi dải giờ có 1 dòng (G1) hoặc 7 dòng (G7), API trễ 2 giây (375)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const [ten, gio] of [['G1', G1], ['G7', G7]] as const) {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await page.addInitScript(() => {
        const w2 = window as unknown as { __cls: number };
        w2.__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) if (!e.hadRecentInput) w2.__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await chuanBi(page, trungTam({ gioLamViec: gio }), { tre: 2000 });
      await page.goto('/');
      await expect(GioLamViec(page).getByRole('listitem').first()).toBeVisible({ timeout: 15_000 });
      await page.waitForTimeout(800);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      console.log(`F02-HN-06: ${ten} CLS = ${cls.toFixed(3)}`);
      expect(cls).toBeLessThan(0.1);
    }
  });

  test('F02-HN-08/13 · "/" gọi /api/trung-tam đúng 1 lần; không tải chunk trợ lý/QR/đọc ở trang chủ', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const yc = ghiYeuCau(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForTimeout(2500);
    const api = duongApi(yc).map((u) => new URL(u).pathname);
    expect(api.filter((p) => p === '/api/trung-tam')).toHaveLength(1);
    expect(api.filter((p) => !['/api/trung-tam', '/api/thu-tuc', '/api/linh-vuc'].includes(p))).toEqual([]);
    const js = yc.filter((u) => /\.js(\?|$)/.test(u)).map((u) => new URL(u).pathname.split('/').pop()!);
    for (const re of [/qr/i, /tro-?ly|chatbot|assistant/i, /grid/]) expect(js.filter((t) => re.test(t))).toEqual([]);
  });

  test('F02-HN-12 · trang mở 10 phút (đồng hồ giả): không rò bộ đếm (số setInterval không tăng), không lỗi', async ({ browser }) => {
    const ctx = await nguCanhTz(browser, 'Asia/Ho_Chi_Minh');
    const p = await ctx.newPage();
    const loi = theoDoiLoi(p);
    await p.clock.install({ time: new Date(MOC.I1!) });
    await traTrungTam(p, trungTam({ gioLamViec: G1 }));
    await traDanhMuc(p, boT43());
    await p.goto('/');
    expect(await nhan(p)).toBe(DANG_MO);
    for (let i = 0; i < 10; i++) await p.clock.fastForward(60_000);
    expect(await nhan(p)).toBe(DANG_MO);
    await p.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await expect(p.getByRole('tab').first()).toBeVisible();
    await p.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Trang chủ' }).click();
    expect(await nhan(p)).toBe(DANG_MO);
    expect(loi).toEqual([]);
    await ctx.close();
  });
});

// ───────────────────────────── Bổ sung ─────────────────────────────

test.describe('Bổ sung', () => {
  test('F02-TL-06 (F08 AC-11) · mất mạng sau khi đã tải xong: sang trang khác rồi về "/", "Thử lại" → mất kết nối + số điện thoại; có mạng → nội dung', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    await expect(ODichVu(page).getByRole('listitem')).toHaveCount(6);
    // làm cho dữ liệu cũ hết hạn và mất mạng: huỷ cache bằng tải lại trang với /api/trung-tam bị ngắt
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await traDanhMuc(page, boT43());
    await page.route('**/api/trung-tam', (r) => r.abort('internetdisconnected'));
    await page.reload();
    await expect(page.getByText(/Không kết nối được tới máy chủ/)).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText('Chưa tải được dữ liệu.')).toHaveCount(1);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await chuanBi(page);
    await ODichVu(page).getByRole('button', { name: 'Thử lại' }).click();
    await expect(ODichVu(page).getByRole('listitem')).toHaveCount(6, { timeout: 15_000 });
  });

  test('F02-KS-01/06 · kiosk 1080×1920: không cuộn ngang, ô dịch vụ >= 56 px, dải giờ đọc được', async ({ page }) => {
    await page.setViewportSize({ width: 1080, height: 1920 });
    await chuanBi(page);
    await vao(page, '/?kiosk=1');
    await expect(GioLamViec(page)).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
    const cao = (await ODichVu(page).getByRole('listitem').first().locator('> *').first().boundingBox())!.height;
    const chu = await dongGio(page).first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    console.log(`F02-KS-06: ô dịch vụ cao ${cao.toFixed(0)} px; cỡ chữ dòng giờ ${chu} px`);
    expect(cao).toBeGreaterThanOrEqual(56);
    expect(chu).toBeGreaterThanOrEqual(14);
  });

  test('F02-TN-10 · giảm chuyển động: không có hoạt ảnh chạy sau khi tải; tua đồng hồ không nhấp nháy', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', timezoneId: 'Asia/Ho_Chi_Minh', viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
    const p = await moVoiGio(ctx, MOC.I8!, trungTam({ gioLamViec: G1 }));
    expect(await nhan(p)).toBe(DANG_MO);
    await p.waitForTimeout(500);
    const hoatAnh = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && (a.effect?.getComputedTiming().iterations ?? 1) === Infinity).length);
    expect(hoatAnh).toBe(0);
    await p.clock.fastForward(120_000);
    await expect(trangThai(p)).toHaveText(NGOAI_GIO);
    await ctx.close();
  });

  test('F02-HD-10 (F08 IT-05) · PostgreSQL không tới được: HTML vẫn mở, ô dịch vụ ErrorState, banner dự phòng (cần API trỏ DB hỏng: E2E_DB_DOWN=1)', async ({ page }) => {
    test.skip(!process.env.E2E_DB_DOWN, 'Cần API nguồn PostgreSql với chuỗi kết nối tới máy không tồn tại và E2E_DB_DOWN=1.');
    await page.setViewportSize({ width: 1280, height: 900 });
    const phanHoi = await page.goto('/');
    expect(phanHoi!.status()).toBe(200);
    await expect(page.getByText('Chưa tải được dữ liệu.').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tra cứu thủ tục hành chính');
    const chu = await page.locator('body').innerText();
    expect(chu).not.toMatch(/Host=|Password|khong-co|Npgsql| {3}at /);
  });
});
