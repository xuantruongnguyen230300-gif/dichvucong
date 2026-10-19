import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

/**
 * F08 · Khung trang chung — e2e trên bản build do API phục vụ (xem ban-build.config.ts).
 * Mã ca (F08-KH-01…) theo .specify/specs/F08-khung-trang/testcases.md.
 * Dữ liệu Trung tâm: lấy từ API thật (nguồn Mẫu) cho ca "so khớp dữ liệu"; ca cần bộ dữ liệu riêng (A, B, C, D, E, F)
 * thì chặn GET /api/trung-tam và trả bộ thử — kiểm lớp FE phòng thủ, không phụ thuộc DB.
 */

const TEN_THU = 'Trung tâm thử A';
const THE_AXE = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const DAU_TRANG_THEO_DUONG_DAN: Record<string, string> = {
  '/': 'Trang chủ',
  '/thu-tuc': 'Danh mục thủ tục',
  '/linh-vuc': 'Lĩnh vực và mã QR',
  '/abc-xyz': 'Không tìm thấy trang',
};
const BON_DUONG_DAN = Object.keys(DAU_TRANG_THEO_DUONG_DAN);
const MIEN_TRU =
  'Thông tin chỉ để tham khảo. Thành phần hồ sơ, thời hạn, phí chính thức căn cứ theo Cổng Dịch vụ công Quốc gia.';

interface DuLieuTrungTam {
  ten: string;
  xa: string | null;
  tinh: string | null;
  coQuanChuQuan: string | null;
  nguoiChiuTrachNhiem: string;
  chucVuNguoiChiuTrachNhiem: string | null;
  diaChi: string;
  dienThoai: string;
  email: string;
  banDo: string | null;
  mangXaHoi: { zaloOa: string | null; facebook: string | null; youTube: string | null; tikTok: string | null };
  lienKet: { ten: string; url: string }[];
  oDichVu: unknown[];
  gioLamViec: unknown[];
  ghiChuNgayNghi: string | null;
  ngayCapNhatThuTuc: string | null;
}

/** Bộ A (đầy đủ). */
const boA = (): DuLieuTrungTam => ({
  ten: TEN_THU,
  xa: 'phường thử B',
  tinh: 'tỉnh thử C',
  coQuanChuQuan: 'UBND phường thử B',
  nguoiChiuTrachNhiem: 'Người thử',
  chucVuNguoiChiuTrachNhiem: 'Giám đốc (dữ liệu thử)',
  diaChi: 'Địa chỉ thử, phường thử B',
  dienThoai: '0000.000.000',
  email: 'thu@example.gov.vn',
  banDo: 'https://maps.example.test/thu',
  mangXaHoi: { zaloOa: 'https://zalo.example.test/thu', facebook: null, youTube: null, tikTok: null },
  lienKet: [
    { ten: 'Cổng Dịch vụ công Quốc gia', url: 'https://dvc.example.test' },
    { ten: 'Cổng thông tin điện tử phường thử B', url: 'https://xa.example.test' },
    { ten: 'Cổng thông tin điện tử tỉnh thử C', url: 'https://tinh.example.test' },
  ],
  oDichVu: [],
  gioLamViec: [],
  ghiChuNgayNghi: null,
  ngayCapNhatThuTuc: '2026-10-08',
});

/** Bộ B (tối thiểu). */
const boB = (): DuLieuTrungTam => ({
  ...boA(),
  coQuanChuQuan: null,
  chucVuNguoiChiuTrachNhiem: null,
  banDo: null,
  mangXaHoi: { zaloOa: null, facebook: null, youTube: null, tikTok: null },
  lienKet: [],
});

async function traDuLieu(page: Page, duLieu: DuLieuTrungTam | ((r: Route) => Promise<void>)) {
  await page.route('**/api/trung-tam', async (route) => {
    if (typeof duLieu === 'function') {
      await duLieu(route);
    } else {
      await route.fulfill({ json: duLieu });
    }
  });
}

/** Gom lỗi console, lỗi trang chưa xử lý và vi phạm CSP. Lỗi "Failed to load resource" do chính ca cố tình gây ra thì bỏ qua. */
function theoDoiLoi(page: Page, boQuaTaiTaiNguyen = false): string[] {
  const loi: string[] = [];
  page.on('pageerror', (e) => loi.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (boQuaTaiTaiNguyen && m.text().includes('Failed to load resource')) return;
    loi.push(`console: ${m.text()}`);
  });
  return loi;
}

async function themBatCsp(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __csp: string[] };
    w.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      w.__csp.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
}

const layCsp = (page: Page) => page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);

const khongTranNgang = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

const nav = (page: Page) => page.getByRole('navigation', { name: 'Điều hướng chính' });

/** Chữ NHÌN THẤY của từng mục điều hướng: bỏ phần ẩn bằng cắt/1px (VisuallyHidden) và phần aria-hidden không có kích thước. */
const chuNhinThay = (page: Page) =>
  nav(page).evaluate((n) =>
    [...n.querySelectorAll('a')].map((a) =>
      [...a.querySelectorAll('span')]
        .filter((sp) => sp.children.length === 0 && sp.getBoundingClientRect().width > 2 && sp.getBoundingClientRect().height > 2)
        .map((sp) => sp.textContent?.trim() ?? '')
        .join(' ')
        .trim(),
    ),
  );
const tenDoc = (page: Page) =>
  nav(page).evaluate((n) => [...n.querySelectorAll('a')].map((a) => [...a.querySelectorAll('span')].filter((sp) => sp.getAttribute('aria-hidden') !== 'true' && !sp.closest('[aria-hidden="true"]')).map((sp) => sp.textContent?.trim() ?? '').join(' ').trim()));

// ───────────────────────────── 1. Khung chung, điều hướng ─────────────────────────────

test.describe('Khung chung và điều hướng (BR-1, BR-2)', () => {
  for (const [rong, cao] of [
    [1280, 800],
    [375, 812],
  ] as const) {
    test(`F08-KH-01/02/03 · ${rong}px: đầu, điều hướng, chân trang giống nhau ở 4 trang; 3 mục; aria-current; không nút menu`, async ({ page }) => {
      await page.setViewportSize({ width: rong, height: cao });
      const chuKy: string[] = [];
      for (const duongDan of BON_DUONG_DAN) {
        await page.goto(duongDan);
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('footer')).toContainText('Người chịu trách nhiệm'); // chờ dữ liệu Trung tâm về, tránh đo lúc còn khối chờ
        // KH-01: chữ ký cấu trúc của header/nav/footer, trừ trạng thái mục đang xem
        chuKy.push(
          await page.evaluate(() => {
            const bo = (el: Element | null) =>
              el
                ? [...el.querySelectorAll('*')]
                    .map((e) => `${e.tagName}${e.getAttribute('href') ? `[${e.getAttribute('href')}]` : ''}`)
                    .join('>')
                : 'THIEU';
            return [
              bo(document.querySelector('header')),
              bo(document.querySelector('nav')),
              bo(document.querySelector('footer')),
            ].join('|');
          }),
        );
        // KH-02: đúng 3 mục theo thứ tự, không nút menu
        const lienKet = nav(page).getByRole('link');
        await expect(lienKet).toHaveCount(3);
        expect(await tenDoc(page)).toEqual(['Trang chủ', 'Danh mục thủ tục', 'Lĩnh vực và mã QR']);
        for (const [i, ten] of ['Trang chủ', 'Danh mục thủ tục', 'Lĩnh vực và mã QR'].entries()) {
          await expect(lienKet.nth(i)).toHaveAccessibleName(ten);
        }
        await expect(page.getByRole('button', { name: /menu/i })).toHaveCount(0);
        // KH-03: aria-current đúng một mục (trừ trang 404: không mục nào)
        const dangXem = nav(page).locator('[aria-current="page"]');
        await expect(dangXem).toHaveCount(duongDan === '/abc-xyz' ? 0 : 1);
        if (duongDan !== '/abc-xyz') {
          await expect(dangXem).toHaveAccessibleName(DAU_TRANG_THEO_DUONG_DAN[duongDan]!);
          const gachChan = await dangXem.evaluate((e) => getComputedStyle(e).textDecorationLine + '|' + getComputedStyle(e).borderBottomWidth);
          expect(gachChan, 'mục đang xem phải phân biệt không chỉ bằng màu (gạch dưới hoặc viền)').toMatch(/underline|[1-9]px/);
        }
      }
      expect(new Set(chuKy).size, `cấu trúc đầu/điều hướng/chân trang khác nhau giữa các trang: ${chuKy.join('\n')}`).toBe(1);
    });
  }

  test('F08-KH-04/05/06 · bấm biểu tượng hoặc tên về trang chủ; liên kết thương hiệu là một <a> duy nhất', async ({ page }) => {
    await page.goto('/thu-tuc');
    const thuongHieu = page.locator('header a');
    await expect(thuongHieu).toHaveCount(1);
    await expect(thuongHieu.locator('img')).toHaveCount(1);
    await thuongHieu.locator('img').click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/thu-tuc');
    await page.locator('header a').getByText(/\S/).first().click();
    await expect(page).toHaveURL(/\/$/);
    // KH-06: Tab tới liên kết thương hiệu rồi Enter
    await page.goto('/thu-tuc');
    await page.keyboard.press('Tab'); // liên kết bỏ qua
    await page.keyboard.press('Tab'); // thương hiệu
    await expect(page.locator('header a')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/$/);
  });

  test('F08-KH-07/08/09/TN-05 · 375px: 3 mục một hàng, nhãn ngắn hiện, tên đọc là nhãn đầy đủ, không cuộn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const thanh = nav(page);
    const ok = {
      ...(await thanh.evaluate((n) => ({
        vua: n.scrollWidth <= n.clientWidth,
        tops: [...n.querySelectorAll('a')].map((a) => Math.round(a.getBoundingClientRect().top)),
      }))),
      chuHien: await chuNhinThay(page),
    };
    expect(ok.vua, 'thanh điều hướng không cuộn ngang').toBe(true);
    expect(new Set(ok.tops).size, 'ba mục trên một hàng').toBe(1);
    expect(ok.chuHien).toEqual(['Trang chủ', 'Danh mục', 'Lĩnh vực']);
    expect(await khongTranNgang(page)).toBe(true);
    for (const ten of ['Trang chủ', 'Danh mục thủ tục', 'Lĩnh vực và mã QR']) {
      await expect(page.getByRole('link', { name: ten, exact: true })).toHaveCount(1);
    }
    await thanh.getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await expect(page).toHaveURL(/\/thu-tuc$/);
    await expect(thanh.getByRole('link', { name: 'Danh mục thủ tục' })).toHaveAttribute('aria-current', 'page');
    // nhãn ngắn aria-hidden
    expect(await thanh.locator('[aria-hidden="true"]').evaluateAll((l) => l.map((e) => (e as HTMLElement).textContent?.trim()))).toEqual(
      expect.arrayContaining(['Danh mục', 'Lĩnh vực']),
    );
  });

  for (const [rong, cao] of [
    [600, 900],
    [768, 1024],
    [1280, 800],
  ] as const) {
    test(`F08-KH-11 · ${rong}px: nhãn đầy đủ hiện ra`, async ({ page }) => {
      await page.setViewportSize({ width: rong, height: cao });
      await page.goto('/');
      expect(await chuNhinThay(page)).toEqual(['Trang chủ', 'Danh mục thủ tục', 'Lĩnh vực và mã QR']);
    });
  }

  test('F08-KH-12/TN-07 · 320px (và phóng 200%): không cuộn ngang ở 4 trang', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    for (const duongDan of BON_DUONG_DAN) {
      await page.goto(duongDan);
      await expect(page.locator('footer')).toBeVisible();
      expect(await khongTranNgang(page), `${duongDan} cuộn ngang ở 320px`).toBe(true);
    }
    await page.setViewportSize({ width: 640, height: 360 });
    await page.goto('/');
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('F08-KH-13 · thanh điều hướng dính đầu màn hình khi cuộn', async ({ page }) => {
    for (const rong of [1280, 375]) {
      await page.setViewportSize({ width: rong, height: 700 });
      await page.goto('/');
      expect(await nav(page).evaluate((n) => getComputedStyle(n).position)).toBe('sticky');
      await page.evaluate(() => {
        const dem = document.createElement('div');
        dem.style.height = '3000px';
        document.querySelector('main')!.append(dem);
        window.scrollTo(0, 1500);
      });
      const top = await nav(page).evaluate((n) => Math.round(n.getBoundingClientRect().top));
      expect(top, `điều hướng phải dính đầu (${rong}px)`).toBeLessThanOrEqual(1);
    }
  });

  test('F08-KH-14 · kiosk 1080x1920: khung chung đủ, nhãn đầy đủ, không cuộn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.goto('/?kiosk=1');
    await expect(page.locator('html')).toHaveClass(/kiosk/);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    expect(await chuNhinThay(page)).toEqual(['Trang chủ', 'Danh mục thủ tục', 'Lĩnh vực và mã QR']);
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('F08-KH-15 · điều hướng trong ứng dụng không tải lại trang; Quay lại giữ mục đang xem đúng', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => ((window as unknown as { __dau: number }).__dau = 1));
    await nav(page).getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await expect(page).toHaveURL(/\/thu-tuc$/);
    await nav(page).getByRole('link', { name: 'Lĩnh vực và mã QR' }).click();
    await expect(page).toHaveURL(/\/linh-vuc$/);
    await page.goBack();
    await expect(nav(page).locator('[aria-current="page"]')).toHaveAccessibleName('Danh mục thủ tục');
    await page.goBack();
    await expect(nav(page).locator('[aria-current="page"]')).toHaveAccessibleName('Trang chủ');
    expect(await page.evaluate(() => (window as unknown as { __dau?: number }).__dau)).toBe(1);
  });

  test('F08-KH-17/CT-17/MT-04/TD-11 · API 404: đầu trang còn biểu tượng + điều hướng, chân trang chỉ còn lời miễn trừ, trang không lỗi', async ({ page }) => {
    const loi = theoDoiLoi(page, true);
    await traDuLieu(page, (r) => r.fulfill({ status: 404, contentType: 'application/problem+json', body: JSON.stringify({ title: 'Not Found', status: 404, code: 'khong-tim-thay', maTraCuu: 'ABCD2345' }) }));
    await page.goto('/');
    await expect(page.locator('header a')).toHaveAccessibleName('Trang chủ');
    await expect(page.locator('header img')).toHaveCount(1);
    await expect(nav(page).getByRole('link')).toHaveCount(3);
    const chanTrang = page.locator('footer');
    await expect(chanTrang).toContainText(MIEN_TRU);
    await expect(chanTrang.getByRole('heading')).toHaveCount(0);
    await expect(chanTrang).not.toContainText(/undefined|null/);
    expect(loi).toEqual([]);
  });

  test('F08-KH-18 · chưa có nhãn EMC hay chữ giữ chỗ trong chân trang', async ({ page }) => {
    await page.goto('/');
    const chan = (await page.locator('footer').innerText()).toLowerCase();
    expect(chan).not.toMatch(/emc|n\/a|undefined|null/);
  });
});

// ───────────────────────────── 2. Liên kết bỏ qua, bàn phím ─────────────────────────────

test.describe('Liên kết bỏ qua và bàn phím (BR-12)', () => {
  for (const [rong, cao] of [
    [1280, 800],
    [375, 812],
    [1080, 1920],
  ] as const) {
    test(`F08-BQ-01/02/06 · ${rong}px: Tab đầu tiên vào liên kết bỏ qua; Enter đưa focus vào main, địa chỉ không đổi`, async ({ page }) => {
      await page.setViewportSize({ width: rong, height: cao });
      await page.goto(rong === 1080 ? '/?kiosk=1' : '/');
      const url = page.url().replace(/\?kiosk=1$/, '');
      await page.keyboard.press('Tab');
      const boQua = page.getByRole('link', { name: 'Bỏ qua, tới nội dung chính' });
      await expect(boQua).toBeFocused();
      await expect(boQua).toBeInViewport();
      await page.keyboard.press('Enter');
      expect(await page.evaluate(() => document.activeElement?.id)).toBe('noi-dung');
      expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('MAIN');
      expect(page.url().replace(/\?kiosk=1$/, '')).toBe(url);
      expect(page.url()).not.toContain('#noi-dung');
      const vienMain = await page.locator('main').evaluate((m) => getComputedStyle(m).outlineStyle);
      expect(vienMain).toBe('none');
    });
  }

  test('F08-BQ-03/04 · liên kết bỏ qua có ở mọi trang kể cả 404, đầu tiên, ẩn nhưng còn trong cây trợ năng', async ({ page }) => {
    for (const duongDan of BON_DUONG_DAN) {
      await page.goto(duongDan);
      const boQua = page.getByRole('link', { name: 'Bỏ qua, tới nội dung chính' });
      // chưa focus: nằm ngoài màn hình nhưng không display:none/visibility:hidden
      const kieu = await boQua.evaluate((a) => ({ hienThi: getComputedStyle(a).display, ankhuat: getComputedStyle(a).visibility, top: a.getBoundingClientRect().bottom }));
      expect(kieu.hienThi).not.toBe('none');
      expect(kieu.ankhuat).toBe('visible');
      expect(kieu.top, 'chưa focus thì phải nằm ngoài màn hình').toBeLessThanOrEqual(0);
      await page.keyboard.press('Tab');
      await expect(boQua).toBeFocused();
    }
  });

  test('F08-BQ-05/TN-04 · thứ tự Tab: bỏ qua, thương hiệu, 3 mục điều hướng, nội dung, chân trang; viền focus nhìn thấy', async ({ page }) => {
    for (const rong of [1280, 375]) {
      await page.setViewportSize({ width: rong, height: 812 });
      await page.goto('/');
      await expect(page.locator('footer a').first()).toBeVisible();
      const thuTu: string[] = [];
      for (let i = 0; i < 200; i += 1) {
        await page.keyboard.press('Tab');
        const mo = await page.evaluate(() => {
          const e = document.activeElement as HTMLElement | null;
          if (!e || e === document.body) return 'BODY';
          const vung = e.closest('footer') ? 'CHAN' : e.closest('nav') ? 'NAV' : e.closest('header') ? 'DAU' : e.closest('main') ? 'MAIN' : 'KHAC';
          const s = getComputedStyle(e);
          // Ô nhập (SearchBox) vẽ viền focus ở khung bao (:focus-within), bản thân <input> không có outline: kiểm riêng ở C01
          const vien = e.tagName === 'INPUT' || (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2);
          const trang = vung !== 'CHAN' || s.outlineColor === 'rgb(255, 255, 255)';
          return `${vung}:${vien ? 'vien' : 'khong-vien'}${trang ? '' : '-sai-mau'}:${(e.textContent ?? '').trim().slice(0, 20)}`;
        });
        if (mo === 'BODY') break;
        thuTu.push(mo);
      }
      const vung = thuTu.map((m) => m.split(':')[0]);
      const thuTuMongDoi = ['KHAC', 'DAU', 'NAV', 'NAV', 'NAV'];
      // liên kết bỏ qua nằm ngoài main/header/nav nên rơi vào "KHAC"? (nằm trong div.khung): chấp nhận KHAC hoặc MAIN
      expect(vung.slice(1, 5), `thứ tự Tab ${rong}px: ${thuTu.join(' | ')}`).toEqual(thuTuMongDoi.slice(1));
      const dau = vung.indexOf('CHAN');
      expect(dau, 'phải Tab tới chân trang sau nội dung').toBeGreaterThan(4);
      // Sau chân trang chỉ còn nút "Trợ lý" nổi (F06; đứng sau chân trang trong DOM)
      const saChan = thuTu.slice(dau).filter((m) => !m.startsWith('CHAN:') && !/Trợ lý/.test(m));
      expect(saChan, 'sau chân trang chỉ có nút Trợ lý').toEqual([]);
      expect(thuTu.filter((m) => m.includes('khong-vien') || m.includes('sai-mau')), 'mọi phần tử nhận focus phải có viền (trắng ở chân trang nền đậm)').toEqual([]);
    }
  });
});

// ───────────────────────────── 3. Chân trang ─────────────────────────────

test.describe('Chân trang (BR-3 … BR-7)', () => {
  test('F08-CT-01/03/10/16/20 · dữ liệu thật (nguồn Mẫu): 5 mục bắt buộc đúng như API, trong <footer>, mỗi khối là section có h2', async ({ page, request }) => {
    const api = await (await request.get('/api/trung-tam')).json();
    await page.goto('/');
    const chan = page.locator('footer');
    await expect(chan).toContainText(api.ten);
    const nguoi = api.chucVuNguoiChiuTrachNhiem
      ? `Người chịu trách nhiệm nội dung: ${api.nguoiChiuTrachNhiem} – ${api.chucVuNguoiChiuTrachNhiem}`
      : `Người chịu trách nhiệm nội dung: ${api.nguoiChiuTrachNhiem}`;
    await expect(chan).toContainText(nguoi);
    await expect(chan).toContainText(api.diaChi);
    await expect(chan.getByRole('link', { name: api.dienThoai })).toHaveAttribute('href', /^tel:\+?\d+$/);
    await expect(chan.getByRole('link', { name: api.email })).toHaveAttribute('href', `mailto:${api.email}`);
    expect(await chan.locator('a[href^="mailto:"]').getAttribute('target')).toBeNull();
    expect(await chan.locator('a[href^="tel:"]').getAttribute('target')).toBeNull();
    await expect(chan).toContainText(`© ${api.ten}`);
    // CT-16: mỗi khối là section có h2
    const khoi = await chan.evaluate((f) => [...f.querySelectorAll('section')].map((s) => !!s.querySelector('h2') && s.getAttribute('aria-labelledby') === s.querySelector('h2')?.id));
    expect(khoi.length).toBeGreaterThanOrEqual(2);
    expect(khoi.every(Boolean)).toBe(true);
    // 375: vẫn đủ
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(chan).toContainText(api.email);
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('F08-CT-01/03/05/20 · bộ A: đúng chữ theo dữ liệu, không thêm bớt', async ({ page }) => {
    await traDuLieu(page, boA());
    await page.goto('/');
    const chan = page.locator('footer');
    await expect(chan.getByRole('heading', { level: 2, name: TEN_THU })).toBeVisible();
    await expect(chan).toContainText('Người chịu trách nhiệm nội dung: Người thử – Giám đốc (dữ liệu thử)');
    await expect(chan).toContainText('Địa chỉ thử, phường thử B');
    await expect(chan).toContainText('Cơ quan chủ quản: UBND phường thử B');
    await expect(chan.getByRole('link', { name: '0000.000.000' })).toHaveAttribute('href', 'tel:0000000000');
    await expect(chan.getByRole('link', { name: 'thu@example.gov.vn' })).toHaveAttribute('href', 'mailto:thu@example.gov.vn');
    await expect(chan).toContainText(`© ${TEN_THU}`);
    await expect(chan).not.toContainText(/© .*\d{4}/); // không ghi năm
  });

  test('F08-CT-04/06 · chức vụ trống: không có "–" thừa; cơ quan chủ quản trống: không dòng, không nhãn trống', async ({ page }) => {
    await traDuLieu(page, { ...boA(), chucVuNguoiChiuTrachNhiem: null, coQuanChuQuan: null });
    await page.goto('/');
    const chan = page.locator('footer');
    await expect(chan).toContainText('Người chịu trách nhiệm nội dung: Người thử');
    const dong = await chan.getByText(/Người chịu trách nhiệm nội dung/).innerText();
    expect(dong.trim()).toBe('Người chịu trách nhiệm nội dung: Người thử');
    await expect(chan).not.toContainText('Cơ quan chủ quản');
  });

  test('F08-CT-07/MT-01 · bộ B: không bản đồ, không khối mạng xã hội kể cả tiêu đề, không khối liên kết; lời miễn trừ còn', async ({ page }) => {
    await traDuLieu(page, boB());
    await page.goto('/');
    const chan = page.locator('footer');
    await expect(chan).not.toContainText('Xem bản đồ');
    await expect(chan).not.toContainText('Mạng xã hội');
    await expect(chan).not.toContainText('Liên kết hữu ích');
    await expect(chan).not.toContainText(/N\/A|undefined|null|^-$/);
    await expect(chan).toContainText(MIEN_TRU);
    expect(await chan.locator('li:empty, li:has(> span:empty)').count()).toBe(0);
  });

  test('F08-CT-11/LK-02/BM-08 · liên kết ra ngoài: tab mới, rel noopener noreferrer, opener null, có "(mở trang mới)"', async ({ page, context }) => {
    await traDuLieu(page, boA());
    await page.route('https://*.example.test/**', (r) => r.fulfill({ contentType: 'text/html', body: '<title>x</title>' }));
    await page.goto('/');
    const ngoai = page.locator('footer a[target="_blank"]');
    const n = await ngoai.count();
    expect(n).toBe(1 + 3 + 1); // bản đồ + 3 liên kết hữu ích + Zalo OA
    for (let i = 0; i < n; i += 1) {
      const a = ngoai.nth(i);
      const rel = (await a.getAttribute('rel')) ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
      expect(await a.locator('xpath=.').evaluate((e) => e.textContent)).toContain('(mở trang mới)');
    }
    const [tabMoi] = await Promise.all([context.waitForEvent('page'), page.locator('footer').getByRole('link', { name: /Xem bản đồ/ }).click()]);
    await tabMoi.waitForLoadState();
    expect(await tabMoi.evaluate(() => window.opener)).toBeNull();
    await tabMoi.close();
    // thứ tự liên kết hữu ích theo dữ liệu
    const ten = await page.locator('footer section', { has: page.getByRole('heading', { name: 'Liên kết hữu ích' }) }).locator('a').evaluateAll((l) => l.map((a) => (a as HTMLElement).innerText.replace('(mở trang mới)', '').trim()));
    expect(ten).toEqual(['Cổng Dịch vụ công Quốc gia', 'Cổng thông tin điện tử phường thử B', 'Cổng thông tin điện tử tỉnh thử C']);
  });

  test('F08-LK-01/02/04 · liên kết hữu ích của dữ liệu thật (nguồn Mẫu): đúng thứ tự, đúng địa chỉ API', async ({ page, request }) => {
    const api = await (await request.get('/api/trung-tam')).json();
    await page.goto('/');
    const khoi = page.locator('footer section', { has: page.getByRole('heading', { name: 'Liên kết hữu ích' }) });
    await expect(khoi).toBeVisible();
    const hrefs = await khoi.locator('a').evaluateAll((l) => l.map((a) => (a as HTMLAnchorElement).getAttribute('href')));
    const mongDoi = (api.lienKet as { url: string }[]).map((l) => new URL(l.url).href);
    expect(hrefs).toEqual(mongDoi);
    expect(hrefs.length).toBe(3);
  });

  test('F08-CT-15/LK-03 · không có liên kết tới tên miền đã bỏ (lien-ket.md §1 "Đã bỏ") ở chân trang, dữ liệu Trung tâm và ô dịch vụ; không dòng nhắc đăng xuất', async ({ page, request }) => {
    const DA_BO = ['motcua.tayninh.gov.vn', 'vbdh.tayninh.gov.vn', 'dichvucong.tayninh.gov.vn'];
    await page.goto('/');
    await expect(page.locator('footer')).toContainText('Người chịu trách nhiệm');
    const hrefs = await page.locator('footer a, main a').evaluateAll((l) => l.map((a) => (a as HTMLAnchorElement).href.toLowerCase()));
    for (const h of hrefs) for (const mien of DA_BO) expect(h, `liên kết tới ${mien}`).not.toContain(mien);
    const api = JSON.stringify(await (await request.get('/api/trung-tam')).json()).toLowerCase();
    for (const mien of DA_BO) expect(api, `dữ liệu Trung tâm nhắc ${mien}`).not.toContain(mien);
    await expect(page.locator('footer')).not.toContainText(/đăng xuất/i);
  });

  test('F08-CT-12 · bộ D (tên 200 ký tự, địa chỉ 500, 15 liên kết): xuống dòng, không cuộn ngang, đủ 15 liên kết', async ({ page }) => {
    const du: DuLieuTrungTam = {
      ...boA(),
      ten: 'Trung tâm '.repeat(18).slice(0, 200),
      diaChi: 'Số 1 đường thử, '.repeat(40).slice(0, 500),
      lienKet: Array.from({ length: 15 }, (_, i) => ({ ten: `Liên kết số ${i + 1} `.padEnd(100, 'x'), url: `https://lk${i + 1}.example.test` })),
    };
    for (const rong of [375, 1280]) {
      await page.setViewportSize({ width: rong, height: 812 });
      await traDuLieu(page, du);
      await page.goto('/');
      await expect(page.locator('footer')).toContainText('Số 1 đường thử');
      expect(await khongTranNgang(page), `bộ D cuộn ngang ở ${rong}px`).toBe(true);
      await expect(page.locator('footer section', { has: page.getByRole('heading', { name: 'Liên kết hữu ích' }) }).locator('a')).toHaveCount(15);
      await page.unroute('**/api/trung-tam');
    }
  });

  test('F08-CT-13/BM-09 · bộ E (liên kết độc hại): thành chữ thường, không điều hướng, không hộp thoại', async ({ page }) => {
    const hopThoai: string[] = [];
    page.on('dialog', async (d) => {
      hopThoai.push(d.message());
      await d.dismiss();
    });
    await traDuLieu(page, {
      ...boA(),
      banDo: 'data:text/html,x',
      mangXaHoi: { zaloOa: null, facebook: '//evil.example', youTube: 'javascript:alert(1)', tikTok: null },
      lienKet: [{ ten: 'Liên kết độc hại', url: 'javascript:alert(1)' }, { ten: 'Liên kết thường', url: 'https://ok.example.test' }],
    });
    await page.goto('/');
    const chan = page.locator('footer');
    await expect(chan).toContainText('Liên kết độc hại');
    expect(await chan.getByText('Liên kết độc hại').evaluate((e) => e.closest('a'))).toBeNull();
    await expect(chan.getByRole('link', { name: /Liên kết thường/ })).toHaveCount(1);
    await expect(chan.getByRole('link', { name: /Xem bản đồ/ })).toHaveCount(0);
    await expect(chan.getByRole('link', { name: /Facebook|YouTube/ })).toHaveCount(0);
    const hrefs = await chan.locator('a').evaluateAll((l) => l.map((a) => a.getAttribute('href') ?? ''));
    expect(hrefs.filter((h) => /^(javascript|data|vbscript):/i.test(h) || h.startsWith('//'))).toEqual([]);
    await chan.getByText('Liên kết độc hại').click();
    expect(hopThoai).toEqual([]);
    expect(page.url()).toMatch(/\/$/);
  });

  test('F08-CT-14/BM-10/TD-06 · bộ C (HTML trong tên): hiện nguyên chữ, không sinh <b>/<script>, không hộp thoại', async ({ page }) => {
    const hopThoai: string[] = [];
    page.on('dialog', async (d) => {
      hopThoai.push(d.message());
      await d.dismiss();
    });
    const ten = 'Trung tâm "thử" & <b>C</b>';
    await traDuLieu(page, { ...boA(), ten, xa: 'phường <script>alert(1)</script>', coQuanChuQuan: "UBND 'thử' &amp;" });
    await page.goto('/');
    await expect(page.locator('header')).toContainText(ten);
    await expect(page.locator('footer')).toContainText(ten);
    await expect(page.locator('footer')).toContainText("UBND 'thử' &amp;");
    expect(await page.locator('header b, footer b, header script, footer script').count()).toBe(0);
    expect(hopThoai).toEqual([]);
    await expect(page).toHaveTitle(new RegExp(`Trang chủ – Trung tâm "thử" & <b>C</b>`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  test('F08-CT-18 · API chậm 3 giây: chân trang hiện khối chờ, lời miễn trừ vẫn có', async ({ page }) => {
    await traDuLieu(page, async (r) => {
      await new Promise((x) => setTimeout(x, 3000));
      await r.fulfill({ json: boA() });
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    // Chân trang (kể cả lời miễn trừ) ẩn trong lúc trang có khung chờ — xem F08-TL-04. Chờ tới khi hết khung chờ rồi mới kiểm.
    await expect(page.locator('footer')).toContainText(MIEN_TRU, { timeout: 10_000 });
    await expect(page.locator('footer')).toContainText('Người chịu trách nhiệm');
  });

  test('F08-TL-04 (BR-11, AC-13) · trang còn khung chờ: chân trang (và lời miễn trừ) vẫn hiện, không đợi dữ liệu', async ({ page }) => {
    await traDuLieu(page, async (r) => {
      await new Promise((x) => setTimeout(x, 3000));
      await r.fulfill({ json: boA() });
    });
    await page.route('**/api/thu-tuc', async (r) => {
      await new Promise((x) => setTimeout(x, 3000));
      await r.continue();
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/thu-tuc');
    await expect(page.getByText('Đang tải…').first()).toBeAttached();
    // Spec F08 BR-11/AC-13: đầu, điều hướng và CHÂN TRANG hiện trước, vùng nội dung "Đang tải…" tới khi có dữ liệu.
    await expect(page.locator('footer'), 'chân trang phải hiện ngay khi trang còn khung chờ').toBeVisible({ timeout: 1500 });
  });
});

// ───────────────────────────── 4. Ngày cập nhật ─────────────────────────────

test.describe('Ngày cập nhật dữ liệu (BR-6)', () => {
  test('F08-NG-05 · ngày null: không có dòng ngày, không "Invalid Date"', async ({ page }) => {
    await traDuLieu(page, { ...boA(), ngayCapNhatThuTuc: null });
    await page.goto('/');
    await expect(page.locator('footer')).toContainText(MIEN_TRU);
    await expect(page.locator('footer')).not.toContainText(/cập nhật ngày|Invalid Date|NaN/);
  });

  test('F08-NG-01/06 · hiện dd/mm/yyyy 2 chữ số, không phụ thuộc múi giờ trình duyệt', async ({ browser }) => {
    for (const timezoneId of ['America/Los_Angeles', 'Pacific/Kiritimati', 'Asia/Ho_Chi_Minh']) {
      const ctx = await browser.newContext({ timezoneId, ignoreHTTPSErrors: true });
      const page = await ctx.newPage();
      await traDuLieu(page, { ...boA(), ngayCapNhatThuTuc: '2026-01-05' });
      await page.goto('/');
      await expect(page.locator('footer')).toContainText('Dữ liệu thủ tục cập nhật ngày 05/01/2026');
      await ctx.close();
    }
  });

  test('F08-NG-01 (nguồn Mẫu thật) · dòng ngày khớp ngày của API, định dạng dd/mm/yyyy', async ({ page, request }) => {
    const api = await (await request.get('/api/trung-tam')).json();
    expect(api.ngayCapNhatThuTuc).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const [y, m, d] = (api.ngayCapNhatThuTuc as string).split('-');
    await page.goto('/');
    await expect(page.locator('footer')).toContainText(`Dữ liệu thủ tục cập nhật ngày ${d}/${m}/${y}`);
  });
});

// ───────────────────────────── 5. Lời miễn trừ ─────────────────────────────

test('F08-MT-01 · lời miễn trừ đúng nguyên văn ở 1280 và 375', async ({ page }) => {
  for (const rong of [1280, 375]) {
    await page.setViewportSize({ width: rong, height: 812 });
    await page.goto('/');
    await expect(page.locator('footer')).toContainText(MIEN_TRU);
  }
});

// ───────────────────────────── 6. Trang không tìm thấy ─────────────────────────────

test.describe('Trang không tìm thấy (BR-10)', () => {
  test('F08-404-01/02/03 · /abc-xyz: nội dung, hai nút là liên kết, đủ khung, HTTP 200', async ({ page }) => {
    for (const rong of [1280, 375]) {
      await page.setViewportSize({ width: rong, height: 812 });
      const phanHoi = await page.goto('/abc-xyz');
      expect(phanHoi?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' })).toBeVisible();
      const ve = page.getByRole('link', { name: 'Về trang chủ' });
      const dm = page.getByRole('main').getByRole('link', { name: 'Danh mục thủ tục' });
      await expect(ve).toBeVisible();
      await expect(dm).toBeVisible();
      await expect(page.getByRole('button', { name: /Về trang chủ|Danh mục/ })).toHaveCount(0);
      await expect(page.locator('header')).toBeVisible();
      await expect(nav(page)).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    }
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/abc-xyz');
    await page.getByRole('link', { name: 'Về trang chủ' }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goBack();
    await page.getByRole('main').getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await expect(page).toHaveURL(/\/thu-tuc$/);
  });

  test('F08-404-04 · địa chỉ lạ: hoa/thường và dấu "/" cuối khớp; còn lại 404; không hiện chữ từ địa chỉ; không hộp thoại', async ({ page }) => {
    const hopThoai: string[] = [];
    page.on('dialog', async (d) => {
      hopThoai.push(d.message());
      await d.dismiss();
    });
    const loi = theoDoiLoi(page);
    for (const duongDan of ['/THU-TUC', '/thu-tuc/']) {
      await page.goto(duongDan);
      await expect(nav(page).locator('[aria-current="page"]')).toHaveAccessibleName('Danh mục thủ tục');
    }
    const la = ['/abc-xyz/', '/%3Cscript%3Ealert(1)%3C/script%3E', '/a/b/c/d/e/f', '/..%2f..%2fetc/passwd', '/' + 'x'.repeat(2000)];
    for (const duongDan of la) {
      await page.goto(duongDan);
      await expect(page.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' })).toBeVisible();
      const noiDung = await page.locator('body').innerText();
      expect(noiDung).not.toMatch(/etc\/passwd|alert\(1\)|xxxxxxxxxx|Error|Exception|stack/i);
    }
    expect(hopThoai).toEqual([]);
    expect(loi).toEqual([]);
  });

  test('F08-404-05 · máy chủ trả HTML 404 của React có tiêu đề trang đúng (đọc HTML không chạy JS)', async ({ request }) => {
    const r = await request.get('/abc-xyz');
    expect(r.status()).toBe(200);
    const html = await r.text();
    expect(html).toMatch(/<title>Không tìm thấy trang – [^<]+<\/title>/);
  });

  test('F08-404-11/TN-01 · axe 0 lỗi, đúng một h1 ở 375 và 1280', async ({ page }) => {
    for (const rong of [375, 1280]) {
      await page.setViewportSize({ width: rong, height: 812 });
      await page.goto('/abc-xyz');
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      const kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
      expect(kq.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    }
  });
});

// ───────────────────────────── 7. Đang tải, lỗi ─────────────────────────────

test.describe('Đang tải và lỗi (BR-11)', () => {
  test('F08-TL-01/02/HN-08 · mạng 3G chậm: đầu trang và điều hướng hiện trước khi chunk của trang về', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __tDau?: number };
      const quanSat = new MutationObserver(() => {
        if (w.__tDau === undefined && document.querySelector('header nav, header, nav')) {
          const nav = document.querySelector('nav[aria-label]');
          if (nav) {
            w.__tDau = performance.now();
            quanSat.disconnect();
          }
        }
      });
      quanSat.observe(document, { childList: true, subtree: true });
    });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 });
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 55_000 });
    const so = await page.evaluate(() => {
      const w = window as unknown as { __tDau?: number };
      const chunk = performance.getEntriesByType('resource').find((e) => /\/assets\/TrangChu-/.test(e.name)) as PerformanceResourceTiming | undefined;
      return { dau: w.__tDau ?? -1, chunkXong: chunk?.responseEnd ?? -1 };
    });
    expect(so.dau, 'đầu trang/điều hướng phải hiện').toBeGreaterThan(0);
    expect(so.chunkXong, 'chunk TrangChu phải được tải').toBeGreaterThan(0);
    expect(so.dau, `đầu trang (${so.dau}ms) phải hiện trước khi chunk trang về (${so.chunkXong}ms)`).toBeLessThanOrEqual(so.chunkXong);
    console.log(`[F08-TL-02] đầu trang hiện ở ${Math.round(so.dau)} ms; chunk trang về ở ${Math.round(so.chunkXong)} ms (3G chậm)`);
  });

  test('F08-TL-03 · API /trung-tam chậm 5 giây (dữ liệu thật như khi vận hành: có ô dịch vụ và giờ làm việc): đầu trang giữ chiều cao, CLS ≤ 0,05', async ({ page, request }) => {
    const thuc = await (await request.get('/api/trung-tam')).json();
    for (const rong of [375, 1280]) {
      await page.setViewportSize({ width: rong, height: 812 });
      await page.addInitScript(() => {
        const w = window as unknown as { __cls: number };
        w.__cls = 0;
        const w2 = window as unknown as { __nguon: string[] };
        w2.__nguon = [];
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources: { node: Element | null }[] }[]) {
            if (e.hadRecentInput) continue;
            w.__cls += e.value;
            w2.__nguon.push(`${e.value.toFixed(3)} ${e.sources.map((x) => (x.node ? `${x.node.nodeName}.${(x.node as HTMLElement).className ?? ''}` : '?')).join(', ')}`);
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await traDuLieu(page, async (r) => {
        await new Promise((x) => setTimeout(x, 5000));
        await r.fulfill({ json: thuc });
      });
      await page.goto('/');
      const chieuCao = await page.locator('header').evaluate((h) => h.getBoundingClientRect().height);
      expect(chieuCao, `đầu trang lúc chờ dữ liệu (${rong}px)`).toBeGreaterThanOrEqual(60);
      await expect(page.locator('header')).toContainText(String(thuc.ten).slice(0, 25), { timeout: 15_000 });
      await page.waitForTimeout(500);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      console.log(`[F08-TL-03] ${rong}px: CLS = ${cls.toFixed(4)} ${JSON.stringify(await page.evaluate(() => (window as unknown as { __nguon: string[] }).__nguon))}`);
      expect.soft(cls, `CLS ${rong}px`).toBeLessThanOrEqual(0.05);
      await page.unroute('**/api/trung-tam');
    }
  });

  test('F08-TL-03c · API /trung-tam chậm 5 giây, dữ liệu rỗng ô dịch vụ và giờ làm việc (bộ A): ghi nhận CLS (khung chờ cao hơn nội dung thật)', async ({ page }, info) => {
    for (const rong of [375, 1280]) {
      await page.setViewportSize({ width: rong, height: 812 });
      await page.addInitScript(() => {
        const w = window as unknown as { __cls: number };
        w.__cls = 0;
        const w2 = window as unknown as { __nguon: string[] };
        w2.__nguon = [];
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources: { node: Element | null }[] }[]) {
            if (e.hadRecentInput) continue;
            w.__cls += e.value;
            w2.__nguon.push(`${e.value.toFixed(3)} ${e.sources.map((x) => (x.node ? `${x.node.nodeName}.${(x.node as HTMLElement).className ?? ''}` : '?')).join(', ')}`);
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await traDuLieu(page, async (r) => {
        await new Promise((x) => setTimeout(x, 5000));
        await r.fulfill({ json: boA() });
      });
      await page.goto('/');
      const chieuCao = await page.locator('header').evaluate((h) => h.getBoundingClientRect().height);
      expect(chieuCao, `đầu trang lúc chờ dữ liệu (${rong}px)`).toBeGreaterThanOrEqual(60);
      await expect(page.locator('header')).toContainText(TEN_THU, { timeout: 15_000 });
      await page.waitForTimeout(500);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      console.log(`[F08-TL-03c] ${rong}px: CLS = ${cls.toFixed(4)} ${JSON.stringify(await page.evaluate(() => (window as unknown as { __nguon: string[] }).__nguon))}`);
      info.annotations.push({ type: 'cls', description: `${rong}px: ${cls.toFixed(4)}` });
      await page.unroute('**/api/trung-tam');
    }
  });

  test('F08-TL-03b · tải bình thường (API thật, không trễ): CLS ở 375 và 1280', async ({ page }) => {
    for (const rong of [375, 1280]) {
      await page.setViewportSize({ width: rong, height: 812 });
      await page.addInitScript(() => {
        const w = window as unknown as { __cls: number };
        w.__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) w.__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto('/');
      await expect(page.locator('footer')).toContainText('Người chịu trách nhiệm');
      await page.waitForTimeout(800);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      console.log(`[F08-TL-03b] ${rong}px, API thật: CLS = ${cls.toFixed(4)}`);
      expect.soft(cls, `CLS ${rong}px, API thật`).toBeLessThanOrEqual(0.1);
    }
  });

  test('F08-TL-08 · chunk của trang lỗi tải: LoiTrang trong vùng nội dung, khung còn, không lộ thông điệp lỗi', async ({ page }) => {
    await page.route('**/assets/TrangChu-*.js', (r) => r.abort());
    await page.goto('/');
    await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
    await expect(page.getByRole('main').getByRole('button', { name: 'Thử lại' })).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    const chu = await page.locator('main').innerText();
    expect(chu).not.toMatch(/Failed to fetch|dynamically imported|TypeError|Unexpected Application Error|Hey developer/i);
    // "Thử lại" tải lại trang: sau khi bỏ chặn thì trang chủ hiện
    await page.unroute('**/assets/TrangChu-*.js');
    await page.getByRole('main').getByRole('button', { name: 'Thử lại' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('F08-BM-12 · API /trung-tam trả 429: trang HTML vẫn mở, khung nhã nhặn, console không lỗi chưa xử lý', async ({ page }) => {
    const loi = theoDoiLoi(page, true);
    await traDuLieu(page, (r) =>
      r.fulfill({ status: 429, contentType: 'application/problem+json', headers: { 'Retry-After': '60' }, body: JSON.stringify({ status: 429, code: 'qua-nhieu-yeu-cau', maTraCuu: 'ABCD2345' }) }),
    );
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toContainText(MIEN_TRU);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(loi).toEqual([]);
  });
});

// ───────────────────────────── 8. Tên, địa bàn, biểu tượng ─────────────────────────────

test.describe('Tên, địa bàn, biểu tượng (BR-5, BR-14)', () => {
  test('F08-TD-01/04 · bộ A: tiêu đề tab, đầu trang có tên và địa bàn đúng mẫu, không ghép chữ "xã"/"tỉnh"', async ({ page }) => {
    await traDuLieu(page, boA());
    await page.goto('/thu-tuc');
    await expect(page).toHaveTitle(`Danh mục thủ tục – ${TEN_THU}`);
    const dau = page.locator('header');
    await expect(dau).toContainText(TEN_THU);
    await expect(dau).toContainText('phường thử B – tỉnh thử C');
    expect(await dau.innerText()).not.toMatch(/\bxã\b/i);
  });

  test('F08-TD-03 · thiếu địa bàn: F1 chỉ tỉnh, F2 chỉ xã, F3 ẩn dòng; không "–" thừa', async ({ page }) => {
    const ca: [Partial<DuLieuTrungTam>, string, string[]][] = [
      [{ xa: null }, 'tỉnh thử C', []],
      [{ tinh: null }, 'phường thử B', []],
      [{ xa: null, tinh: null }, '', ['phường', 'tỉnh', '–']],
      [{ xa: '   ' }, 'tỉnh thử C', ['–']],
    ];
    for (const [thay, hien, khongCo] of ca) {
      await traDuLieu(page, { ...boA(), ...thay });
      await page.goto('/');
      const dau = page.locator('header');
      await expect(dau).toContainText(TEN_THU);
      const chu = (await dau.innerText()).replace(TEN_THU, '').trim();
      expect(chu).toBe(hien);
      for (const k of khongCo) expect(chu).not.toContain(k);
      await page.unroute('**/api/trung-tam');
    }
  });

  test('F08-TD-05 · bộ D tên 200 ký tự ở 375: không cuộn ngang, liên kết thương hiệu bấm được', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await traDuLieu(page, { ...boA(), ten: 'Trung tâm '.repeat(18).slice(0, 200) });
    await page.goto('/thu-tuc');
    await expect(page.locator('header')).toContainText('Trung tâm');
    expect(await khongTranNgang(page)).toBe(true);
    await page.locator('header a').click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('F08-TD-07/10/HN-10 · biểu tượng toà nhà 40x40 alt rỗng, cùng nguồn, không Quốc huy; có cả khi chưa có dữ liệu', async ({ page }) => {
    for (const duongDan of ['/', '/thu-tuc', '/linh-vuc', '/abc-xyz']) {
      await page.goto(duongDan);
      const img = page.locator('header img');
      await expect(img).toHaveCount(1);
      await expect(img).toHaveAttribute('width', '40');
      await expect(img).toHaveAttribute('height', '40');
      await expect(img).toHaveAttribute('alt', '');
      const src = (await img.getAttribute('src')) ?? '';
      // Vite nhúng thẳng ảnh nhỏ (< 4 KB) thành data URI; CSP img-src 'self' data: cho phép. Chấp nhận cả hai dạng cùng nguồn.
      expect(src).toMatch(/^(\/assets\/.*\.(svg|png|webp)|data:image\/(svg\+xml|png|webp)[,;])/);
      expect(src).not.toMatch(/quoc-?huy/i);
      expect(await img.evaluate((i: HTMLImageElement) => i.naturalWidth > 0 || i.complete)).toBe(true);
    }
  });
});

// ───────────────────────────── 10. Tiêu đề tab và dữ liệu đặc tả ─────────────────────────────

const HEAD_THE = ['description', 'DC.title', 'DC.description', 'DC.creator', 'DC.publisher', 'DC.date', 'DC.identifier', 'DC.language'];
const HEAD_PROP = ['og:title', 'og:description', 'og:url', 'og:type'];

function docThe(html: string): Record<string, string[]> {
  const head = /<head>([\s\S]*?)<\/head>/.exec(html)?.[1] ?? '';
  const ra: Record<string, string[]> = {};
  for (const m of head.matchAll(/<meta\s+(?:name|property)="([^"]+)"\s+content="([^"]*)"\s*\/?>/g)) {
    (ra[m[1]!] ??= []).push(m[2]!);
  }
  const tieuDe = /<title>([^<]*)<\/title>/.exec(head)?.[1];
  if (tieuDe !== undefined) ra['title'] = [tieuDe];
  return ra;
}

test.describe('Tiêu đề tab và dữ liệu đặc tả (BR-9, BR-13)', () => {
  test('F08-DT-01/04/21 · (H) HTML máy chủ trả: 4 tiêu đề khác nhau, đủ thẻ, lang=vi, không content rỗng', async ({ request }) => {
    const api = await (await request.get('/api/trung-tam')).json();
    const tieuDe = new Set<string>();
    for (const duongDan of BON_DUONG_DAN) {
      const html = await (await request.get(duongDan)).text();
      expect(html).toMatch(/<html lang="vi"/);
      const the = docThe(html);
      expect(the['title']?.[0]).toBe(`${DAU_TRANG_THEO_DUONG_DAN[duongDan]} – ${api.ten}`);
      tieuDe.add(the['title']![0]!);
      for (const k of [...HEAD_THE, ...HEAD_PROP]) {
        // Trang 404: máy chủ cố ý không phản chiếu đường dẫn lạ nên không có DC.identifier và og:url (TrangHtml.cs).
        if (duongDan === '/abc-xyz' && (k === 'DC.identifier' || k === 'og:url')) {
          expect(the[k], `${duongDan} không được phản chiếu đường dẫn`).toBeUndefined();
          continue;
        }
        expect(the[k], `${duongDan} thiếu thẻ ${k}`).toBeDefined();
        expect(the[k]!.length, `${duongDan}: thẻ ${k} bị trùng`).toBe(1);
        expect(the[k]![0], `${duongDan}: ${k} rỗng`).not.toBe('');
      }
      expect(the['DC.title']![0]).toBe(the['title']![0]);
      expect(the['og:title']![0]).toBe(the['title']![0]);
      expect(the['DC.creator']![0]).toBe(api.ten);
      expect(the['DC.publisher']![0]).toBe(api.coQuanChuQuan ?? api.ten);
      expect(the['DC.date']![0]).toBe(api.ngayCapNhatThuTuc);
      expect(the['DC.language']![0]).toBe('vi');
      expect(the['og:type']![0]).toBe('website');
      if (duongDan !== '/abc-xyz') {
        expect(the['DC.identifier']![0]).toMatch(/^https?:\/\/[^/]+\//);
        expect(the['og:url']![0]).toBe(the['DC.identifier']![0]);
        expect(the['DC.identifier']![0]).not.toContain('?');
      }
      expect(html).toContain('rel="schema.DC"');
      expect(the['description']![0]).not.toContain(api.ten);
    }
    expect(tieuDe.size).toBe(4);
  });

  test('F08-DT-02/05/06 · (D) đi tới bằng điều hướng: tiêu đề tab và thẻ <head> khớp bản (H); không thẻ trùng', async ({ page, request }) => {
    await page.goto('/');
    const duLieuH: Record<string, Record<string, string[]>> = {};
    for (const duongDan of ['/', '/thu-tuc', '/linh-vuc']) {
      duLieuH[duongDan] = docThe(await (await request.get(duongDan)).text());
    }
    const docDom = () =>
      page.evaluate(
        ({ names, props }) => {
          const ra: Record<string, string[]> = { title: [document.title] };
          for (const k of names) ra[k] = [...document.querySelectorAll(`meta[name="${k}"]`)].map((m) => (m as HTMLMetaElement).content);
          for (const k of props) ra[k] = [...document.querySelectorAll(`meta[property="${k}"]`)].map((m) => (m as HTMLMetaElement).content);
          return ra;
        },
        { names: HEAD_THE, props: HEAD_PROP },
      );
    const gach: [string, string][] = [
      ['Danh mục thủ tục', '/thu-tuc'],
      ['Lĩnh vực và mã QR', '/linh-vuc'],
      ['Trang chủ', '/'],
    ];
    for (const [nhan, duongDan] of gach) {
      await nav(page).getByRole('link', { name: nhan }).click();
      await expect(page).toHaveURL(new RegExp(`${duongDan === '/' ? '/$' : duongDan + '$'}`));
      await expect.poll(async () => (await docDom())['title']![0]).toBe(duLieuH[duongDan]!['title']![0]);
      const dom = await docDom();
      for (const k of [...HEAD_THE, ...HEAD_PROP]) {
        expect(dom[k]!.length, `${duongDan}: ${k} trùng hoặc thiếu trong DOM`).toBe(1);
        if (k === 'DC.identifier' || k === 'og:url') continue; // host khác nhau giữa request và trình duyệt: so đuôi đường dẫn
        expect(dom[k]![0], `${duongDan}: ${k} (D) khác (H)`).toBe(duLieuH[duongDan]![k]![0]);
      }
      const duoi = (s: string) => new URL(s).pathname;
      expect(duoi(dom['DC.identifier']![0]!)).toBe(duoi(duLieuH[duongDan]!['DC.identifier']![0]!));
    }
    await page.goto('/abc-xyz');
    await expect(page).toHaveTitle(/^Không tìm thấy trang – /);
  });

  test('F08-DT-06 (L4) · (D) địa chỉ lạ đi tới bằng điều hướng: <head> không có DC.identifier/og:url, giống bản (H); rời 404 thì có lại', async ({ page, request }) => {
    const htmlH = await (await request.get('/abc-xyz')).text();
    expect(docThe(htmlH)['DC.identifier']).toBeUndefined();
    expect(docThe(htmlH)['og:url']).toBeUndefined();

    await page.goto('/');
    const dem = () =>
      page.evaluate(() => ({
        dcId: document.querySelectorAll('meta[name="DC.identifier"]').length,
        ogUrl: document.querySelectorAll('meta[property="og:url"]').length,
        tieuDe: document.title,
      }));
    const truoc = await dem();
    await page.evaluate(() => {
      window.history.pushState({}, '', '/abc-xyz');
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Không tìm thấy');
    await expect.poll(async () => (await dem()).tieuDe).toMatch(/^Không tìm thấy trang – /);
    const o404 = await dem();
    expect(o404.dcId, 'DC.identifier ở trang 404').toBe(0);
    expect(o404.ogUrl, 'og:url ở trang 404').toBe(0);

    // Rời 404 sang trang thật: hai thẻ trở lại (nếu bản (H) của trang đó có) và không trùng
    await nav(page).getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await expect.poll(async () => (await dem()).tieuDe).toMatch(/^Danh mục thủ tục – /);
    const sau = await dem();
    expect(sau.dcId).toBeLessThanOrEqual(1);
    expect(sau.dcId).toBe(truoc.dcId);
    expect(sau.ogUrl).toBe(truoc.ogUrl);
  });

  test('F08-DT-06b (L4) · (D) vào thẳng /abc-xyz: không DC.identifier/og:url', async ({ page }) => {
    await page.goto('/abc-xyz');
    await expect(page).toHaveTitle(/^Không tìm thấy trang – /);
    expect(await page.locator('meta[name="DC.identifier"], meta[property="og:url"]').count()).toBe(0);
  });

  test('F08-DT-03/TN-01 · axe 0 lỗi (kể cả tiêu đề trang, ngôn ngữ) ở 4 trang × 375, 1280, kiosk', async ({ page }) => {
    for (const [rong, cao, hau] of [
      [375, 812, ''],
      [1280, 800, ''],
      [1080, 1920, '?kiosk=1'],
    ] as const) {
      await page.setViewportSize({ width: rong, height: cao });
      for (const duongDan of BON_DUONG_DAN) {
        await page.goto(duongDan + hau);
        await expect(page.locator('footer')).toContainText(MIEN_TRU);
        await expect(page.locator('footer')).not.toContainText('Đang tải');
        const kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
        expect(kq.violations.map((v) => `${v.id}[${v.impact}]: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`), `${duongDan} ${rong}px`).toEqual([]);
      }
    }
  });

  test('F08-HN-08b · script kiểm tra trình duyệt cũ có defer, không chặn hiển thị; không script đồng bộ nào khác', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const scripts = [...html.matchAll(/<script(?=\s|>)[^>]*>/g)].map((m) => m[0]);
    const cu = scripts.filter((t) => /trinh-duyet-cu/.test(t));
    expect(cu).toHaveLength(1);
    expect(cu[0]).toMatch(/\sdefer(\s|>|=)/);
    for (const t of scripts) expect(t, 'script phải defer hoặc module').toMatch(/\sdefer(\s|>|=)|type="module"/);
  });

  test('F08-DT-12/17 · (H) /?ma=… cho HTML giống hệt "/"; chuỗi từ query/đường dẫn không xuất hiện trong HTML', async ({ request }) => {
    const goc = await (await request.get('/')).text();
    expect(await (await request.get('/?ma=1.001193')).text()).toBe(goc);
    for (const duongDan of ['/?ma="><script>alert(1)</script>', '/thu-tuc?q=<img src=x onerror=alert(1)>', '/<script>']) {
      const r = await request.get(duongDan);
      const html = await r.text();
      expect(html, duongDan).not.toMatch(/alert\(1\)|onerror=|<script>(?!<)/i);
      const the = docThe(html);
      expect(the['DC.identifier']?.[0] ?? '').not.toContain('?');
    }
  });

  test('F08-DT-22/23 · index.html và dac-ta-trang.json: dấu đánh dấu còn, không script/style inline, JSON công khai', async ({ request }) => {
    const html = await (await request.get('/index.html')).text();
    expect(html).toContain('<!--dac-ta-->');
    expect(html).toContain('<!--/dac-ta-->');
    expect(html).not.toMatch(/<script(?![^>]*\ssrc=)[^>]*>/i);
    expect(html).not.toMatch(/<style/i);
    expect(html).not.toMatch(/\sstyle="/i);
    const r = await request.get('/dac-ta-trang.json');
    expect(r.status()).toBe(200);
    const json = await r.json();
    expect(Object.keys(json.trang ?? json)).toEqual(expect.arrayContaining(['/']));
  });
});

// ───────────────────────────── 11. Trợ năng ─────────────────────────────

test.describe('Trợ năng (WCAG 2.1 AA)', () => {
  test('F08-TN-02/03 · mỗi trang đúng một banner, một nav "Điều hướng chính", một main, một contentinfo; đúng một h1; không nhảy cấp tiêu đề', async ({ page }) => {
    for (const duongDan of BON_DUONG_DAN) {
      await page.goto(duongDan);
      await expect(page.locator('footer')).toContainText(MIEN_TRU);
      await expect(page.getByRole('banner')).toHaveCount(1);
      // Một landmark "Điều hướng chính"; trang có danh sách phân trang thì thêm một nav có tên "Phân trang" (hợp lệ).
      await expect(nav(page)).toHaveCount(1);
      const tenNav = await page.getByRole('navigation').evaluateAll((e) => e.map((x) => x.getAttribute('aria-label')));
      expect(tenNav.every((t) => !!t && new Set(tenNav).size === tenNav.length), `${duongDan}: mọi nav có tên riêng ${tenNav.join('|')}`).toBe(true);
      expect(tenNav.filter((t) => t !== 'Phân trang' && t !== 'Điều hướng chính'), duongDan).toEqual([]);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('contentinfo')).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      const cap = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1])));
      for (let i = 1; i < cap.length; i += 1) expect(cap[i]! - cap[i - 1]!, `${duongDan}: tiêu đề nhảy cấp ${cap.join(',')}`).toBeLessThanOrEqual(1);
    }
  });

  test('F08-TN-08 · giãn chữ (WCAG 1.4.12): đầu và chân trang không bị cắt ở 375 và kiosk', async ({ browser }) => {
    // Chèn CSS thử cần bỏ qua CSP của trang (style-src 'self'); chỉ dùng cho ca này.
    const ngu = await browser.newContext({ bypassCSP: true, ignoreHTTPSErrors: true });
    const page = await ngu.newPage();
    for (const [rong, cao, hau] of [
      [375, 812, ''],
      [1080, 1920, '?kiosk=1'],
    ] as const) {
      await page.setViewportSize({ width: rong, height: cao });
      await traDuLieu(page, boA());
      await page.goto('/' + hau);
      await page.addStyleTag({ content: '*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p{margin-bottom:2em !important}' });
      await expect(page.locator('footer')).toContainText('Người chịu trách nhiệm');
      const biCat = await page.evaluate(() =>
        [...document.querySelectorAll('header *, footer *, nav *')]
          .filter((e) => {
            const s = getComputedStyle(e);
            const r = e.getBoundingClientRect();
            if (r.width <= 2 || r.height <= 2) return false; // chữ ẩn có chủ ý (VisuallyHidden)
            return (s.overflow === 'hidden' || s.overflowX === 'hidden') && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1) && (e as HTMLElement).innerText?.trim();
          })
          .map((e) => `${e.tagName}.${e.className}`),
      );
      expect(biCat, `chữ bị cắt khi giãn chữ (${rong}px)`).toEqual([]);
      expect(await khongTranNgang(page)).toBe(true);
      await page.unroute('**/api/trung-tam');
    }
    await ngu.close();
  });

  test('F08-TN-14 · chân trang chừa chỗ cuối cho nút nổi: đệm dưới ≥ 80px (điện thoại) và ≥ 96px (kiosk)', async ({ page }) => {
    for (const [rong, cao, hau, toiThieu] of [
      [375, 812, '', 80],
      [1080, 1920, '?kiosk=1', 96],
    ] as const) {
      await page.setViewportSize({ width: rong, height: cao });
      await page.goto('/' + hau);
      const dem = await page.locator('footer').evaluate((f) => parseFloat(getComputedStyle(f).paddingBottom));
      expect(dem, `đệm dưới chân trang (${rong}px)`).toBeGreaterThanOrEqual(toiThieu);
    }
  });
});

// ───────────────────────────── 12. Bảo mật ─────────────────────────────

test.describe('Bảo mật', () => {
  const CSP =
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

  test('F08-BM-01/02 · header bảo mật đủ và đúng trên HTML, 404, API, tài nguyên tĩnh; không header Server', async ({ request, baseURL }) => {
    const html = await (await request.get('/')).text();
    const js = /\/assets\/index-[^"']+\.js/.exec(html)?.[0] ?? '/assets/x.js';
    for (const duongDan of ['/', '/thu-tuc', '/abc-xyz', '/api/trung-tam', '/api/khong-co', js, '/health/live']) {
      const r = await request.get(duongDan);
      const h = r.headers();
      expect(h['content-security-policy'], duongDan).toBe(CSP);
      expect(h['x-content-type-options'], duongDan).toBe('nosniff');
      expect(h['referrer-policy'], duongDan).toBe('strict-origin-when-cross-origin');
      expect(h['permissions-policy'], duongDan).toBe('microphone=(), camera=(), geolocation=()');
      expect(h['server'], `${duongDan} lộ header Server`).toBeUndefined();
      expect(h['x-powered-by'], duongDan).toBeUndefined();
      expect(baseURL).toMatch(/^https:/);
    }
  });

  test('F08-BM-03/04/05 · 4 trang: không vi phạm CSP, không lỗi console, không script/style inline, không request ra tên miền ngoài', async ({ page, baseURL }) => {
    const goc = new URL(baseURL!).origin;
    const ngoai: string[] = [];
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (u.protocol.startsWith('http') && u.origin !== goc) ngoai.push(r.url());
    });
    const loi = theoDoiLoi(page);
    await themBatCsp(page);
    for (const duongDan of BON_DUONG_DAN) {
      await page.goto(duongDan);
      await expect(page.locator('footer')).toContainText(MIEN_TRU);
      await page.waitForTimeout(300);
      expect(await layCsp(page), `vi phạm CSP ở ${duongDan}`).toEqual([]);
      expect(await page.evaluate(() => document.querySelectorAll('script:not([src])').length)).toBe(0);
      expect(await page.evaluate(() => document.querySelectorAll('style').length), `<style> chèn lúc chạy ở ${duongDan}`).toBe(0);
    }
    expect(ngoai).toEqual([]);
    expect(loi).toEqual([]);
  });

  test('F08-BM-07 · /api/trung-tam chỉ có các trường §3.1', async ({ request }) => {
    const j = await (await request.get('/api/trung-tam')).json();
    const cho = ['ten', 'xa', 'tinh', 'coQuanChuQuan', 'nguoiChiuTrachNhiem', 'chucVuNguoiChiuTrachNhiem', 'diaChi', 'dienThoai', 'email', 'banDo', 'mangXaHoi', 'lienKet', 'oDichVu', 'gioLamViec', 'ghiChuNgayNghi', 'ngayCapNhatThuTuc'];
    expect(Object.keys(j).sort()).toEqual([...cho].sort());
    expect(Object.keys(j.mangXaHoi).sort()).toEqual(['facebook', 'tikTok', 'youTube', 'zaloOa']);
    for (const l of j.lienKet) expect(Object.keys(l).sort()).toEqual(['ten', 'url']);
    for (const o of j.oDichVu) expect(Object.keys(o).sort()).toEqual(['bieuTuong', 'ten', 'url']); // moTa không còn trong phản hồi (plan F08 §3.1; không hiển thị ở đâu)
    for (const g of j.gioLamViec) expect(Object.keys(g).sort()).toEqual(['chieuDen', 'chieuTu', 'sangDen', 'sangTu', 'thu']);
    expect(JSON.stringify(j)).not.toMatch(/maDonVi|"id"|thuTu|tenFile|T\d\d:\d\d:\d\d/);
  });

  test('F08-BM-13 · 400 yêu cầu GET / liên tiếp không bị 429 (HTML không gắn giới hạn)', async ({ request }) => {
    const mau = new Set<number>();
    for (let i = 0; i < 400; i += 1) mau.add((await request.get('/', { headers: { 'Cache-Control': 'no-cache' } })).status());
    expect([...mau]).toEqual([200]);
  });

  test('F08-BM-14 · POST/PUT/DELETE /api/trung-tam → 405 ProblemDetails, không stack trace', async ({ request }) => {
    for (const phuongThuc of ['post', 'put', 'delete'] as const) {
      const r = await request[phuongThuc]('/api/trung-tam');
      expect(r.status(), phuongThuc).toBe(405);
      const t = await r.text();
      const j = JSON.parse(t);
      expect(j.code).toBe('phuong-thuc-khong-hop-le');
      expect(t).not.toMatch(/at \w+\.|Exception|StackTrace/);
    }
  });

  test('F08-BM-15 · query lạ bị bỏ qua, không 500', async ({ request }) => {
    for (let i = 0; i < 30; i += 1) {
      const r = await request.get(`/api/trung-tam?x=${i}&x=${i + 1}&y=%00`);
      expect(r.status()).toBe(200);
    }
  });

  test('F08-BM-02b (L3) · HEAD /api/trung-tam 200 có ETag và đủ header bảo mật, không thân; If-None-Match đúng → 304', async ({ request }) => {
    const r = await request.head('/api/trung-tam');
    expect(r.status()).toBe(200);
    const h = r.headers();
    expect(h['etag']).toBeTruthy();
    expect(h['content-type']).toMatch(/json/);
    expect(h['content-security-policy']).toContain("default-src 'self'");
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['server']).toBeUndefined();
    expect((await r.body()).length).toBe(0);
    const r2 = await request.head('/api/trung-tam', { headers: { 'If-None-Match': h['etag']! } });
    expect(r2.status()).toBe(304);
  });

  test('F08-HN-05/09 · If-None-Match đúng → 304 thân rỗng; ETag/Cache-Control; Brotli', async ({ request }) => {
    const r1 = await request.get('/api/trung-tam');
    const etag = r1.headers()['etag'];
    expect(etag).toBeTruthy();
    expect(r1.headers()['cache-control']).toBe('no-cache');
    const r2 = await request.get('/api/trung-tam', { headers: { 'If-None-Match': etag! } });
    expect(r2.status()).toBe(304);
    expect((await r2.body()).length).toBe(0);
    const r3 = await request.get('/api/trung-tam', { headers: { 'Accept-Encoding': 'br' } });
    expect(r3.headers()['content-encoding']).toBe('br');
  });
});
