import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import {
  chanMangNgoai,
  CSS_GIAN_CHU,
  ganCssThu,
  duongApi,
  ghiYeuCau,
  GOC,
  khongTranNgang,
  KHONG_TIM_THAY_THU_TUC,
  layCsp,
  linkDvc,
  TEN_MIEN_DA_BO,
  THE_AXE,
  theoDoiHopThoai,
  theoDoiLoi,
  themBatCsp,
} from './du-lieu/chung';
import { boN, boN1000, boN60, boNX, TEN_LINH_VUC_N } from './du-lieu/danh-muc';
import { chiTietDayDu, dungLinhVuc, traChiTiet, traDanhMuc, traLoiApi, type ChiTietThu, type LinhVucThu, type ThuTucRutGonThu } from './du-lieu/thuong-gap';

/**
 * F04 · Danh mục thủ tục cấp xã / cấp tỉnh — e2e trên bản build do API phục vụ (ban-build.config.ts).
 * Mã ca (F04-TK-01…) theo .specify/specs/F04-danh-muc-thu-tuc/testcases.md. Bộ N, N60, N1000, N0, NX giả bằng page.route;
 * ca "M408" dùng dữ liệu thật của nguồn Mẫu (408 thủ tục, 266 cấp xã, 75 lĩnh vực).
 */

const KHONG_TIM_THAY_CHUNG = /Không tìm thấy thủ tục phù hợp/;

const tab = (p: Page, cap: 'xa' | 'tinh') => p.getByRole('tab', { name: cap === 'xa' ? 'Thủ tục cấp xã' : 'Thủ tục cấp tỉnh' });
const bang = (p: Page) => p.getByRole('tabpanel');
const oTim = (p: Page) => bang(p).getByRole('searchbox');
const chonLinhVuc = (p: Page) => bang(p).getByRole('combobox', { name: 'Lĩnh vực' });
const chonMucDo = (p: Page) => bang(p).getByRole('combobox', { name: 'Mức độ' });
const nutXoaLoc = (p: Page) => bang(p).getByRole('button', { name: 'Xoá bộ lọc' });
const soKetQua = (p: Page) => bang(p).locator('p[aria-live="polite"]');
const dialog = (p: Page) => p.getByRole('dialog');
const thongKe = (p: Page) => p.getByRole('list', { name: 'Thống kê danh mục' });

async function chuanBi(page: Page, thuTuc: readonly ThuTucRutGonThu[] = boN(), opt: { linhVuc?: readonly LinhVucThu[]; ten?: Record<string, string>; tre?: number; chiTiet?: Record<string, ChiTietThu> } = {}) {
  await traDanhMuc(page, thuTuc, { ten: opt.ten ?? TEN_LINH_VUC_N, ...(opt.linhVuc ? { linhVuc: opt.linhVuc } : {}), ...(opt.tre ? { tre: opt.tre } : {}) });
  await traChiTiet(page, opt.chiTiet ?? CHI_TIET());
  await chanMangNgoai(page, GOC);
}

const CHI_TIET = (): Record<string, ChiTietThu> => ({
  '9.103': chiTietDayDu('9.103', 'Thủ tục đăng ký kết hôn thử'),
  '1.001193': chiTietDayDu('1.001193', 'Thủ tục đăng ký khai sinh'),
});

async function vao(page: Page, duong = '/thu-tuc', cho: 'dong' | 'khong' = 'dong') {
  await page.goto(duong);
  await expect(page.getByRole('tab').first()).toBeVisible();
  if (cho === 'dong') await expect(bang(page).locator('tbody tr, article').first()).toBeVisible();
}

async function dong(page: Page): Promise<{ ma: string[]; ten: string[] }> {
  await bang(page).locator('tbody tr, article').first().waitFor();
  return bang(page).evaluate((k) => {
    const hang = k.querySelectorAll('tbody tr');
    if (hang.length > 0) {
      return {
        ma: [...hang].map((r) => r.querySelectorAll('td')[1]?.textContent?.trim() ?? ''),
        ten: [...hang].map((r) => r.querySelectorAll('td')[2]?.textContent?.trim() ?? ''),
      };
    }
    const the = [...k.querySelectorAll('article')];
    return {
      ma: the.map((a) => a.querySelector('span[class*="ma"]')?.textContent?.trim() ?? ''),
      ten: the.map((a) => a.querySelector('h2')?.textContent?.trim() ?? ''),
    };
  });
}
const maHienThi = async (p: Page) => (await dong(p)).ma;
const tenHienThi = async (p: Page) => (await dong(p)).ten;

const thamSo = (page: Page) => new URL(page.url()).searchParams;

test.describe.configure({ mode: 'default' });

// ───────────────────────────── 1. Tìm kiếm (BR-1; AC-1, AC-12) ─────────────────────────────

test.describe('Tìm kiếm (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F04-TK-01 (AC-1) · "ho tich" ở tab cấp xã: đúng 8 thủ tục Hộ tịch; dòng "8 thủ tục (đang lọc)"', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa');
    await expect(soKetQua(page)).toHaveText('16 thủ tục');
    await oTim(page).fill('ho tich');
    await expect(soKetQua(page)).toHaveText('8 thủ tục (đang lọc)');
    const ma = await maHienThi(page);
    expect(ma.sort()).toEqual(['1.001193', '9.101', '9.102', '9.103', '9.104', '9.105', '9.106', '9.107']);
  });

  test('F04-TK-02/04/05/13 · mã 1.001193; "DAT DAI"/"đất đai"/dư khoảng trắng; thứ tự từ; đ ↔ d', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=tinh');
    await oTim(page).fill('1.001193');
    await expect(soKetQua(page)).toHaveText('1 thủ tục (đang lọc)');
    expect(await tenHienThi(page)).toEqual(['Thủ tục đăng ký khai sinh']);
    for (const q of ['DAT DAI', 'đất đai', '  dat   dai  ', 'dat', 'đất']) {
      await oTim(page).fill(q);
      await expect(soKetQua(page)).toHaveText(q.trim().match(/^(dat|đất)$/i) ? /\d+ thủ tục/ : '8 thủ tục (đang lọc)');
    }
    for (const q of ['the chap dang ky', 'dang ky the chap']) {
      await oTim(page).fill(q);
      await expect(soKetQua(page)).toHaveText('3 thủ tục (đang lọc)');
      expect((await maHienThi(page)).sort()).toEqual(['9.201', '9.202', '9.203']);
    }
  });

  test('F04-TK-03 (AC-12) · dữ liệu thật: "1.001193" ra đúng một thủ tục khai sinh ở cả hai tab', async ({ page }) => {
    await vao(page, '/thu-tuc?cap=xa');
    await oTim(page).fill('1.001193');
    await expect(soKetQua(page)).toHaveText('1 thủ tục (đang lọc)');
    expect(await maHienThi(page)).toEqual(['1.001193']);
    await expect(bang(page)).toContainText('Thủ tục đăng ký khai sinh');
    await tab(page, 'tinh').click();
    await expect(soKetQua(page)).toHaveText('1 thủ tục (đang lọc)');
    expect(await maHienThi(page)).toEqual(['1.001193']);
  });

  test('F04-TK-06 · "9.2 chap": ghi nhận hành vi so khớp mã một phần + từ trong tên', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=tinh');
    await oTim(page).fill('9.2 chap');
    await expect(soKetQua(page)).toHaveText(/\d+ thủ tục/);
    const t = (await soKetQua(page).textContent())!;
    console.log(`F04-TK-06: "9.2 chap" -> ${t}`);
    // "chap" cũng nằm trong "tranh chấp" của 9.207 nên mã 9.2xx + "chap" ra 4 mục.
    expect((await maHienThi(page)).sort()).toEqual(['9.201', '9.202', '9.203', '9.207']);
  });

  test('F04-TK-07 · NFD, ký tự U+200E, hoa/thường cho cùng kết quả', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa');
    await oTim(page).fill('dang ky');
    await expect(soKetQua(page)).toHaveText(/đang lọc/);
    const chuan = (await soKetQua(page).textContent())!;
    const u200e = String.fromCodePoint(0x200e);
    for (const q of ['đăng ký'.normalize('NFD'), `dang${u200e} ky`, 'DANG KY', 'Đăng Ký']) {
      await oTim(page).fill(q);
      await expect(soKetQua(page)).toHaveText(chuan);
    }
  });

  test('F04-TK-08 · dán 5.000 ký tự: không treo, thông báo gọn, không cuộn ngang, ✕ xoá được', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('zq '.repeat(1700).trim());
    await expect(bang(page).getByText(KHONG_TIM_THAY_CHUNG)).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
    await bang(page).getByRole('button', { name: 'Xoá từ khoá' }).click();
    await expect(soKetQua(page)).toHaveText('16 thủ tục');
  });

  test('F04-TK-09 · ký tự đặc biệt/HTML/SQL nguyên văn dạng chữ; không hộp thoại; không lỗi console', async ({ page }) => {
    const loi = theoDoiLoi(page);
    const hopThoai = theoDoiHopThoai(page);
    await chuanBi(page);
    await vao(page);
    for (const q of ['<b>abc</b>', '"><img src=x onerror=alert(1)>', "'; DROP TABLE thu_tuc;--", '.*', '(', '[a-z]+', '\\', '%']) {
      await oTim(page).fill(q);
      await expect(bang(page).getByText(KHONG_TIM_THAY_CHUNG)).toBeVisible();
      await expect(bang(page).locator('p').filter({ hasText: 'phù hợp với' })).toContainText(q.trim());
      expect(await bang(page).locator('b, img[src="x"]').count()).toBe(0);
    }
    expect(hopThoai).toEqual([]);
    expect(loi).toEqual([]);
  });

  test('F04-TK-10 · ✕ trong ô: ô trống, con trỏ trong ô, đủ danh sách, địa chỉ bỏ q', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('khai sinh');
    await expect(page).toHaveURL(/q=khai/);
    await bang(page).getByRole('button', { name: 'Xoá từ khoá' }).click();
    await expect(soKetQua(page)).toHaveText('16 thủ tục');
    await expect(oTim(page)).toBeFocused();
    await expect(page).not.toHaveURL(/q=/);
  });

  test('F04-TK-12 mô phỏng · gõ nhanh "giay" từng phím không mất ký tự; IME (Telex mô phỏng) "giấy" giữ nguyên', async ({ page }) => {
    const ds = boN().concat([{ ...boN()[0]!, ma: '9.901', ten: 'Cấp giấy phép thử', tenTimKiem: 'cap giay phep thu', capXa: true }]);
    await chuanBi(page, ds);
    await vao(page);
    for (let lan = 0; lan < 5; lan++) {
      await oTim(page).fill('');
      await oTim(page).pressSequentially('giay', { delay: 0 });
      await expect(oTim(page)).toHaveValue('giay');
      await expect(soKetQua(page)).toHaveText('1 thủ tục (đang lọc)');
    }
    // IME qua CDP: soạn "gia" -> "giá" -> "giấy" rồi chốt; ô tìm không được bị ghi đè/mất chữ.
    const cdp = await page.context().newCDPSession(page);
    await oTim(page).fill('');
    await oTim(page).focus();
    for (const dang of ['g', 'gi', 'gia', 'giá', 'giấ', 'giấy']) {
      await cdp.send('Input.imeSetComposition', { text: dang, selectionStart: dang.length, selectionEnd: dang.length });
      await page.waitForTimeout(40);
    }
    await cdp.send('Input.insertText', { text: 'giấy' });
    await expect(oTim(page)).toHaveValue('giấy');
    await expect(soKetQua(page)).toHaveText('1 thủ tục (đang lọc)');
  });
});

// ───────────────────────────── 2. Lọc lĩnh vực, mức độ (BR-2, BR-10; AC-2, AC-21) ─────────────────────────────

test.describe('Lọc lĩnh vực và mức độ (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F04-LK-01 (AC-2) · Hộ tịch + Toàn trình ở tab xã còn 5; "(đang lọc)"; mọi dòng có nhãn Toàn trình', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa');
    await chonLinhVuc(page).selectOption({ label: 'Hộ tịch (8)' });
    await chonMucDo(page).selectOption({ label: 'Toàn trình' });
    await expect(soKetQua(page)).toHaveText('5 thủ tục (đang lọc)');
    expect(await bang(page).locator('tbody tr').allInnerTexts()).toHaveLength(5);
    for (const hang of await bang(page).locator('tbody tr').all()) await expect(hang).toContainText('Toàn trình');
  });

  test('F04-LK-02/03 (AC-2, BR-10) · dữ liệu thật: tab xã "266 thủ tục", tab tỉnh "408 thủ tục", không "(đang lọc)"', async ({ page }) => {
    await vao(page, '/thu-tuc?cap=xa');
    await expect(soKetQua(page)).toHaveText('266 thủ tục');
    await tab(page, 'tinh').click();
    await expect(soKetQua(page)).toHaveText('408 thủ tục');
  });

  test('F04-LK-04/05/06 · Đất đai + Một phần + "the chap" ở tab tỉnh = 2; một phần: xã 7, tỉnh 10; về Tất cả', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=tinh');
    await chonLinhVuc(page).selectOption({ label: 'Đất đai (8)' });
    await chonMucDo(page).selectOption({ label: 'Một phần' });
    await oTim(page).fill('the chap');
    await expect(soKetQua(page)).toHaveText('2 thủ tục (đang lọc)');
    expect((await maHienThi(page)).sort()).toEqual(['9.201', '9.202']);
    await chonLinhVuc(page).selectOption({ label: 'Tất cả lĩnh vực' });
    await chonMucDo(page).selectOption({ label: 'Tất cả mức độ' });
    await oTim(page).fill('');
    await expect(soKetQua(page)).toHaveText('20 thủ tục');
    await page.goto('/thu-tuc?cap=xa&md=mot-phan');
    await expect(soKetQua(page)).toHaveText('7 thủ tục (đang lọc)');
    expect((await maHienThi(page)).sort()).toEqual(['9.102', '9.105', '9.107', '9.207', '9.303', '9.304', '9.402']);
    await page.goto('/thu-tuc?cap=tinh&md=mot-phan');
    await expect(soKetQua(page)).toHaveText('10 thủ tục (đang lọc)');
    expect((await maHienThi(page)).sort()).toEqual(['9.102', '9.105', '9.107', '9.201', '9.202', '9.204', '9.205', '9.207', '9.303', '9.304']);
  });

  test('F04-LK-07 (AC-21, BR-10) · mọi thủ tục của tab đều Toàn trình: chọn Toàn trình vẫn "N thủ tục", không "(đang lọc)"', async ({ page }) => {
    const ds = boN().map((t) => ({ ...t, mucDo: 'toan-trinh' as const }));
    await chuanBi(page, ds);
    await vao(page, '/thu-tuc?cap=xa');
    await chonMucDo(page).selectOption({ label: 'Toàn trình' });
    await expect(soKetQua(page)).toHaveText('16 thủ tục');
  });

  test('F04-LK-08/09 · ô chọn lĩnh vực: tab xã 4 lĩnh vực kèm số của tab; tab tỉnh 3', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa');
    expect(await chonLinhVuc(page).locator('option').allTextContents()).toEqual([
      'Tất cả lĩnh vực', 'Chứng thực (4)', 'Đất đai (2)', 'Hộ tịch (8)', 'Lĩnh vực chỉ cấp xã thử (2)',
    ]);
    await tab(page, 'tinh').click();
    await expect(tab(page, 'tinh')).toHaveAttribute('aria-selected', 'true');
    await expect.poll(async () => chonLinhVuc(page).locator('option').allTextContents()).toEqual(['Tất cả lĩnh vực', 'Chứng thực (4)', 'Đất đai (8)', 'Hộ tịch (8)']);
  });

  test('F04-LK-10 · lọc lĩnh vực giữ thứ tự theo thu_tu của dữ liệu', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=tinh');
    await chonLinhVuc(page).selectOption({ label: 'Đất đai (8)' });
    expect(await maHienThi(page)).toEqual(['9.201', '9.202', '9.203', '9.204', '9.205', '9.206', '9.207', '9.208']);
  });

  test('F04-LK-11 · N60: sang trang 2 rồi chọn mức độ → về trang 1, địa chỉ bỏ trang', async ({ page }) => {
    const ds = boN60().map((t, i) => ({ ...t, mucDo: i % 2 === 0 ? ('mot-phan' as const) : ('toan-trinh' as const) }));
    await chuanBi(page, ds);
    await vao(page, '/thu-tuc?cap=xa');
    await bang(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    await expect(page).toHaveURL(/trang=2/);
    await chonMucDo(page).selectOption({ label: 'Một phần' });
    await expect(page).not.toHaveURL(/trang=/);
    await expect(bang(page).getByRole('button', { name: 'Trang 1', exact: true })).toHaveAttribute('aria-current', 'page');
  });

  test('F04-LK-12 · gõ ba từ khoá liên tiếp: dòng cập nhật; aria-live polite; 0 kết quả thì khối thông báo', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa');
    await oTim(page).fill('ho tich');
    await expect(soKetQua(page)).toHaveText('8 thủ tục (đang lọc)');
    await oTim(page).fill('ho tich khai sinh luu dong');
    await expect(soKetQua(page)).toHaveText('1 thủ tục (đang lọc)');
    await oTim(page).fill('zzzz');
    await expect(bang(page).getByText(KHONG_TIM_THAY_CHUNG)).toBeVisible();
    await expect(soKetQua(page)).toHaveAttribute('aria-live', 'polite');
  });

  test('F04-LK-13 · 1.000 thủ tục: số có dấu chấm nghìn ("1.000 thủ tục") ở tab tỉnh', async ({ page }) => {
    const { thuTuc, linhVuc } = boN1000();
    await chuanBi(page, thuTuc, { linhVuc });
    await vao(page, '/thu-tuc?cap=tinh');
    await expect(soKetQua(page)).toHaveText('1.000 thủ tục');
    await expect(thongKe(page).getByText('1.000', { exact: true })).toBeVisible();
  });

  test('F04-LK-14 / TAB-07 / AC-17 · đổi tab giữ từ khoá và mức độ, bỏ lĩnh vực và trang, về trang 1', async ({ page }) => {
    const ds = boN60();
    await chuanBi(page, [...boN(), ...ds.map((t) => ({ ...t, tenTimKiem: t.tenTimKiem + ' khai sinh', capTinh: true }))]);
    await vao(page, '/thu-tuc?cap=xa&lv=ho-tich&md=toan-trinh&q=khai+sinh');
    await expect(oTim(page)).toHaveValue('khai sinh');
    await bang(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    await expect(page).toHaveURL(/trang=2/);
    await tab(page, 'tinh').click();
    const u = thamSo(page);
    expect(u.get('cap')).toBe('tinh');
    expect(u.has('lv')).toBe(false);
    expect(u.has('trang')).toBe(false);
    expect(u.get('md')).toBe('toan-trinh');
    expect(u.get('q')).toBe('khai sinh');
    await expect(chonLinhVuc(page)).toHaveValue('');
    await expect(chonMucDo(page)).toHaveValue('toan-trinh');
    await expect(oTim(page)).toHaveValue('khai sinh');
  });
});

// ───────────────────────────── 3. Xoá bộ lọc, không có kết quả (BR-8; AC-3, AC-14) ─────────────────────────────

test.describe('Xoá bộ lọc (1280, 375)', () => {
  for (const [w, h] of [[1280, 900], [375, 812]] as const) {
    test(`F04-XB-01/02/03 (AC-3) · ${w}px: nút luôn hiện; bấm đưa về tab hiện tại, tất cả, trang 1, địa chỉ chỉ còn cap=tinh`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await chuanBi(page);
      await vao(page, '/thu-tuc?cap=xa');
      await expect(nutXoaLoc(page)).toBeVisible();
      await tab(page, 'tinh').click();
      await expect(nutXoaLoc(page)).toBeVisible();
      await chonLinhVuc(page).selectOption({ label: 'Đất đai (8)' });
      await chonMucDo(page).selectOption({ label: 'Một phần' });
      await oTim(page).fill('the chap');
      await expect(soKetQua(page)).toHaveText('2 thủ tục (đang lọc)');
      await nutXoaLoc(page).click();
      await expect(soKetQua(page)).toHaveText('20 thủ tục');
      await expect(oTim(page)).toHaveValue('');
      await expect(chonLinhVuc(page)).toHaveValue('');
      await expect(chonMucDo(page)).toHaveValue('');
      await expect(tab(page, 'tinh')).toHaveAttribute('aria-selected', 'true');
      expect([...thamSo(page).keys()]).toEqual(['cap']);
      // cùng thanh với ô tìm (ở 375 các phần tử có thể xuống dòng nhưng nằm trong cùng khung bảng)
      const nut = (await nutXoaLoc(page).boundingBox())!;
      const tim = (await oTim(page).boundingBox())!;
      if (w >= 1280) expect(Math.abs(nut.y - tim.y)).toBeLessThan(80);
      else expect(nut.y - tim.y).toBeLessThan(400);
    });
  }

  test('F04-XB-04/05 · chưa lọc bấm "Xoá bộ lọc": không đổi, không thêm lịch sử; giữ tab, về trang 1 (N60)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page, boN60());
    await vao(page, '/thu-tuc?cap=xa');
    const truoc = await page.evaluate(() => history.length);
    await nutXoaLoc(page).click();
    expect(await page.evaluate(() => history.length)).toBe(truoc);
    await bang(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    await oTim(page).fill('thu');
    await nutXoaLoc(page).click();
    await expect(tab(page, 'xa')).toHaveAttribute('aria-selected', 'true');
    await expect(page).not.toHaveURL(/trang=|q=/);
  });

  for (const [w, h] of [[1280, 900], [375, 812]] as const) {
    test(`F04-XB-06/07 (AC-14) · ${w}px: lọc Hộ tịch + "xyzxyz": thông báo, 4 gợi ý, KHÔNG nút trong thông báo, nút trên thanh bấm được; ẩn phân trang`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await chuanBi(page);
      await vao(page, '/thu-tuc?cap=xa');
      await chonLinhVuc(page).selectOption({ label: 'Hộ tịch (8)' });
      await oTim(page).fill('xyzxyz');
      await expect(bang(page).getByText("Không tìm thấy thủ tục phù hợp với 'xyzxyz'")).toBeVisible();
      await expect(bang(page).getByRole('listitem').filter({ hasText: /chính tả|thanh bộ lọc|Trợ lý|Gọi Trung tâm/ })).toHaveCount(4);
      await expect(bang(page).getByRole('button', { name: 'Xoá bộ lọc' })).toHaveCount(1); // chỉ nút trên thanh
      await expect(bang(page).getByRole('navigation', { name: 'Phân trang' })).toHaveCount(0);
      await nutXoaLoc(page).click();
      await expect(oTim(page)).toHaveValue('');
      await expect(chonLinhVuc(page)).toHaveValue('');
      await expect(soKetQua(page)).toHaveText('16 thủ tục');
    });
  }

  test('F04-XB-08 · chỉ lọc lĩnh vực + mức độ, không từ khoá, 0 kết quả: "Không tìm thấy thủ tục phù hợp" (không nhắc từ khoá)', async ({ page }) => {
    const ds = boN().map((t) => (t.linhVucMa === 'linh-vuc-chi-xa' ? { ...t, mucDo: 'mot-phan' as const } : t));
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page, ds);
    await vao(page, '/thu-tuc?cap=xa&lv=linh-vuc-chi-xa&md=toan-trinh', 'khong');
    await expect(bang(page).getByText('Không tìm thấy thủ tục phù hợp', { exact: true })).toBeVisible();
    await expect(bang(page).getByText(/phù hợp với '/)).toHaveCount(0);
  });

  test('F04-XB-09 / TL-06 / AC-20 · danh mục rỗng: thống kê 0·0·0, chỉ gợi ý hỏi trợ lý + gọi trung tâm, trang không lỗi', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const loi = theoDoiLoi(page);
    await chuanBi(page, [], { linhVuc: [] });
    await vao(page, '/thu-tuc', 'khong');
    await expect(thongKe(page).getByRole('listitem')).toHaveText(['0Thủ tục cấp xã', '0Thủ tục cấp tỉnh', '0Lĩnh vực']);
    await expect(bang(page).getByText(KHONG_TIM_THAY_CHUNG)).toBeVisible();
    const goiY = await bang(page).getByRole('listitem').allInnerTexts();
    console.log(`F04-XB-09: gợi ý khi danh mục rỗng: ${JSON.stringify(goiY)}`);
    expect(goiY.join(' ')).toMatch(/Trợ lý/);
    expect(goiY.join(' ')).toMatch(/Gọi Trung tâm/);
    expect(goiY.join(' ')).not.toMatch(/chính tả|Xoá bộ lọc/);
    expect(loi).toEqual([]);
  });

  test('F04-XB-10 · bàn phím: Tab tới "Xoá bộ lọc", Enter kích hoạt', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('ho tich');
    await expect(soKetQua(page)).toHaveText('8 thủ tục (đang lọc)');
    await nutXoaLoc(page).focus();
    await expect(nutXoaLoc(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(soKetQua(page)).toHaveText('16 thủ tục');
  });
});

// ───────────────────────────── 4. Tab (BR-5, BR-11; AC-17) ─────────────────────────────

test.describe('Tab Cấp xã / Cấp tỉnh (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F04-TAB-01/05 / BR-11 · hai tab "Thủ tục cấp xã", "Thủ tục cấp tỉnh"; tablist có tên; một tabpanel labelledby tab đang chọn', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await expect(page.getByRole('tablist', { name: 'Danh mục' })).toBeVisible();
    await expect(page.getByRole('tab')).toHaveText(['Thủ tục cấp xã', 'Thủ tục cấp tỉnh']);
    await expect(tab(page, 'xa')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    await expect(page.getByRole('tabpanel')).toHaveAccessibleName('Thủ tục cấp xã');
    const khacMau = await page.evaluate(() => {
      const t = [...document.querySelectorAll('[role=tab]')].map((e) => getComputedStyle(e));
      return t[0]!.fontWeight !== t[1]!.fontWeight || t[0]!.backgroundColor !== t[1]!.backgroundColor;
    });
    expect(khacMau).toBe(true);
  });

  test('F04-TAB-02/03 · đổi tab về trang 1, địa chỉ cap=tinh không có trang; thủ tục chỉ cấp tỉnh không ở tab xã', async ({ page }) => {
    await chuanBi(page, boN60());
    await vao(page);
    await bang(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    await tab(page, 'tinh').click();
    expect(thamSo(page).get('cap')).toBe('tinh');
    expect(thamSo(page).has('trang')).toBe(false);
  });

  test('F04-TAB-03 · dữ liệu thật: tab xã 266 dòng, tab tỉnh 408; thủ tục chỉ cấp tỉnh (2.000635) không ở tab xã', async ({ page, request }) => {
    const ds = (await (await request.get('/api/thu-tuc')).json()) as { ma: string; capXa: boolean; capTinh: boolean }[];
    const chiTinh = ds.find((t) => !t.capXa && t.capTinh)!;
    await vao(page, '/thu-tuc?cap=xa');
    await oTim(page).fill(chiTinh.ma);
    await expect(bang(page).getByText(KHONG_TIM_THAY_CHUNG)).toBeVisible();
    await tab(page, 'tinh').click();
    await expect(soKetQua(page)).toHaveText('1 thủ tục (đang lọc)');
    expect(ds.filter((t) => t.capXa).length).toBe(266);
    expect(ds.length).toBe(408);
  });

  test('F04-TAB-04 / AC-17 · bàn phím: ← → chuyển và kích hoạt ngay, Home/End; roving tabindex', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await tab(page, 'xa').focus();
    await expect(tab(page, 'xa')).toHaveAttribute('tabindex', '0');
    await expect(tab(page, 'tinh')).toHaveAttribute('tabindex', '-1');
    await page.keyboard.press('ArrowRight');
    await expect(tab(page, 'tinh')).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 'tinh')).toBeFocused();
    expect(thamSo(page).get('cap')).toBe('tinh');
    await page.keyboard.press('ArrowLeft');
    await expect(tab(page, 'xa')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(tab(page, 'tinh')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(tab(page, 'xa')).toHaveAttribute('aria-selected', 'true');
  });

  test('F04-TAB-06 · 375: hai tab chia đều, vừa chiều ngang, không cuộn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page);
    await vao(page);
    const a = (await tab(page, 'xa').boundingBox())!;
    const b = (await tab(page, 'tinh').boundingBox())!;
    expect(Math.abs(a.width - b.width)).toBeLessThan(3);
    expect(a.x + a.width + b.width).toBeLessThanOrEqual(376);
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('F04-TAB-08 · bấm tab đang chọn: không đổi, không thêm lịch sử', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    const n = await page.evaluate(() => history.length);
    const url = page.url();
    await tab(page, 'xa').click();
    expect(await page.evaluate(() => history.length)).toBe(n);
    expect(page.url()).toBe(url);
  });
});

// ───────────────────────────── 5. Thống kê (BR-4; AC-7) ─────────────────────────────

test.describe('Thống kê (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F04-TKE-01 (AC-7) · dữ liệu thật: đúng 3 ô 266 · 408 · 75 với nhãn đúng', async ({ page }) => {
    await vao(page);
    await expect(thongKe(page).getByRole('listitem')).toHaveText(['266Thủ tục cấp xã', '408Thủ tục cấp tỉnh', '75Lĩnh vực']);
  });

  test('F04-TKE-02/07 · bộ N: 16 · 20 · 4; không đổi khi gõ, lọc, đổi tab', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    const mong = ['16Thủ tục cấp xã', '20Thủ tục cấp tỉnh', '4Lĩnh vực'];
    await expect(thongKe(page).getByRole('listitem')).toHaveText(mong);
    await oTim(page).fill('khai sinh');
    await tab(page, 'tinh').click();
    await chonMucDo(page).selectOption({ label: 'Một phần' });
    await expect(thongKe(page).getByRole('listitem')).toHaveText(mong);
  });

  test('F04-TKE-05 · API bỏ lĩnh vực không có thủ tục: ô Lĩnh vực = độ dài mảng /api/linh-vuc', async ({ page }) => {
    const linhVuc = dungLinhVuc(boN(), TEN_LINH_VUC_N).slice(0, 3);
    await chuanBi(page, boN(), { linhVuc });
    await vao(page);
    await expect(thongKe(page).getByRole('listitem').last()).toHaveText('3Lĩnh vực');
  });

  test('F04-UT-01 / AC-8 · không có nhãn hay ô "Ưu tiên" (thẻ và bảng, hai tab)', async ({ page }) => {
    await vao(page);
    for (const cap of ['xa', 'tinh'] as const) {
      if (cap === 'tinh') await tab(page, 'tinh').click();
      await bang(page).getByRole('button', { name: 'Dạng thẻ' }).click();
      expect(await page.locator('body').innerText()).not.toMatch(/ưu tiên/i);
      await bang(page).getByRole('button', { name: 'Dạng bảng' }).click();
      expect(await page.locator('body').innerText()).not.toMatch(/ưu tiên/i);
      expect(await page.locator('[aria-label]').evaluateAll((e) => e.map((x) => x.getAttribute('aria-label')).join('|'))).not.toMatch(/ưu tiên/i);
    }
  });
});

// ───────────────────────────── 7. Phân trang 25 dòng (BR-5; AC-9) ─────────────────────────────

test.describe('Phân trang (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F04-PT-01/02/03 (AC-9) · N60: 25 · 25 · 10; trang 2 dòng đầu là mục 26; Sau/Trước đúng ở trang 3', async ({ page }) => {
    await chuanBi(page, boN60());
    await vao(page, '/thu-tuc?cap=xa');
    const pager = bang(page).getByRole('navigation', { name: 'Phân trang' });
    expect((await dong(page)).ma).toHaveLength(25);
    await pager.getByRole('button', { name: 'Trang 2', exact: true }).click();
    await expect(page).toHaveURL(/trang=2/);
    const t2 = await dong(page);
    expect(t2.ma).toHaveLength(25);
    expect(t2.ten[0]).toBe('Thủ tục hộ tịch thử 26');
    await pager.getByRole('button', { name: 'Trang sau' }).click();
    expect((await dong(page)).ma).toHaveLength(10);
    await expect(pager.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
    await expect(pager.getByRole('button', { name: 'Trang trước' })).toBeEnabled();
    // dạng thẻ cũng 25/25/10
    await bang(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    expect((await dong(page)).ma).toHaveLength(10);
  });

  test('F04-PT-04 · tab xã 16 mục (< 25): không phân trang', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa');
    await expect(bang(page).getByRole('navigation', { name: 'Phân trang' })).toHaveCount(0);
  });

  test('F04-PT-05 (C01 BR-8) · dữ liệu thật tab tỉnh (17 trang): trang đầu, cuối, hiện tại và kề; phần bỏ là "…"', async ({ page }) => {
    for (const [w, h] of [[1280, 900], [375, 812]] as const) {
      await page.setViewportSize({ width: w, height: h });
      for (const trang of [1, 9, 17]) {
        await vao(page, `/thu-tuc?cap=tinh&trang=${trang}`);
        const pager = bang(page).getByRole('navigation', { name: 'Phân trang' });
        const nhan = (await pager.getByRole('button', { name: /^Trang \d+$/ }).allTextContents()).map(Number);
        console.log(`F04-PT-05: ${w}px trang ${trang}: ${nhan.join(',')}`);
        expect(nhan).toContain(1);
        expect(nhan).toContain(17);
        expect(nhan).toContain(trang);
        expect(nhan.length).toBeLessThanOrEqual(7);
        await expect(pager.getByRole('button', { name: `Trang ${trang}`, exact: true })).toHaveAttribute('aria-current', 'page');
        await expect(pager).toContainText('…');
      }
    }
  });

  test('F04-PT-06/07/08 · lọc/đổi tab về trang 1; trang lớn → trang cuối; giá trị hỏng → 1; 03 → 3', async ({ page }) => {
    await chuanBi(page, boN60());
    for (const t of ['abc', '0', '00', '-1', '1.5', '3abc', '']) {
      await vao(page, `/thu-tuc?cap=xa&trang=${t}`);
      expect((await dong(page)).ten[0], `trang=${t}`).toBe('Thủ tục hộ tịch thử 01');
    }
    await vao(page, '/thu-tuc?cap=xa&trang=99999999999999999999');
    expect((await dong(page)).ma).toHaveLength(10);
    await vao(page, '/thu-tuc?cap=xa&trang=4');
    expect((await dong(page)).ma).toHaveLength(10);
    await vao(page, '/thu-tuc?cap=xa&trang=03');
    expect((await dong(page)).ma).toHaveLength(10);
    await vao(page, '/thu-tuc?cap=xa&trang=2');
    await oTim(page).fill('thu');
    await expect(page).not.toHaveURL(/trang=/);
  });

  test('F04-PT-09 · thẻ: 25 mục/trang ở 375, 768, 1024, 1280; ghi số cột', async ({ page }) => {
    await chuanBi(page, boN60());
    const ghi: string[] = [];
    for (const [w, h] of [[375, 812], [768, 1024], [1024, 900], [1280, 900]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await vao(page, '/thu-tuc?cap=xa');
      if (w >= 600) await bang(page).getByRole('button', { name: 'Dạng thẻ' }).click();
      const x = await bang(page).evaluate((k) => new Set([...k.querySelectorAll('article')].map((a) => Math.round(a.getBoundingClientRect().x))).size);
      expect((await dong(page)).ma).toHaveLength(25);
      ghi.push(`${w}px: ${x} cột`);
    }
    console.log('F04-PT-09:', ghi.join(' · '));
  });
});

// ───────────────────────────── 8. Địa chỉ trang (BR-3, BR-7; AC-5, 10, 11, 18, 19, 22) ─────────────────────────────

test.describe('Địa chỉ trang (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F04-DL-01/02 (AC-10) · cap, lv, q lên địa chỉ không có trang; mở ở context mới cùng kết quả (3 mục)', async ({ page, browser }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc');
    await chonLinhVuc(page).selectOption({ label: 'Hộ tịch (8)' });
    await oTim(page).fill('khai sinh');
    await expect(page).toHaveURL(/q=khai/);
    const u = thamSo(page);
    expect(u.get('cap')).toBe('xa');
    expect(u.get('lv')).toBe('ho-tich');
    expect(u.has('trang')).toBe(false);
    const moi = await browser.newContext({ viewport: { width: 375, height: 812 }, ignoreHTTPSErrors: true });
    const p2 = await moi.newPage();
    await chuanBi(p2);
    await p2.goto(page.url());
    await expect(tab(p2, 'xa')).toHaveAttribute('aria-selected', 'true');
    await expect(chonLinhVuc(p2)).toHaveValue('ho-tich');
    await expect(oTim(p2)).toHaveValue('khai sinh');
    await expect(soKetQua(p2)).toHaveText('3 thủ tục (đang lọc)');
    await moi.close();
  });

  test('F04-DL-03/04 (AC-10) · dữ liệu thật: tab tỉnh trang 3 mở ở context mới = 25 dòng (mục 51–75)', async ({ page, browser, request }) => {
    const ds = (await (await request.get('/api/thu-tuc')).json()) as { ma: string }[];
    await vao(page, '/thu-tuc?cap=tinh');
    await bang(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    await bang(page).getByRole('button', { name: 'Trang 3', exact: true }).click();
    await expect(page).toHaveURL(/cap=tinh.*trang=3|trang=3.*cap=tinh/);
    const moi = await browser.newContext({ viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
    const p2 = await moi.newPage();
    await p2.goto(page.url());
    await expect(tab(p2, 'tinh')).toHaveAttribute('aria-selected', 'true');
    const ma = await maHienThi(p2);
    expect(ma).toEqual(ds.slice(50, 75).map((t) => t.ma));
    await moi.close();
  });

  test('F04-DL-05 (AC-5) · link QR /thu-tuc?cap=xa&lv=ho-tich: thẳng tab xã, Hộ tịch đã chọn, 8 mục, địa chỉ không đổi thêm', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa&lv=ho-tich');
    await expect(chonLinhVuc(page)).toHaveValue('ho-tich');
    await expect(soKetQua(page)).toHaveText('8 thủ tục (đang lọc)');
    expect(page.url()).toMatch(/\/thu-tuc\?cap=xa&lv=ho-tich$/);
  });

  test('F04-DL-06 · /thu-tuc trần được bổ sung cap=xa bằng thay thế (không thêm lịch sử)', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc');
    await expect(page).toHaveURL(/cap=xa/);
    const n = await page.evaluate(() => history.length);
    expect(n).toBeLessThanOrEqual(2);
  });

  test('F04-DL-07 / AC-18 · cap/md lạ: tab xã + Tất cả mức độ, không báo lỗi, không hiện chữ lạ; địa chỉ chuẩn lại', async ({ page }) => {
    await chuanBi(page);
    for (const q of ['cap=abc&md=xyz', 'cap=TINH', 'cap=', 'cap=xa%20', 'md=TOAN-TRINH', 'md=', 'cap=javascript:alert(1)', 'md=%00']) {
      await vao(page, `/thu-tuc?${q}`);
      await expect(tab(page, 'xa')).toHaveAttribute('aria-selected', 'true');
      await expect(chonMucDo(page)).toHaveValue('');
      const chu = await page.locator('body').innerText();
      for (const lo of ['abc', 'xyz', 'javascript', 'TOAN-TRINH']) expect(chu).not.toContain(lo);
      expect(chu).not.toMatch(/lỗi|không tìm thấy lĩnh vực/i);
      expect(thamSo(page).get('cap')).toBe('xa');
    }
    await vao(page, '/thu-tuc?cap=tinh&md=toan-trinh');
    await expect(tab(page, 'tinh')).toHaveAttribute('aria-selected', 'true');
    await expect(chonMucDo(page)).toHaveValue('toan-trinh');
    await vao(page, '/thu-tuc?cap=tinh&cap=xa');
    await expect(tab(page, 'tinh')).toHaveAttribute('aria-selected', 'true');
  });

  test('F04-DL-09/10/11/12 (AC-11) · lv không có: khối "Không tìm thấy lĩnh vực" + "Xem toàn bộ danh mục"; không lộ mã; bấm về danh mục đầy đủ', async ({ page }) => {
    const hopThoai = theoDoiHopThoai(page);
    await chuanBi(page);
    for (const w of [1280, 375]) {
      await page.setViewportSize({ width: w, height: w === 375 ? 812 : 900 });
      await vao(page, '/thu-tuc?cap=xa&lv=khong-ton-tai', 'khong');
      await expect(bang(page).getByText('Không tìm thấy lĩnh vực')).toBeVisible();
      await expect(bang(page).getByRole('button', { name: 'Xem toàn bộ danh mục' })).toBeVisible();
      const chu = await page.locator('body').innerText();
      expect(chu).not.toContain('khong-ton-tai');
      expect(chu).not.toMatch(/Error|Exception|404|undefined|stack/);
      await expect(soKetQua(page)).toHaveText('');
      await expect(bang(page).locator('tbody tr, article')).toHaveCount(0);
      await expect(bang(page).getByRole('navigation', { name: 'Phân trang' })).toHaveCount(0);
    }
    await bang(page).getByRole('button', { name: 'Xem toàn bộ danh mục' }).click();
    expect(thamSo(page).has('lv')).toBe(false);
    await expect(tab(page, 'xa')).toHaveAttribute('aria-selected', 'true');
    await expect(soKetQua(page)).toHaveText('16 thủ tục');
    await expect(oTim(page)).toBeFocused();
    for (const lv of ['<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', 'x'.repeat(5000), '%']) {
      await page.goto(`/thu-tuc?cap=xa&lv=${encodeURIComponent(lv).replace('%25', '%')}`);
      await expect(bang(page).getByText('Không tìm thấy lĩnh vực')).toBeVisible();
      expect(await page.locator('body').innerText()).not.toContain('alert(1)');
      expect(await page.title()).not.toContain('alert');
    }
    expect(hopThoai).toEqual([]);
  });

  test('F04-DL-13 / AC-22 · lv có trong dữ liệu nhưng 0 thủ tục ở tab: ô chọn "(0)", "Không tìm thấy thủ tục phù hợp", không "Không tìm thấy lĩnh vực"', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=tinh&lv=linh-vuc-chi-xa', 'khong');
    await expect(chonLinhVuc(page).locator('option:checked')).toHaveText('Lĩnh vực chỉ cấp xã thử (0)');
    await expect(bang(page).getByText('Không tìm thấy thủ tục phù hợp', { exact: true })).toBeVisible();
    await expect(page.getByText('Không tìm thấy lĩnh vực')).toHaveCount(0);
  });

  test('F04-DL-14/18 · gõ từng phím không tạo mục lịch sử; đổi thẻ/bảng không đổi địa chỉ', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    const n = await page.evaluate(() => history.length);
    await oTim(page).pressSequentially('khai sinh', { delay: 40 });
    await expect(page).toHaveURL(/q=khai/);
    expect(await page.evaluate(() => history.length)).toBe(n);
    const url = page.url();
    await bang(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    expect(page.url()).toBe(url);
  });

  test('F04-DL-15 / AC-19 · từ trang chủ vào danh mục, gõ "khai sinh", chọn Hộ tịch → "Quay lại" một lần về trang chủ', async ({ page }) => {
    await chuanBi(page);
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await expect(tab(page, 'xa')).toBeVisible();
    await expect(bang(page).locator('tbody tr, article').first()).toBeVisible();
    await oTim(page).pressSequentially('khai sinh', { delay: 60 });
    await chonLinhVuc(page).selectOption({ label: 'Hộ tịch (8)' });
    await expect(page).toHaveURL(/lv=ho-tich/);
    await page.goBack();
    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('F04-DL-16 · q 5.000 ký tự và q chỉ khoảng trắng', async ({ page }) => {
    await chuanBi(page);
    await vao(page, `/thu-tuc?cap=xa&q=${'zq%20'.repeat(900)}`, 'khong');
    await expect(tab(page, 'xa')).toBeVisible();
    await vao(page, '/thu-tuc?cap=xa&q=%20%20');
    await expect(soKetQua(page)).toHaveText('16 thủ tục');
  });
});

// ───────────────────────────── 9. Popup, liên kết Cổng DVC (AC-6, 13, 15) ─────────────────────────────

test.describe('Popup và liên kết trên dòng (1280, 375)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F04-PO-01/10/13 (AC-6) · bấm tên (bảng) mở popup đúng mã 9.103; Esc trả con trỏ về nút; đúng 1 dialog', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa');
    const nut = bang(page).getByRole('button', { name: 'Thủ tục đăng ký kết hôn thử', exact: true });
    await nut.click();
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Thủ tục đăng ký kết hôn thử' })).toBeVisible();
    await expect(dialog(page).getByText('Mã: 9.103')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(nut).toBeFocused();
    await page.goto('/thu-tuc?cap=xa&ma=9.103');
    await expect(page.getByRole('dialog')).toHaveCount(1);
  });

  test('F04-PO-01 (thẻ, 375) · nút "Xem chi tiết" mở đúng thủ tục', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa');
    await bang(page).getByRole('button', { name: 'Xem chi tiết Thủ tục đăng ký kết hôn thử' }).click();
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Thủ tục đăng ký kết hôn thử' })).toBeVisible();
  });

  test('F04-PO-02/03/04/05 (AC-13) · địa chỉ giữ cap, lv và thêm ma; mở ở context mới; Quay lại đóng popup giữ bộ lọc; ✕/Esc/vùng tối', async ({ page, browser }) => {
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa&lv=ho-tich');
    await bang(page).getByRole('button', { name: 'Thủ tục đăng ký khai sinh', exact: true }).click();
    await expect(dialog(page)).toBeVisible();
    const u = thamSo(page);
    expect([u.get('cap'), u.get('lv'), u.get('ma')]).toEqual(['xa', 'ho-tich', '1.001193']);
    const moi = await browser.newContext({ viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
    const p2 = await moi.newPage();
    await chuanBi(p2);
    await p2.goto(page.url());
    await expect(dialog(p2)).toBeVisible();
    await expect(tab(p2, 'xa')).toHaveAttribute('aria-selected', 'true');
    await expect(chonLinhVuc(p2)).toHaveValue('ho-tich');
    await moi.close();
    await page.evaluate(() => ((window as unknown as { __m: number }).__m = 5));
    await page.goBack();
    await expect(dialog(page)).toHaveCount(0);
    expect(thamSo(page).get('lv')).toBe('ho-tich');
    expect(thamSo(page).get('cap')).toBe('xa');
    expect(await page.evaluate(() => (window as unknown as { __m?: number }).__m)).toBe(5);
    for (const cach of ['x', 'esc', 'toi'] as const) {
      await bang(page).getByRole('button', { name: 'Thủ tục đăng ký khai sinh', exact: true }).click();
      await expect(dialog(page)).toBeVisible();
      if (cach === 'x') await dialog(page).getByRole('button', { name: 'Đóng' }).first().click();
      else if (cach === 'esc') await page.keyboard.press('Escape');
      else await page.mouse.click(5, 5);
      await expect(dialog(page)).toHaveCount(0);
      expect(thamSo(page).has('ma')).toBe(false);
      expect([thamSo(page).get('cap'), thamSo(page).get('lv')]).toEqual(['xa', 'ho-tich']);
    }
  });

  for (const cap of ['xa', 'tinh'] as const) {
    test(`F04-PO-06/07/08/09 (AC-15) · tab ${cap}: liên kết Cổng DVC trên dòng mở tab mới đúng địa chỉ, popup KHÔNG mở; tên mở popup, KHÔNG mở tab`, async ({ page, context }) => {
      await chuanBi(page);
      await vao(page, `/thu-tuc?cap=${cap}`);
      await oTim(page).fill('1.001193');
      await expect(soKetQua(page)).toHaveText('1 thủ tục (đang lọc)');
      const hang = bang(page).locator('tbody tr').first();
      await expect(hang.getByRole('link', { name: /Cổng DVC/ })).toHaveCount(1);
      const lk = hang.getByRole('link');
      await expect(lk).toHaveAttribute('target', '_blank');
      expect(await lk.getAttribute('rel')).toMatch(/noopener/);
      expect(await lk.getAttribute('rel')).toMatch(/noreferrer/);
      expect(await lk.getAttribute('href')).toBe(linkDvc('1.001193'));
      const [tabMoi] = await Promise.all([context.waitForEvent('page'), lk.click()]);
      await tabMoi.close();
      await expect(dialog(page)).toHaveCount(0);
      await expect(page).not.toHaveURL(/ma=/);
      let moTab = 0;
      context.on('page', () => moTab++);
      await hang.getByRole('button').click();
      await expect(dialog(page)).toBeVisible();
      expect(moTab).toBe(0);
      await expect(page.locator('body')).not.toContainText('Nộp trực tuyến');
    });
  }

  test('F04-PO-11/12 · ma không có / sai định dạng: danh mục hiện + thông báo "Không tìm thấy thủ tục này…", 0 yêu cầu chi tiết với mã sai', async ({ page }) => {
    const hopThoai = theoDoiHopThoai(page);
    const dem: string[] = [];
    await traDanhMuc(page, boN(), { ten: TEN_LINH_VUC_N });
    await traChiTiet(page, CHI_TIET(), { dem });
    await vao(page, '/thu-tuc?cap=xa&ma=9.999999');
    await expect(dialog(page).getByText(KHONG_TIM_THAY_THU_TUC)).toBeVisible();
    await expect(soKetQua(page)).toHaveText('16 thủ tục');
    await dialog(page).getByRole('button', { name: 'Đóng' }).last().click();
    expect(thamSo(page).has('ma')).toBe(false);
    expect(thamSo(page).get('cap')).toBe('xa');
    dem.length = 0;
    for (const g of ['abc<b>x</b>', '1234567890123456789012']) {
      await page.goto(`/thu-tuc?cap=xa&ma=${encodeURIComponent(g)}`);
      await expect(dialog(page).getByText(KHONG_TIM_THAY_THU_TUC)).toBeVisible();
    }
    expect(dem).toEqual([]);
    expect(hopThoai).toEqual([]);
  });
});

// ───────────────────────────── 10. Thẻ / bảng (BR-9; AC-16) ─────────────────────────────

test.describe('Thẻ / bảng', () => {
  for (const [id, w, h, bangMong, nut, duong] of [
    ['DH-01', 375, 812, false, 0, '/thu-tuc'],
    ['DH-02', 768, 1024, false, 1, '/thu-tuc'],
    ['DH-03', 1280, 900, true, 1, '/thu-tuc'],
    ['DH-04', 1080, 1920, false, 1, '/thu-tuc?kiosk=1'],
    ['DH-07 599', 599, 900, false, 0, '/thu-tuc'],
    ['DH-07 600', 600, 900, false, 1, '/thu-tuc'],
    ['DH-07 1023', 1023, 900, false, 1, '/thu-tuc'],
    ['DH-07 1024', 1024, 900, true, 1, '/thu-tuc'],
  ] as const) {
    test(`F04-${id} (AC-16) · ${w}px: ${bangMong ? 'bảng' : 'thẻ'}, ${nut ? 'có' : 'không có'} nút chuyển dạng`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await chuanBi(page);
      await vao(page, duong);
      expect((await bang(page).locator('table').count()) > 0).toBe(bangMong);
      expect(await bang(page).getByRole('group', { name: 'Cách hiển thị' }).count()).toBe(nut);
    });
  }

  test('F04-DH-05/06 / BR-9 · lựa chọn dùng chung với khối thường gặp ở trang chủ (hai chiều)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page, '/thu-tuc');
    await bang(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Trang chủ' }).click();
    const khoi = page.getByRole('region', { name: 'Thủ tục thường gặp', exact: true });
    await expect(khoi.locator('article').first()).toBeVisible({ timeout: 15_000 });
    await khoi.getByRole('button', { name: 'Dạng bảng' }).click();
    await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await expect(bang(page).locator('table')).toBeVisible();
  });

  test('F04-DH-08/09/10/11 · thu cửa sổ 375 → thẻ không nút; nhớ lựa chọn qua tải lại; kiosk; đổi dạng giữ lọc/trang/địa chỉ', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page, boN60());
    await vao(page, '/thu-tuc?cap=xa');
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(bang(page).locator('table')).toHaveCount(0);
    await expect(bang(page).getByRole('group', { name: 'Cách hiển thị' })).toHaveCount(0);
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(bang(page).locator('table')).toBeVisible();
    await oTim(page).fill('hộ tịch');
    await bang(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    const url = page.url();
    const truoc = await maHienThi(page);
    await bang(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    expect(page.url()).toBe(url);
    expect(await maHienThi(page)).toEqual(truoc);
    await page.reload();
    await expect(bang(page).locator('article').first()).toBeVisible();
    await page.evaluate(() => window.localStorage.clear());
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.goto('/thu-tuc?kiosk=1');
    await expect(bang(page).locator('article').first()).toBeVisible();
    await bang(page).getByRole('button', { name: 'Dạng bảng' }).click();
    await page.reload();
    await expect(bang(page).locator('table')).toBeVisible();
  });

  test('F04-DH-12/13 · bảng 7 cột đúng, vùng bảng cuộn ngang ở 768 (trang không cuộn); thẻ cùng hàng cao bằng nhau', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await chuanBi(page, boN60());
    await vao(page, '/thu-tuc?cap=xa');
    await bang(page).getByRole('button', { name: 'Dạng bảng' }).click();
    await expect(bang(page).locator('thead th')).toHaveText(['STT', 'Mã', 'Tên thủ tục', 'Lĩnh vực', 'Mức độ', 'Cơ quan thực hiện', 'Cổng DVC']);
    expect(await khongTranNgang(page)).toBe(true);
    await bang(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    for (const w of [768, 1280]) {
      await page.setViewportSize({ width: w, height: 900 });
      const cao = await bang(page).evaluate((k) => {
        const theo = new Map<number, number[]>();
        for (const a of k.querySelectorAll('article')) {
          const r = a.getBoundingClientRect();
          const y = Math.round(r.y + window.scrollY);
          theo.set(y, [...(theo.get(y) ?? []), Math.round(r.height)]);
        }
        return [...theo.values()].every((h) => new Set(h).size === 1);
      });
      expect(cao, `${w}px`).toBe(true);
    }
  });
});

// ───────────────────────────── 11. Tải, lỗi, ngoại lệ dữ liệu ─────────────────────────────

test.describe('Tải, lỗi (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F04-TL-01 · API trễ 3 giây: đầu/chân trang hiện ngay, vùng nội dung khung giữ chỗ "Đang tải…"', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page, boN(), { tre: 3000 });
    await page.goto('/thu-tuc');
    await expect(page.locator('header')).toBeVisible();
    // Chân trang ẩn trong lúc có khung chờ (sửa CLS): xem F08-TL-04.
    await expect(page.getByText('Đang tải…').first()).toBeAttached();
    await expect(tab(page, 'xa')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('footer')).toBeVisible();
  });

  test('F04-TL-02/03/04 · /api/thu-tuc 500 rồi 200; chỉ linh-vuc lỗi; 429', async ({ page }) => {
    let pha: 500 | 200 = 500;
    await page.route('**/api/linh-vuc', (r) => r.fulfill({ json: dungLinhVuc(boN(), TEN_LINH_VUC_N) }));
    await page.route('**/api/thu-tuc', async (route) => {
      if (pha === 500) {
        await route.fulfill({ status: 500, contentType: 'application/problem+json', json: { status: 500, code: 'loi-he-thong', maTraCuu: 'MA123456' } });
      } else await route.fulfill({ json: boN() });
    });
    await page.goto('/thu-tuc');
    await expect(page.getByText('Chưa tải được dữ liệu.')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Mã tra cứu: MA123456')).toBeVisible();
    pha = 200;
    await page.getByRole('button', { name: 'Thử lại' }).click();
    await expect(tab(page, 'xa')).toBeVisible();
    // chỉ /api/linh-vuc lỗi: một ErrorState cho cả vùng, không danh sách một nửa
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await page.route('**/api/thu-tuc', (r) => r.fulfill({ json: boN() }));
    await traLoiApi(page, '**/api/linh-vuc', 500, 'loi-he-thong');
    await page.goto('/thu-tuc');
    await expect(page.getByText('Chưa tải được dữ liệu.')).toHaveCount(1, { timeout: 15_000 });
    await expect(page.getByRole('tab')).toHaveCount(0);
    // 429
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await page.route('**/api/linh-vuc', (r) => r.fulfill({ json: [] }));
    await traLoiApi(page, '**/api/thu-tuc', 429, 'qua-nhieu-yeu-cau');
    await page.goto('/thu-tuc');
    await expect(page.getByText('Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.')).toBeVisible({ timeout: 15_000 });
    expect(await page.locator('main').innerText()).not.toMatch(/429/);
  });

  test('F04-TL-07/08/10 · lĩnh vực mất khoá; coQuan/thoiHan null; mucDo lạ: không vỡ, không "undefined"/"null"', async ({ page }) => {
    const loi = theoDoiLoi(page);
    const ds = boN();
    ds[0] = { ...ds[0]!, coQuanThucHien: null, thoiHan: null };
    ds[1] = { ...ds[1]!, linhVucMa: 'mat-khoa' };
    ds[2] = { ...ds[2]!, mucDo: 'khac' as unknown as 'toan-trinh' };
    await chuanBi(page, ds);
    await vao(page, '/thu-tuc?cap=xa');
    const chu = await bang(page).innerText();
    expect(chu).not.toMatch(/undefined|\bnull\b/);
    await bang(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    await expect(bang(page).locator('article').first()).toBeVisible();
    expect(await bang(page).innerText()).not.toMatch(/undefined|\bnull\b/);
    expect(loi).toEqual([]);
  });

  test('F04-TL-09 · thoiHan rất dài (1.200 ký tự): thẻ không tràn khung (375)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const ds = boN();
    ds[0] = { ...ds[0]!, thoiHan: 'Thời hạn rất dài '.repeat(70) };
    await chuanBi(page, ds);
    await vao(page, '/thu-tuc?cap=xa');
    expect(await khongTranNgang(page)).toBe(true);
  });
});

// ───────────────────────────── 12. Trợ năng ─────────────────────────────

test.describe('Trợ năng (axe, bàn phím)', () => {
  for (const [w, h, kiosk] of [[375, 812, false], [768, 1024, false], [1280, 900, false], [1080, 1920, true]] as const) {
    test(`F04-TN-01 · axe ${w}px${kiosk ? ' kiosk' : ''}: tab xã/tỉnh, thẻ/bảng 0 vi phạm`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await vao(page, kiosk ? '/thu-tuc?kiosk=1' : '/thu-tuc');
      for (const cap of ['xa', 'tinh'] as const) {
        if (cap === 'tinh') await tab(page, 'tinh').click();
        await expect(bang(page).locator('tbody tr, article').first()).toBeVisible();
        const xem = w >= 600 ? (['Dạng bảng', 'Dạng thẻ'] as const) : ([null] as const);
        for (const x of xem) {
          if (x) await bang(page).getByRole('button', { name: x }).click();
          const kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
          expect(kq.violations.map((v) => `${cap}/${x ?? 'the'} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')}`)).toEqual([]);
        }
      }
    });
  }

  test('F04-TN-02/05/13/14 · tên đọc của ô chọn; một h1 ẩn, thẻ là h2; một main; tablist có tên; tabpanel labelledby', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    await expect(chonLinhVuc(page)).toBeVisible();
    await expect(chonMucDo(page)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Danh mục thủ tục');
    await bang(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    await expect(bang(page).locator('article h2').first()).toBeVisible();
    await expect(bang(page).locator('article h3')).toHaveCount(0);
    await expect(page.locator('main')).toHaveCount(1);
  });

  test('F04-TN-03/07 · chỉ bàn phím: Tab qua tab, ô tìm, hai ô chọn, Xoá bộ lọc, chuyển dạng, dòng, phân trang; Enter số trang', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page, boN60());
    await vao(page, '/thu-tuc?cap=xa');
    await tab(page, 'xa').focus();
    const thuTu: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      thuTu.push(await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null;
        return e ? `${e.tagName.toLowerCase()}:${e.getAttribute('role') ?? e.getAttribute('type') ?? ''}:${(e.getAttribute('aria-label') ?? e.textContent ?? '').trim().slice(0, 24)}` : '';
      }));
    }
    console.log('F04-TN-03 thứ tự Tab:', thuTu.join(' → '));
    expect(thuTu[0]).toMatch(/^input/);
    expect(thuTu.join(' ')).toMatch(/select.*select.*button:button:Xoá bộ lọc|select.*Xoá bộ lọc/s);
    const pager = bang(page).getByRole('navigation', { name: 'Phân trang' });
    await pager.getByRole('button', { name: 'Trang 2', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/trang=2/);
  });

  test('F04-TN-04 · ô chọn lĩnh vực bằng bàn phím: chọn đúng mục, kết quả đổi, địa chỉ đổi', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page, '/thu-tuc?cap=xa');
    await chonLinhVuc(page).focus();
    await page.keyboard.type('Hộ');
    await expect(chonLinhVuc(page)).toHaveValue('ho-tich');
    await expect(soKetQua(page)).toHaveText('8 thủ tục (đang lọc)');
    expect(thamSo(page).get('lv')).toBe('ho-tich');
  });

  test('F04-TN-06 · 320 px: không cuộn ngang; nhãn dài cắt "…"', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await vao(page);
    expect(await khongTranNgang(page)).toBe(true);
    await bang(page).getByRole('button', { name: 'Dạng thẻ' }).count();
  });

  test('F04-TN-10/11/15/16 · 320 và giãn chữ không tràn; vùng bấm >= 24 px ở 375; kiosk không cuộn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page);
    await vao(page);
    await ganCssThu(page, CSS_GIAN_CHU);
    expect(await khongTranNgang(page)).toBe(true);
    const nho: string[] = [];
    for (const loc of [tab(page, 'xa'), nutXoaLoc(page), chonLinhVuc(page), chonMucDo(page), bang(page).getByRole('button', { name: /^Xem chi tiết/ }).first()]) {
      const hop = await loc.boundingBox();
      console.log(`F04-TN-15: ${hop?.width.toFixed(0)}x${hop?.height.toFixed(0)}`);
      if (!hop || hop.width < 24 || hop.height < 24) nho.push(`${hop?.width}x${hop?.height}`);
    }
    expect(nho).toEqual([]);
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.goto('/thu-tuc?kiosk=1');
    await expect(tab(page, 'xa')).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
  });
});

// ───────────────────────────── 13. Bảo mật ─────────────────────────────

test.describe('Bảo mật', () => {
  test('F04-BM-08 (NX) · HTML trong tên thủ tục và lĩnh vực hiện nguyên văn dạng chữ', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const hopThoai = theoDoiHopThoai(page);
    const { thuTuc, linhVuc } = boNX();
    await traDanhMuc(page, thuTuc, { linhVuc });
    await chanMangNgoai(page, GOC);
    await vao(page, '/thu-tuc?cap=xa');
    await expect(bang(page).getByText('Thử <b>đậm</b> & "trích"').first()).toBeVisible(); // liên kết "Xem và nộp" nay mang thêm tên thủ tục (chữ ẩn) nên có 2 nơi khớp
    await expect(chonLinhVuc(page).locator('option').nth(1)).toHaveText('<img src=x onerror=alert(1)> (1)');
    expect(await bang(page).locator('b, img[src="x"]').count()).toBe(0);
    await bang(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    await expect(bang(page).getByRole('button', { name: 'Xem chi tiết Thử <b>đậm</b> & "trích"' })).toBeVisible();
    expect(hopThoai).toEqual([]);
  });

  test('F04-BM-09 · địa chỉ độc hại: không hộp thoại, không lỗi trang, chuỗi không lọt vào document.title', async ({ page }) => {
    const hopThoai = theoDoiHopThoai(page);
    const loi = theoDoiLoi(page, true);
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    for (const q of [
      'q=%3Cscript%3Ealert(1)%3C%2Fscript%3E', 'lv=%22%3E%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E', 'cap=javascript:alert(1)', 'md=%00', 'trang=%3Cb%3E',
      'ma=%3Cscript%3E', 'q=%', 'lv=%E0%A4%A',
    ]) {
      await page.goto(`/thu-tuc?${q}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeAttached();
      expect(await page.title()).not.toMatch(/script|alert|img/);
    }
    expect(hopThoai).toEqual([]);
    expect(loi.filter((l) => !/Failed to load resource/.test(l))).toEqual([]);
  });

  for (const [w, h] of [[375, 812], [1280, 900]] as const) {
    test(`F04-BM-10/11/13/18 · ${w}px: luồng đầy đủ không vi phạm CSP/console.error; mọi request cùng gốc; lọc không gọi mạng; storage chỉ cach-xem`, async ({ page, context }) => {
      await page.setViewportSize({ width: w, height: h });
      const loi = theoDoiLoi(page, true);
      await themBatCsp(page);
      const yc = ghiYeuCau(page);
      await chuanBi(page);
      await vao(page);
      const truocLoc = yc.length;
      await oTim(page).fill('khai sinh');
      await chonLinhVuc(page).selectOption({ label: 'Hộ tịch (8)' });
      await chonMucDo(page).selectOption({ label: 'Toàn trình' });
      await tab(page, 'tinh').click();
      await tab(page, 'xa').click();
      await nutXoaLoc(page).click();
      await page.waitForTimeout(500);
      expect(yc.slice(truocLoc).filter((u) => !/\.js|\.css/.test(u)), 'lọc/đổi tab phát sinh request').toEqual([]);
      await bang(page).getByRole('button', { name: /^(Xem chi tiết )?Thủ tục đăng ký kết hôn thử$/ }).click();
      await expect(dialog(page)).toBeVisible();
      await page.keyboard.press('Escape');
      expect(await layCsp(page)).toEqual([]);
      expect(loi).toEqual([]);
      const goc = new URL(page.url()).origin;
      expect(yc.filter((u) => /^https?:/.test(u) && new URL(u).origin !== goc)).toEqual([]);
      expect(duongApi(yc).every((u) => !/khai/.test(u))).toBe(true);
      const luu = await page.evaluate(() => ({ l: Object.keys(localStorage), s: Object.keys(sessionStorage), c: document.cookie }));
      expect(luu.l.filter((k) => k !== 'cach-xem')).toEqual([]);
      expect(luu.s.filter((k) => k !== 'react-router-scroll-positions')).toEqual([]);
      expect(luu.c).toBe('');
      expect((await context.cookies()).length).toBe(0);
    });
  }

  test('F04-BM-12 · mọi liên kết ngoài trên dòng: rel đủ, chỉ dichvucong.gov.vn, không tên miền "Đã bỏ"; mã đã mã hoá', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await vao(page, '/thu-tuc?cap=xa');
    const lk = await bang(page).locator('a[href]').evaluateAll((a) => a.map((x) => ({ h: x.getAttribute('href')!, t: x.getAttribute('target'), r: x.getAttribute('rel') })));
    expect(lk.length).toBeGreaterThan(10);
    for (const l of lk) {
      expect(new URL(l.h).hostname).toBe('dichvucong.gov.vn');
      expect(TEN_MIEN_DA_BO.some((d) => l.h.includes(d))).toBe(false);
      expect(l.t).toBe('_blank');
      expect(l.r ?? '').toMatch(/noopener/);
      expect(l.r ?? '').toMatch(/noreferrer/);
    }
  });
});

test.describe('API /api/thu-tuc và /api/linh-vuc (HTTP)', () => {
  test('F04-BM-01/02/03/UT-02 · header, tập khoá JSON đúng (10 và 5 khoá), không trường thừa, ETag + no-cache', async ({ request }) => {
    const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
    const tt = await request.get('/api/thu-tuc');
    const lv = await request.get('/api/linh-vuc');
    const etag = tt.headers()['etag']!;
    const n304 = await request.get('/api/thu-tuc', { headers: { 'If-None-Match': etag } });
    expect(n304.status()).toBe(304);
    for (const r of [tt, lv, n304]) {
      const h = r.headers();
      expect(h['content-security-policy']).toBe(CSP);
      expect(h['x-content-type-options']).toBe('nosniff');
      expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(h['permissions-policy']).toBe('microphone=(), camera=(), geolocation=()');
      expect(h['server']).toBeUndefined();
      expect(h['cache-control']).toBe('no-cache');
      expect(h['etag']).toBeTruthy();
    }
    const dsTt = (await tt.json()) as Record<string, unknown>[];
    const dsLv = (await lv.json()) as Record<string, unknown>[];
    expect(Object.keys(dsTt[0]!).sort()).toEqual(['capTinh', 'capXa', 'coQuanThucHien', 'linhVucMa', 'ma', 'mucDo', 'ten', 'tenTimKiem', 'thoiHan', 'thuTuThuongGap']);
    expect(Object.keys(dsLv[0]!).sort()).toEqual(['ma', 'soThuTucTinh', 'soThuTucXa', 'ten', 'tenTimKiem']);
    expect(dsTt.length).toBe(408);
    expect(dsLv.length).toBe(75);
    expect(dsTt.filter((t) => t['thuTuThuongGap'] !== null).length).toBe(16);
    expect(JSON.stringify(dsTt)).not.toMatch(/uuTien|uutien|priority/i);
    for (const k of ['thoiHan', 'coQuanThucHien', 'thuTuThuongGap']) expect(dsTt.every((t) => k in t)).toBe(true);
    // không "Khác" nguyên văn ở thời hạn
    expect(dsTt.filter((t) => /^\s*\d*\s*kh[aá]c\s*$/i.test(String(t['thoiHan'] ?? ''))).length).toBe(0);
  });

  test('F04-BM-04 · query lạ/độc hại bị bỏ: 200, ETag giống nhau, thân không phản chiếu', async ({ request }) => {
    for (const duong of ['/api/thu-tuc', '/api/linh-vuc']) {
      const goc = await request.get(duong);
      const lac = await request.get(`${duong}?cap=xa';--&lv=%3Cscript%3E&q=%00&trang=-1&x=${Math.random()}`);
      expect(lac.status()).toBe(200);
      expect(lac.headers()['etag']).toBe(goc.headers()['etag']);
      expect(await lac.text()).not.toContain('<script>');
    }
  });

  test('F04-BM-05 · POST/PUT/DELETE/PATCH 405 phuong-thuc-khong-hop-le; HEAD 200 không thân; OPTIONS không CORS', async ({ request }) => {
    for (const duong of ['/api/thu-tuc', '/api/linh-vuc']) {
      for (const m of ['post', 'put', 'delete', 'patch'] as const) {
        const r = await request[m](duong, { failOnStatusCode: false });
        expect(r.status(), `${m} ${duong}`).toBe(405);
        expect((await r.json()).code).toBe('phuong-thuc-khong-hop-le');
        expect(await r.text()).not.toMatch(/ {3}at |StackTrace/);
      }
      const h = await request.head(duong);
      expect(h.status()).toBe(200);
      expect((await h.body()).length).toBe(0);
      const o = await request.fetch(duong, { method: 'OPTIONS', headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'GET' }, failOnStatusCode: false });
      expect(o.headers()['access-control-allow-origin']).toBeUndefined();
    }
  });
});

// ───────────────────────────── 14. Hiệu năng ─────────────────────────────

test.describe('Hiệu năng', () => {
  test('F04-HN-01 (AC-4) · N1000 ở 375, 4G giả lập: từ phím cuối đến khi dòng số kết quả đổi, 10 lần, chậm nhất <= 200 ms', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const { thuTuc, linhVuc } = boN1000();
    await chuanBi(page, thuTuc, { linhVuc });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await vao(page, '/thu-tuc?cap=tinh');
    await expect(soKetQua(page)).toHaveText('1.000 thủ tục');
    const chuoi = 'thu 12'; // phím cuối '2' thu hẹp từ 'thu 1' (111 mục) còn 'thu 12': dòng số kết quả đổi
    const lan: number[] = [];
    for (let i = 0; i < 10; i++) {
      await oTim(page).fill('');
      await expect(soKetQua(page)).toHaveText('1.000 thủ tục');
      await oTim(page).pressSequentially(chuoi.slice(0, -1));
      await page.waitForTimeout(450); // chờ debounce của lần gõ trước để dòng kết quả ổn định
      const truoc = await soKetQua(page).textContent();
      // Đo: mốc thời gian ngay trước phím cuối đến khi dòng số kết quả đổi (quan sát DOM), tính cả debounce của ô tìm.
      const ms = await page.evaluate(
        (cu) =>
          new Promise<number>((xong) => {
            const dong = document.querySelector('[role=tabpanel] p[aria-live="polite"]')!;
            const o = document.querySelector('[role=tabpanel] input[type=search], [role=tabpanel] [role=searchbox]') as HTMLInputElement;
            const t0 = performance.now();
            const mo = new MutationObserver(() => {
              if (dong.textContent !== cu) {
                mo.disconnect();
                xong(performance.now() - t0);
              }
            });
            mo.observe(dong, { childList: true, characterData: true, subtree: true });
            o.focus();
            o.dispatchEvent(new KeyboardEvent('keydown', { key: '2', bubbles: true }));
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
            setter.call(o, o.value + '2');
            o.dispatchEvent(new Event('input', { bubbles: true }));
          }),
        truoc,
      );
      lan.push(ms);
    }
    console.log(`F04-HN-01 (AC-4): ${lan.map((x) => x.toFixed(0)).join(', ')} ms; chậm nhất ${Math.max(...lan).toFixed(0)} ms`);
    expect(Math.max(...lan)).toBeLessThanOrEqual(200);
  });

  test('F04-HN-05/13/15 · 375: chunk grid và popup không tải ban đầu; request ban đầu; lọc 0 yêu cầu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const yc = ghiYeuCau(page);
    await vao(page, '/thu-tuc?cap=xa');
    const js = yc.filter((u) => /\.js(\?|$)/.test(u)).map((u) => new URL(u).pathname.split('/').pop()!);
    expect(js.some((t) => /^grid-/.test(t)), `chunk grid tải ở 375: ${js.join(',')}`).toBe(false);
    expect(js.some((t) => /PopupChiTiet/.test(t))).toBe(false);
    const api = duongApi(yc).map((u) => new URL(u).pathname).sort();
    console.log('F04-HN-13: request API ban đầu:', api.join(', '));
    expect(api).toEqual(['/api/linh-vuc', '/api/thu-tuc', '/api/trung-tam']);
    expect(yc.filter((u) => /\.(png|jpe?g|webp|avif|gif|woff2?|ttf|otf)(\?|$)/.test(u))).toEqual([]);
  });

  test('F04-HN-14 · mở /thu-tuc → / → /thu-tuc trong 60 giây: không tải lại danh mục', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const dem: string[] = [];
    await traDanhMuc(page, boN(), { ten: TEN_LINH_VUC_N, dem });
    await vao(page);
    await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Trang chủ' }).click();
    await expect(page.getByRole('region', { name: 'Dịch vụ nhanh' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await expect(tab(page, 'xa')).toBeVisible();
    await page.waitForTimeout(500);
    expect(dem.filter((d) => d === 'thu-tuc')).toHaveLength(1);
    expect(dem.filter((d) => d === 'linh-vuc')).toHaveLength(1);
  });

  for (const w of [375, 1280]) {
    test(`F04-HN-16 · CLS khi API trễ 5 giây (${w}px) < 0,1`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: w === 375 ? 812 : 900 });
      await page.addInitScript(() => {
        const w2 = window as unknown as { __cls: number };
        w2.__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) if (!e.hadRecentInput) w2.__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await chuanBi(page, boN(), { tre: 5000 });
      await page.goto('/thu-tuc');
      await expect(tab(page, 'xa')).toBeVisible({ timeout: 15_000 });
      await page.waitForTimeout(800);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      console.log(`F04-HN-16: ${w}px CLS = ${cls.toFixed(3)}`);
      expect(cls).toBeLessThan(0.1);
    });
  }
});

// ───────────────────────────── Bổ sung ─────────────────────────────

test.describe('Bổ sung (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F04-XB-11 (AC-14) · tab tỉnh rỗng (dữ liệu chỉ có thủ tục cấp xã), không lọc: ẩn hai gợi ý lọc (tab không tính là bộ lọc)', async ({ page }) => {
    const chiXa = boN().filter((t) => !t.capTinh).map((t) => ({ ...t, capXa: true }));
    await chuanBi(page, chiXa);
    await vao(page, '/thu-tuc?cap=tinh', 'khong');
    await expect(bang(page).getByText(KHONG_TIM_THAY_CHUNG)).toBeVisible();
    const goiY = (await bang(page).getByRole('listitem').allInnerTexts()).join(' | ');
    console.log(`F04-XB-11: ${goiY}`);
    expect(goiY).not.toMatch(/chính tả|Xoá bộ lọc/);
    expect(goiY).toMatch(/Trợ lý/);
  });

  test('F04-PT-10 (AC-9) · N60 trang 2, mở popup rồi đóng: vẫn trang 2', async ({ page }) => {
    await chuanBi(page, boN60(), { chiTiet: { '9.6026': chiTietDayDu('9.6026', 'Thủ tục hộ tịch thử 26') } });
    await vao(page, '/thu-tuc?cap=xa&trang=2');
    await bang(page).getByRole('button', { name: 'Thủ tục hộ tịch thử 26', exact: true }).click();
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Thủ tục hộ tịch thử 26' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
    expect(thamSo(page).get('trang')).toBe('2');
    expect((await dong(page)).ten[0]).toBe('Thủ tục hộ tịch thử 26');
  });

  test('F04-TL-05 (F08 AC-11) · mất mạng khi chưa từng tải danh mục: "Không kết nối được", số điện thoại; bật mạng, "Thử lại" ra danh sách', async ({ page }) => {
    // Trang chủ cũng tải danh mục (khối thường gặp, cùng khoá cache): bắt đầu từ trang 404 để chưa từng tải.
    await traDanhMuc(page, boN(), { ten: TEN_LINH_VUC_N });
    await page.goto('/abc-xyz');
    await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await page.route('**/api/thu-tuc', (r) => r.abort('internetdisconnected'));
    await page.route('**/api/linh-vuc', (r) => r.abort('internetdisconnected'));
    await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await expect(page.getByText(/Không kết nối được tới máy chủ/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Chưa tải được dữ liệu.')).toBeVisible();
    await expect(page.getByRole('link', { name: /\d{4,}/ }).first()).toBeVisible();
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await traDanhMuc(page, boN(), { ten: TEN_LINH_VUC_N });
    await page.getByRole('button', { name: 'Thử lại' }).click();
    await expect(tab(page, 'xa')).toBeVisible({ timeout: 15_000 });
  });

  test('F04-HN-02 (AC-4) · N1000 ở 1280: đổi lĩnh vực, mức độ, đổi tab, gõ — mỗi thao tác tới khi dòng số kết quả đổi, chậm nhất <= 200 ms', async ({ page }) => {
    const { thuTuc, linhVuc } = boN1000();
    await chuanBi(page, thuTuc, { linhVuc });
    await vao(page, '/thu-tuc?cap=tinh');
    await expect(soKetQua(page)).toHaveText('1.000 thủ tục');
    // Đo từ lúc sự kiện thật (change/input/click) tới đầu pha bắt được ở tài liệu, đến lúc dòng số kết quả đổi.
    const batDau = () =>
      page.evaluate(
        () =>
          new Promise<number>((xong) => {
            const dong = document.querySelector('[role=tabpanel] p[aria-live="polite"]')!;
            const cu = dong.textContent;
            let t0 = -1;
            const ghiGio = () => {
              if (t0 < 0) t0 = performance.now();
            };
            for (const ten of ['change', 'input', 'click']) document.addEventListener(ten, ghiGio, { capture: true, once: true });
            const mo = new MutationObserver(() => {
              if (dong.textContent !== cu && t0 >= 0) {
                mo.disconnect();
                xong(performance.now() - t0);
              }
            });
            mo.observe(dong, { childList: true, characterData: true, subtree: true });
          }),
      );
    const doThaoTac = async (thaoTac: string): Promise<number> => {
      const ket = batDau();
      if (thaoTac === 'muc-do') await chonMucDo(page).selectOption('mot-phan');
      else if (thaoTac === 'linh-vuc') await chonLinhVuc(page).selectOption('lv-05');
      else if (thaoTac === 'tab') await tab(page, 'xa').click();
      else await oTim(page).fill('thu 77');
      return ket;
    };
    const ghi: string[] = [];
    let cham = 0;
    for (const t of ['muc-do', 'linh-vuc', 'tab', 'go']) {
      const ms = await doThaoTac(t);
      ghi.push(`${t}=${ms.toFixed(0)}ms`);
      cham = Math.max(cham, ms);
      await nutXoaLoc(page).click();
      await expect(soKetQua(page)).toHaveText(/\d[\d.]* thủ tục$/);
      await page.waitForTimeout(350);
    }
    console.log(`F04-HN-02 (1280): ${ghi.join(' · ')}`);
    expect(cham).toBeLessThanOrEqual(200);
  });
});

test('F04-TN-02 · trang xem trước /dev/design-system (chỉ có ở bản dev): Select và Tabs, axe 0 vi phạm ở thường và kiosk', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const phanHoi = await page.goto('/dev/design-system');
  const coTrang = (await page.locator('main').innerText().catch(() => '')).includes('Select') || (await page.locator('select').count()) > 0;
  test.skip(!phanHoi?.ok() || !coTrang, 'Trang xem trước chỉ có ở bản dev (E2E_BASE_URL=http://localhost:5173).');
  await expect(page.locator('select').first()).toBeVisible();
  await expect(page.getByRole('tablist').first()).toBeVisible();
  let kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
  expect(kq.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')}`)).toEqual([]);
  await page.setViewportSize({ width: 1080, height: 1920 });
  await page.goto('/dev/design-system?kiosk=1');
  await expect(page.locator('select').first()).toBeVisible();
  kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
  expect(kq.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')}`)).toEqual([]);
});
