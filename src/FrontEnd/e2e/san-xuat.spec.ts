import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';
import { chiTietDayDu, chiTietRatDai, traChiTiet } from './du-lieu/thuong-gap';

/**
 * Kiểm bản build PRODUCTION (đã obfuscate) — xem san-xuat.config.ts. Dữ liệu giả, API giả bằng page.route.
 * Mỗi ca ở đây là một lỗi chỉ xảy ra ở bản build:
 *  - thiếu CSS của route nạp lười (obfuscate chạy trước bước điền danh sách CSS của Vite: trang không có style);
 *  - dịch chuyển bố cục (CLS) khi chunk route thay khung chờ;
 *  - bản build lộ mã nguồn (source map) hoặc mã dự án chưa obfuscate.
 */

const TEN_TRUNG_TAM = 'Trung tâm thử A';

const TRUNG_TAM = {
  ten: TEN_TRUNG_TAM,
  xa: 'xã thử B',
  tinh: 'tỉnh thử C',
  coQuanChuQuan: 'Uỷ ban nhân dân xã thử B',
  nguoiChiuTrachNhiem: 'Người thử',
  chucVuNguoiChiuTrachNhiem: 'Giám đốc (dữ liệu thử)',
  diaChi: 'Địa chỉ thử, xã thử B, tỉnh thử C',
  dienThoai: '0000.000.000',
  email: 'thu@example.gov.vn',
  banDo: 'https://maps.example.test/thu',
  mangXaHoi: { zaloOa: 'https://zalo.example.test/thu', facebook: null, youTube: null, tikTok: null },
  lienKet: [
    { ten: 'Cổng Dịch vụ công Quốc gia', url: 'https://dvc.example.test' },
    { ten: 'Cổng thông tin điện tử tỉnh thử C', url: 'https://tinh.example.test' },
  ],
  // Tên và việc có/không có liên kết theo lien-ket.md §1 (2 ô chưa có link, 4 ô ra ngoài): chiều cao ô gần với dữ liệu thật
  oDichVu: [
    { ten: 'Bốc số thứ tự / Đặt lịch hẹn', bieuTuong: 'boc-so', url: null },
    { ten: 'Đánh giá hài lòng', bieuTuong: 'danh-gia', url: null },
    { ten: 'Tra cứu hồ sơ', bieuTuong: 'tra-cuu-ho-so', url: 'https://dichvucong.gov.vn/tra-cuu-ho-so' },
    { ten: 'Thanh toán trực tuyến', bieuTuong: 'thanh-toan', url: 'https://dichvucong.gov.vn/thanh-toan-truc-tuyen' },
    { ten: 'Cổng Dịch vụ công Quốc gia', bieuTuong: 'cong-dvc', url: 'https://dichvucong.gov.vn/thu-tuc-hanh-chinh' },
    { ten: 'Cổng thông tin điện tử xã Cần Giuộc', bieuTuong: 'cong-thong-tin', url: 'https://cangiuoc.tayninh.gov.vn' },
  ],
  gioLamViec: [1, 2, 3, 4, 5].map((thu) => ({ thu, sangTu: '07:30', sangDen: '11:30', chieuTu: '13:30', chieuDen: '17:00' })),
  ghiChuNgayNghi: 'Nghỉ thứ Bảy, Chủ nhật và các ngày lễ theo quy định.',
  ngayCapNhatThuTuc: '2026-10-08',
};

const LINH_VUC = [
  { ma: 'ho-tich', ten: 'Hộ tịch', tenTimKiem: 'ho tich', soThuTucXa: 12, soThuTucTinh: 0 },
  { ma: 'dat-dai', ten: 'Đất đai', tenTimKiem: 'dat dai', soThuTucXa: 8, soThuTucTinh: 4 },
  { ma: 'thuy-loi', ten: 'Thuỷ lợi', tenTimKiem: 'thuy loi', soThuTucXa: 0, soThuTucTinh: 3 },
];

const THU_TUC = Array.from({ length: 24 }, (_, i) => ({
  ma: `1.${String(i + 1).padStart(6, '0')}`,
  ten: `Thủ tục thử số ${i + 1} về giải quyết hồ sơ của công dân`,
  tenTimKiem: `thu tuc thu so ${i + 1} ve giai quyet ho so cua cong dan`,
  linhVucMa: LINH_VUC[i % 3]!.ma,
  mucDo: i % 2 === 0 ? 'toan-trinh' : 'mot-phan',
  capXa: i % 3 !== 2,
  capTinh: i % 3 !== 0,
  thuTuThuongGap: i < 16 ? i + 1 : null,
  thoiHan: '3 ngày làm việc',
  coQuanThucHien: 'Uỷ ban nhân dân xã thử B',
}));

/** Giả ba API của trang chủ; `doTre` ms là độ trễ trước khi trả lời (0 = tức thì). */
async function giaApi(page: Page, doTre = 0) {
  const tra = (duLieu: unknown) => async (route: Route) => {
    if (doTre > 0) await new Promise((r) => setTimeout(r, doTre));
    await route.fulfill({ json: duLieu });
  };
  await page.route('**/api/trung-tam', tra(TRUNG_TAM));
  await page.route('**/api/thu-tuc', tra(THU_TUC));
  await page.route('**/api/linh-vuc', tra(LINH_VUC));
}

/** Ghi dịch chuyển bố cục (layout-shift) ngay từ đầu trang; cộng dồn mọi lần không do người dùng thao tác (cận trên của CLS). */
async function ghiCls(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    new PerformanceObserver((ds) => {
      for (const d of ds.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!d.hadRecentInput) w.__cls += d.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

const layCls = (page: Page) => page.evaluate(() => (window as unknown as { __cls: number }).__cls);

test.describe('CSS của route nạp lười có trong bản build', () => {
  test('/ gửi yêu cầu tới CSS của route trang chủ và banner có nền gradient', async ({ page }) => {
    await giaApi(page);
    const cssRoute: { url: string; status: number }[] = [];
    page.on('response', (r) => {
      if (/\/assets\/TrangChu-[\w-]+\.css$/.test(r.url())) cssRoute.push({ url: r.url(), status: r.status() });
    });

    await page.goto('/');
    const banner = page.getByRole('heading', { level: 1 }).locator('xpath=..');
    await expect(page.getByRole('heading', { level: 1, name: TEN_TRUNG_TAM })).toBeVisible();

    expect(cssRoute.map((c) => c.status)).toEqual([200]);
    const nen = await banner.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(nen).toContain('linear-gradient');
  });
});

test.describe('CSS của route danh mục có trong bản build', () => {
  test('/thu-tuc gửi yêu cầu tới CSS của route danh mục và ô thống kê có viền trái màu', async ({ page }) => {
    await giaApi(page);
    const cssRoute: { url: string; status: number }[] = [];
    page.on('response', (r) => {
      if (/\/assets\/DanhMuc-[\w-]+\.css$/.test(r.url())) cssRoute.push({ url: r.url(), status: r.status() });
    });

    await page.goto('/thu-tuc');
    await expect(page.getByText('Thủ tục thử số 1 về giải quyết hồ sơ của công dân').first()).toBeVisible();

    expect(cssRoute.map((c) => c.status)).toEqual([200]);
    // ô thống kê của ThongKe.module.css: viền trái 4 px
    const vienTrai = await page.locator('li:has(> strong)').first().evaluate((el) => getComputedStyle(el).borderLeftWidth);
    expect(vienTrai).toBe('4px');
  });
});

test.describe('Lĩnh vực và mã QR trong bản build (F05)', () => {
  /** Quầy giả: trang lĩnh vực gọi thêm `/api/linh-vuc/quay` (glob `/api/linh-vuc` không khớp đường dẫn con). */
  const giaQuay = (page: Page) => page.route('**/api/linh-vuc/quay', (route) => route.fulfill({ json: [] }));
  const duongDanJs = (page: Page) => {
    const ds = new Set<string>();
    page.on('response', (r) => {
      if (r.url().endsWith('.js')) ds.add(new URL(r.url()).pathname);
    });
    return ds;
  };

  test('/linh-vuc gửi yêu cầu tới CSS của route và vẽ mã QR (svg[data-qr]) cho ô trong màn hình', async ({ page }) => {
    await giaApi(page);
    await giaQuay(page);
    const cssRoute: { url: string; status: number }[] = [];
    page.on('response', (r) => {
      const duongDan = new URL(r.url()).pathname;
      if (duongDan.startsWith('/assets/LinhVuc-') && duongDan.endsWith('.css')) cssRoute.push({ url: r.url(), status: r.status() });
    });

    await page.goto('/linh-vuc');
    await expect(page.getByRole('heading', { level: 1, name: 'Lĩnh vực và mã QR' })).toBeVisible();
    const qr = page.locator('svg[data-qr]').first();
    await expect(qr).toBeVisible({ timeout: 20_000 });
    expect(cssRoute.map((c) => c.status)).toEqual([200]);
    expect(await qr.evaluate((e) => e.querySelectorAll('path').length)).toBe(1);
  });

  test('chunk qr chỉ nạp ở /linh-vuc, không nạp ở / và /thu-tuc; chunk qr không obfuscate', async ({ page, request, baseURL }) => {
    await giaApi(page);
    await giaQuay(page);
    const jsDaNap = duongDanJs(page);
    const chunk = (ten: string) => [...jsDaNap].filter((d) => d.startsWith(`/assets/${ten}-`));
    const coQr = () => [...chunk('qr'), ...chunk('QrLinhVuc')];

    for (const duongDan of ['/', '/thu-tuc']) {
      await page.goto(duongDan);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 });
      await page.waitForTimeout(500);
      expect(coQr(), `${duongDan} không được nạp qr`).toEqual([]);
    }

    await page.goto('/linh-vuc');
    await expect(page.locator('svg[data-qr]').first()).toBeVisible({ timeout: 20_000 });
    const qr = chunk('qr')[0];
    expect(qr, 'chunk qr phải được nạp ở /linh-vuc').toBeTruthy();
    expect(chunk('QrLinhVuc')).toHaveLength(1);
    const ma = await (await request.get(`${baseURL}${qr}`)).text();
    expect(ma, 'thư viện QR không obfuscate').not.toMatch(/_0x[0-9a-f]{4,}/);
  });
});

test.describe('bản build không lộ mã', () => {
  test('không có source map; mã dự án đã obfuscate, thư viện thì không', async ({ page, request, baseURL }) => {
    await giaApi(page);
    const yeuCauMap: string[] = [];
    page.on('request', (r) => {
      if (r.url().endsWith('.map')) yeuCauMap.push(r.url());
    });
    const jsDaNap = new Set<string>();
    page.on('response', (r) => {
      if (r.url().endsWith('.js')) jsDaNap.add(new URL(r.url()).pathname);
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: TEN_TRUNG_TAM })).toBeVisible();
    expect(yeuCauMap).toEqual([]);

    const noiDung = async (khuon: RegExp) => {
      const duongDan = [...jsDaNap].find((d) => khuon.test(d));
      expect(duongDan, `chunk ${khuon}`).toBeTruthy();
      return (await request.get(`${baseURL}${duongDan}`)).text();
    };
    const chinh = await noiDung(/\/assets\/index-[\w-]+\.js$/);
    const trangChu = await noiDung(/\/assets\/TrangChu-[\w-]+\.js$/);
    const vendor = await noiDung(/\/assets\/vendor-[\w-]+\.js$/);
    for (const [ten, ma] of [['index', chinh], ['TrangChu', trangChu]] as const) {
      expect(ma, `${ten} phải được obfuscate`).toMatch(/_0x[0-9a-f]{4,}/);
      expect(ma, `${ten} không được còn source map`).not.toContain('sourceMappingURL');
    }
    expect(vendor, 'vendor (thư viện) không obfuscate').not.toMatch(/_0x[0-9a-f]{6}/);
    expect(vendor).not.toContain('sourceMappingURL');
  });
});

test.describe('CLS của trang chủ (bản build)', () => {
  const khoManHinh = [
    { ten: '375 (điện thoại)', rong: 375, cao: 812, duongDan: '/' },
    { ten: '768 (máy tính bảng)', rong: 768, cao: 1024, duongDan: '/' },
    { ten: '1280 (máy tính)', rong: 1280, cao: 800, duongDan: '/' },
    { ten: '1080x1920 (màn hình dọc, chưa bật kiosk)', rong: 1080, cao: 1920, duongDan: '/' },
    { ten: '1080x1920 (kiosk)', rong: 1080, cao: 1920, duongDan: '/?kiosk=1' },
  ] as const;
  const doTreApi = [
    { ten: 'API tức thì', ms: 0 },
    { ten: 'API trễ 5 giây', ms: 5000 },
  ] as const;

  for (const { ten: tenKho, rong, cao, duongDan } of khoManHinh) {
    for (const { ten: tenTre, ms } of doTreApi) {
      test(`${tenKho} · ${tenTre}: CLS < 0,05`, async ({ page }) => {
        await page.setViewportSize({ width: rong, height: cao });
        await ghiCls(page);
        await giaApi(page, ms);

        await page.goto(duongDan);
        await expect(page.getByRole('heading', { level: 1, name: TEN_TRUNG_TAM })).toBeVisible({ timeout: 20_000 });
        await expect(page.getByRole('heading', { level: 2, name: 'Thủ tục thường gặp' })).toBeVisible();
        await expect(page.getByText('Thủ tục thử số 1 về giải quyết hồ sơ của công dân').first()).toBeVisible({ timeout: 20_000 });
        await page.waitForTimeout(1000); // chờ các dịch chuyển muộn
        // cuộn cuối trang: chân trang hiện ra không được làm trang nhảy thêm
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        const cls = await layCls(page);
        test.info().annotations.push({ type: 'CLS', description: cls.toFixed(4) });
        console.log(`CLS ${tenKho} ${tenTre}: ${cls.toFixed(4)}`);
        expect(cls, `CLS = ${cls}`).toBeLessThan(0.05);
      });
    }
  }
});

test.describe('Trợ năng của popup và ô dịch vụ (bản build)', () => {
  const khoAxe = [
    { ten: '375', rong: 375, cao: 812, duongDan: '/' },
    { ten: '768', rong: 768, cao: 1024, duongDan: '/' },
    { ten: '1280', rong: 1280, cao: 800, duongDan: '/' },
    { ten: '1080x1920 kiosk', rong: 1080, cao: 1920, duongDan: '/?kiosk=1' },
  ] as const;

  for (const { ten, rong, cao, duongDan } of khoAxe) {
    test(`popup thủ tục dài · ${ten}: axe wcag2a/aa 0 vi phạm; thân tràn thì nhận con trỏ bàn phím`, async ({ page }) => {
      await page.setViewportSize({ width: rong, height: cao });
      await giaApi(page);
      await traChiTiet(page, { '9.500005': chiTietRatDai(), '9.500001': chiTietDayDu() });
      const ma = duongDan.includes('kiosk') ? '9.500001' : '9.500005';
      await page.goto(`${duongDan}${duongDan.includes('?') ? '&' : '?'}ma=${ma}`);
      const hop = page.getByRole('dialog');
      await expect(hop).toBeVisible({ timeout: 20_000 });
      await expect(hop.getByRole('heading', { level: 2 })).toBeVisible();
      await page.waitForTimeout(300); // chờ ResizeObserver đo lại thân popup
      const than = await hop.evaluate((e) => {
        const v = [...e.querySelectorAll<HTMLElement>('div')].find((d) => getComputedStyle(d).overflowY === 'auto');
        return v ? { tran: v.scrollHeight > v.clientHeight + 1, tabindex: v.getAttribute('tabindex') } : null;
      });
      expect(than, 'không tìm thấy thân popup').not.toBeNull();
      expect(than!.tabindex, 'tràn ⇔ nhận con trỏ').toBe(than!.tran ? '0' : null);
      if (rong < 1000) expect(than!.tran).toBe(true);
      const kq = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(kq.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  }

  test('375: ô dịch vụ không liên kết cao bằng ô có liên kết (chênh < 1 px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await giaApi(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: TEN_TRUNG_TAM })).toBeVisible({ timeout: 20_000 });
    const luoi = await page.getByText('Đánh giá hài lòng', { exact: true }).first().evaluate((e) => {
      const ul = e.closest('ul')!;
      return [...ul.children].map((li) => ({
        co: !!li.querySelector('a'),
        h: li.getBoundingClientRect().height,
      }));
    });
    expect(luoi.length).toBe(6);
    console.log('chiều cao ô (375):', luoi.map((x) => `${x.co ? 'link' : 'khong'}=${x.h.toFixed(1)}`).join(' '));
    // ô 1 (không liên kết) và ô 5 (liên kết), tên cùng 2 dòng: cao bằng nhau; hàng 1 dòng thì thấp hơn hàng 2 dòng
    expect(Math.abs(luoi[0]!.h - luoi[4]!.h)).toBeLessThan(1);
    expect(Math.abs(luoi[0]!.h - luoi[1]!.h)).toBeLessThan(1); // cùng hàng
  });
});
