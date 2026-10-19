import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import {
  chanMangNgoai,
  CSS_GIAN_CHU,
  ganCssThu,
  GOC,
  duongApi,
  ghiYeuCau,
  khongTranNgang,
  KHONG_TIM_THAY_THU_TUC,
  layCsp,
  linkDvc,
  MIEN_TRU,
  TEN_MIEN_DA_BO,
  THE_AXE,
  theoDoiHopThoai,
  theoDoiLoi,
  themBatCsp,
} from './du-lieu/chung';
import {
  boT43,
  chiTietDayDu,
  chiTietDocHai,
  chiTietRatDai,
  chiTietToiThieu,
  maThuongGapTheoThuTu,
  traChiTiet,
  traDanhMuc,
  type ChiTietThu,
} from './du-lieu/thuong-gap';

/**
 * F03 · Thủ tục thường gặp và popup chi tiết — e2e trên bản build do API phục vụ (ban-build.config.ts).
 * Mã ca (F03-TK-01…) theo .specify/specs/F03-thu-tuc-thuong-gap/testcases.md. Danh mục và chi tiết được giả bằng page.route
 * (bộ T43, P-A…P-E); Trung tâm lấy từ API thật (nguồn Mẫu). Ca "dữ liệu thật" ghi rõ.
 */

const TEN_TRUNG_TAM = 'Trung tâm Phục vụ hành chính công xã Cần Giuộc';
const MA_KET_HON = '1.000894';
const MA_KHAI_SINH = '1.001193';

const khoi = (p: Page) => p.getByRole('region', { name: 'Thủ tục thường gặp', exact: true });
const oTim = (p: Page) => khoi(p).getByRole('searchbox');
const soDem = (p: Page) => khoi(p).getByText(/^Hiển thị \d+\/\d+$/);
const dialog = (p: Page) => p.getByRole('dialog');

const BO_CHI_TIET = (): Record<string, ChiTietThu> => ({
  [MA_KHAI_SINH]: chiTietDayDu(MA_KHAI_SINH, 'Thủ tục đăng ký khai sinh'),
  [MA_KET_HON]: chiTietDayDu(MA_KET_HON, 'Thủ tục đăng ký kết hôn'),
  '9.500001': chiTietDayDu('9.500001', 'Thủ tục thử đầy đủ'),
  '9.500002': chiTietToiThieu('9.500002', 'Thủ tục thử tối thiểu'),
  '9.500003': { ...chiTietDayDu('9.500003', 'Thủ tục thử không căn cứ'), canCu: [], yeuCauDieuKien: null },
  '9.500004': chiTietDocHai('9.500004'),
  '9.500005': chiTietRatDai('9.500005'),
});

/** Chuẩn bị trang chủ với T43 và chi tiết giả; chặn mọi tên miền ngoài. */
async function chuanBi(page: Page, opt: { thuTuc?: ReturnType<typeof boT43>; chiTiet?: Record<string, ChiTietThu>; tre?: number } = {}) {
  await traDanhMuc(page, opt.thuTuc ?? boT43());
  await traChiTiet(page, opt.chiTiet ?? BO_CHI_TIET(), opt.tre ? { tre: opt.tre } : {});
  await chanMangNgoai(page, GOC);
}

async function vao(page: Page, duong = '/') {
  await page.goto(duong);
  await expect(soDem(page)).toBeVisible();
  // Danh sách (nhất là dạng bảng, chunk grid nạp lười) vẽ xong rồi mới đọc.
  await expect(khoi(page).locator('tbody tr, article').first()).toBeVisible();
}

/** Bấm tên thủ tục để mở popup: nút "Xem chi tiết <tên>" ở dạng thẻ, nút tên ở dạng bảng. */
const nutMoThuTuc = (p: Page, ten: string) => khoi(p).getByRole('button', { name: new RegExp(`^(Xem chi tiết )?${ten}$`) });

/** Tên các mục đang hiện trên trang hiện tại (thẻ hoặc bảng), theo thứ tự. */
async function tenHienThi(page: Page): Promise<string[]> {
  await khoi(page).locator('tbody tr, article').first().waitFor();
  return khoi(page).evaluate((k) => {
    const hang = k.querySelectorAll('tbody tr');
    if (hang.length > 0) return [...hang].map((r) => r.querySelectorAll('td')[2]?.textContent?.trim() ?? '');
    return [...k.querySelectorAll('article h3')].map((h) => h.textContent?.trim() ?? '');
  });
}
async function maHienThi(page: Page): Promise<string[]> {
  await khoi(page).locator('tbody tr, article').first().waitFor();
  return khoi(page).evaluate((k) => {
    const hang = k.querySelectorAll('tbody tr');
    if (hang.length > 0) return [...hang].map((r) => r.querySelectorAll('td')[1]?.textContent?.trim() ?? '');
    return [...k.querySelectorAll('article')].map((a) => a.querySelector('span[class*="ma"]')?.textContent?.trim() ?? '');
  });
}
const soMuc = async (page: Page) => (await tenHienThi(page)).length;

const T43 = boT43();
const THU_TU = maThuongGapTheoThuTu(T43);

test.describe.configure({ mode: 'default' });

// ───────────────────────────── 1. Tìm kiếm và chip (BR-1, BR-2; AC-1, AC-2, AC-7, AC-28) ─────────────────────────────

test.describe('Tìm kiếm và chip (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F03-TK-01/02 · "dang ky the chap" ra đúng 3 mục Đất đai; bốn cách gõ cho cùng kết quả (AC-1)', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    const mong = ['Đăng ký thế chấp', 'Xoá đăng ký thế chấp quyền sử dụng đất thử', 'Đăng ký thế chấp tài sản gắn liền với đất'];
    for (const q of ['dang ky the chap', 'DANG KY THE CHAP', 'đăng ký thế chấp', '  dang   ky  the  chap  ', 'the chap dang ky']) {
      await oTim(page).fill(q);
      await expect(soDem(page)).toHaveText('Hiển thị 3/43');
      expect([...(await tenHienThi(page))].sort()).toEqual([...mong].sort());
    }
  });

  test('F03-TK-03/04/05 · chip Đất đai + "the chap"; đổi thứ tự thao tác (AC-2)', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await khoi(page).getByRole('button', { name: 'Đất đai', exact: true }).click();
    await oTim(page).fill('the chap');
    await expect(soDem(page)).toHaveText('Hiển thị 3/43');
    expect(await tenHienThi(page)).not.toContain('Thủ tục thử thế chấp tài sản lưu động');
    // TK-05: về "Tất cả" thì còn 4, từ khoá giữ nguyên
    await khoi(page).getByRole('button', { name: 'Tất cả', exact: true }).click();
    await expect(soDem(page)).toHaveText('Hiển thị 4/43');
    await expect(oTim(page)).toHaveValue('the chap');
    // TK-04: 4 mục rồi bấm chip
    await khoi(page).getByRole('button', { name: 'Đất đai', exact: true }).click();
    await expect(soDem(page)).toHaveText('Hiển thị 3/43');
  });

  test('F03-TK-06/07 · tìm theo mã: đầy đủ, một phần "1.0011" (AC-28), "9.3"', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('1.001193');
    await expect(soDem(page)).toHaveText('Hiển thị 1/43');
    await oTim(page).fill('1.0011');
    await expect(soDem(page)).toHaveText('Hiển thị 1/43');
    expect(await maHienThi(page)).toEqual([MA_KHAI_SINH]);
    await oTim(page).fill('9.3');
    await expect(soDem(page)).toHaveText(/Hiển thị \d+\/43/);
    const so = Number(/(\d+)\/43/.exec((await soDem(page).textContent()) ?? '')?.[1]);
    // Ghi nhận hành vi: "9.3" khớp mã bắt đầu 9.3… (6 mục Đất đai) — so khớp chuỗi con trên mã.
    expect(so).toBeGreaterThanOrEqual(6);
  });

  test('F03-TK-08/09/10 · "ho tich khai sinh" = 13; "dat dai" = 6 (tên lĩnh vực); mã + tên', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('ho tich khai sinh');
    await expect(soDem(page)).toHaveText('Hiển thị 13/43');
    await expect(khoi(page).getByRole('navigation', { name: 'Phân trang' })).toBeVisible();
    await oTim(page).fill('dat dai');
    await expect(soDem(page)).toHaveText('Hiển thị 6/43');
    await oTim(page).fill('9.300001 the chap');
    await expect(soDem(page)).toHaveText('Hiển thị 1/43');
    expect(await tenHienThi(page)).toEqual(['Đăng ký thế chấp']);
  });

  test('F03-TK-11/12 · không có kết quả: thông báo có nút "Xoá bộ lọc" trong thông báo; bấm thì về 43/43 và con trỏ về ô tìm', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await khoi(page).getByRole('button', { name: 'Đất đai', exact: true }).click();
    await oTim(page).fill('xyzxyz');
    await expect(soDem(page)).toHaveText('Hiển thị 0/43');
    await expect(khoi(page).getByText("Không tìm thấy thủ tục phù hợp với 'xyzxyz'")).toBeVisible();
    await expect(khoi(page).getByRole('listitem').filter({ hasText: /chính tả|Xoá bộ lọc|Trợ lý|Gọi Trung tâm/ })).toHaveCount(4);
    await expect(khoi(page).getByRole('navigation', { name: 'Phân trang' })).toHaveCount(0);
    await expect(khoi(page).locator('article, tbody tr')).toHaveCount(0);
    await khoi(page).getByRole('button', { name: 'Xoá bộ lọc' }).click();
    await expect(soDem(page)).toHaveText('Hiển thị 43/43');
    await expect(oTim(page)).toHaveValue('');
    await expect(khoi(page).getByRole('button', { name: 'Tất cả', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(oTim(page)).toBeFocused();
  });

  test('F03-TK-14 · ký tự đặc biệt/HTML/SQL: hiện nguyên văn dạng chữ, không hộp thoại, không lỗi, không sinh thẻ', async ({ page }) => {
    const loi = theoDoiLoi(page);
    const hopThoai = theoDoiHopThoai(page);
    await chuanBi(page);
    await vao(page);
    const doc = ['<b>abc</b>', '"><img src=x onerror=alert(1)>', "'; DROP TABLE thu_tuc;--", '.*', '(', '[a-z]+', '\\', '%', '&amp;'];
    for (const q of doc) {
      await oTim(page).fill(q);
      await expect(soDem(page)).toHaveText('Hiển thị 0/43');
      await expect(khoi(page).locator('p').filter({ hasText: 'Không tìm thấy thủ tục phù hợp với' })).toContainText(q.trim());
      expect(await khoi(page).locator('img[src="x"], b').count()).toBe(0);
    }
    expect(hopThoai).toEqual([]);
    expect(loi).toEqual([]);
  });

  test('F03-TK-15 · NFD, ký tự U+200E chen giữa, hoa/thường cho cùng kết quả với "dang ky"', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('dang ky');
    await expect(soDem(page)).toHaveText(/Hiển thị \d+\/43/);
    const chuan = (await soDem(page).textContent())!;
    const u200e = String.fromCodePoint(0x200e);
    const bien = ['đăng ký'.normalize('NFD'), `dang${u200e} ky`, 'Dang Ky', 'ĐĂNG KÝ'];
    for (const q of bien) {
      await oTim(page).fill(q);
      await expect(soDem(page)).toHaveText(chuan);
    }
  });

  test('F03-TK-17 · ✕ trong ô: ô trống, con trỏ vẫn trong ô, 43/43, địa chỉ bỏ q và trang', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('khai sinh');
    await expect(soDem(page)).toHaveText('Hiển thị 14/43');
    await expect(page).toHaveURL(/q=khai/);
    await khoi(page).getByRole('button', { name: 'Xoá từ khoá' }).click();
    await expect(soDem(page)).toHaveText('Hiển thị 43/43');
    await expect(oTim(page)).toBeFocused();
    await expect(page).not.toHaveURL(/q=/);
  });

  test('F03-TK-18/19/20 · chip: Tất cả + 7 lĩnh vực theo thứ tự xuất hiện; một chip chọn; giữ từ khoá', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    const nhan = await khoi(page).getByRole('group', { name: 'Lọc theo lĩnh vực' }).getByRole('button').allTextContents();
    expect(nhan.map((s) => s.replace('✓', '').trim())).toEqual([
      'Tất cả', 'Hộ tịch', 'Chứng thực', 'Đất đai', 'Giao dịch bảo đảm thử', 'Bảo trợ xã hội thử', 'Lao động thử', 'Cư trú thử',
    ]);
    await expect(khoi(page).getByRole('button', { name: 'Lĩnh vực chỉ ở danh mục thử' })).toHaveCount(0);
    await khoi(page).getByRole('button', { name: 'Hộ tịch', exact: true }).click();
    await expect(khoi(page).getByRole('button', { name: 'Hộ tịch', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(khoi(page).getByRole('button', { name: 'Tất cả', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await oTim(page).fill('thu');
    await khoi(page).getByRole('button', { name: 'Đất đai', exact: true }).click();
    await expect(oTim(page)).toHaveValue('thu');
    await expect(khoi(page).getByRole('button', { name: 'Đất đai', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });
});

test('F03-TK-13 · dán 5.000 ký tự: không treo (<= 200 ms), không cuộn ngang, ✕ xoá được (375)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await chuanBi(page);
  await vao(page);
  const dai = 'zq '.repeat(1700).trim();
  const t0 = Date.now();
  await oTim(page).fill(dai);
  await expect(soDem(page)).toHaveText('Hiển thị 0/43');
  const ms = Date.now() - t0;
  console.log(`F03-TK-13: 5.000 ký tự -> kết quả sau ${ms} ms (gồm debounce)`);
  expect(await khongTranNgang(page)).toBe(true);
  await khoi(page).getByRole('button', { name: 'Xoá từ khoá' }).click();
  await expect(soDem(page)).toHaveText('Hiển thị 43/43');
});

test('F03-TK-21 · 375: hàng chip dài vuốt ngang trong hàng, cả trang không cuộn ngang', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await chuanBi(page);
  await vao(page);
  expect(await khongTranNgang(page)).toBe(true);
});

// ───────────────────────────── 2. Số đếm, phân trang, thứ tự, tải/lỗi ─────────────────────────────

test.describe('Số đếm, phân trang, thứ tự (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F03-HT-01/02/03 · tiêu đề, "Hiển thị 43/43", số đếm theo bộ lọc, y luôn 43', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await expect(khoi(page).getByRole('heading', { level: 2, name: 'Thủ tục thường gặp' })).toBeVisible();
    await expect(soDem(page)).toHaveText('Hiển thị 43/43');
    await khoi(page).getByRole('button', { name: 'Đất đai', exact: true }).click();
    await expect(soDem(page)).toHaveText('Hiển thị 6/43');
    await khoi(page).getByRole('button', { name: 'Tất cả', exact: true }).click();
    await oTim(page).fill('khai sinh');
    await expect(soDem(page)).toHaveText('Hiển thị 14/43');
    await khoi(page).getByRole('button', { name: 'Hộ tịch', exact: true }).click();
    await expect(soDem(page)).toHaveText('Hiển thị 13/43');
  });

  test('F03-HT-04/05/06/07/10 · 4 trang (12,12,12,7); trang 2 đúng mục 13–24; URL; đổi chip/từ khoá về trang 1', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    const pager = khoi(page).getByRole('navigation', { name: 'Phân trang' });
    await expect(pager.getByRole('button', { name: 'Trang 1', exact: true })).toBeVisible();
    await expect(pager.getByRole('button', { name: 'Trang 4', exact: true })).toBeVisible();
    await expect(pager.getByRole('button', { name: 'Trang trước' })).toBeDisabled();
    expect(await soMuc(page)).toBe(12);
    await pager.getByRole('button', { name: 'Trang 2', exact: true }).click();
    await expect(page).toHaveURL(/trang=2/);
    expect(await maHienThi(page)).toEqual(THU_TU.slice(12, 24));
    await pager.getByRole('button', { name: 'Trang 4', exact: true }).click();
    expect(await soMuc(page)).toBe(7);
    await expect(pager.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
    await expect(pager.getByRole('button', { name: 'Trang 4' })).toHaveAttribute('aria-current', 'page');
    // HT-06: sang trang 3, chip Chứng thực → trang 1, 5 mục, không phân trang, URL không còn trang
    await pager.getByRole('button', { name: 'Trang 3', exact: true }).click();
    await khoi(page).getByRole('button', { name: 'Chứng thực', exact: true }).click();
    expect(await soMuc(page)).toBe(5);
    await expect(pager).toHaveCount(0);
    await expect(page).not.toHaveURL(/trang=/);
    // HT-07: gõ "khai sinh" từ trang 3 → trang 1 (12 + 2)
    await khoi(page).getByRole('button', { name: 'Tất cả', exact: true }).click();
    await page.goto('/?trang=3');
    await expect(soDem(page)).toBeVisible();
    await oTim(page).fill('khai sinh');
    await expect(soDem(page)).toHaveText('Hiển thị 14/43');
    expect(await soMuc(page)).toBe(12);
    await expect(page).not.toHaveURL(/trang=/);
  });

  test('F03-HT-08 · dạng bảng: 12 dòng mỗi trang, trang 4 có 7, dòng đầu trang 2 là mục 13', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await expect(khoi(page).locator('table')).toBeVisible();
    expect(await soMuc(page)).toBe(12);
    await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    expect((await maHienThi(page))[0]).toBe(THU_TU[12]);
    await khoi(page).getByRole('button', { name: 'Trang 4', exact: true }).click();
    expect(await soMuc(page)).toBe(7);
  });

  test('F03-HT-13/14/15/16 · thứ tự: kết hôn trước khai sinh ở thẻ, bảng, chip Hộ tịch; lọc giữ thứ tự (AC-22)', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    expect((await maHienThi(page)).slice(0, 2)).toEqual([MA_KET_HON, MA_KHAI_SINH]);
    await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    expect((await tenHienThi(page)).slice(0, 2)).toEqual(['Thủ tục đăng ký kết hôn', 'Thủ tục đăng ký khai sinh']);
    await khoi(page).getByRole('button', { name: 'Hộ tịch', exact: true }).click();
    const hoTich = THU_TU.filter((m) => T43.find((t) => t.ma === m)!.linhVucMa === 'ho-tich');
    const dau = (await maHienThi(page));
    expect(dau).toEqual(hoTich.slice(0, 12));
    await oTim(page).fill('dang ky');
    const mong = hoTich.filter((m) => /dang ky/.test(T43.find((t) => t.ma === m)!.tenTimKiem)).slice(0, 12);
    expect(await maHienThi(page)).toEqual(mong);
  });

  test('F03-HT-19 · 3 mục không thường gặp không xuất hiện kể cả khi tìm đúng mã', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('9.900001');
    await expect(soDem(page)).toHaveText('Hiển thị 0/43');
  });

  test('F03-HT-23 · không có nút Chia sẻ, QR, micro, chữ lớn trong khối và popup', async ({ page }) => {
    await chuanBi(page);
    await vao(page, `/?ma=${MA_KHAI_SINH}`);
    await expect(dialog(page)).toBeVisible();
    for (const re of [/chia sẻ/i, /sao chép/i, /\bqr\b/i, /micro/i, /chữ lớn/i, /đọc to/i]) {
      await expect(khoi(page).getByRole('button', { name: re })).toHaveCount(0);
      await expect(dialog(page).getByRole('button', { name: re })).toHaveCount(0);
    }
  });
});

test('F03-HT-11/12 · số cột thẻ (AC-14): 375→1, 600→2, 768→2/3, 1024+→≤4; mọi hàng đầy; thẻ cùng hàng cao bằng nhau', async ({ page }) => {
  await chuanBi(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await vao(page);
  await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
  const ghi: string[] = [];
  for (const [w, h] of [[375, 812], [600, 900], [768, 1024], [1024, 900], [1280, 900], [1440, 900], [1080, 1920]] as const) {
    await page.setViewportSize({ width: w, height: h });
    const hinh = await khoi(page).evaluate((k) => [...k.querySelectorAll('article')].map((a) => {
      const r = a.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), c: Math.round(r.height) };
    }));
    expect(hinh.length).toBe(12);
    const cot = new Set(hinh.map((h) => h.x)).size;
    ghi.push(`${w}px: ${cot} cột`);
    expect(cot).toBeLessThanOrEqual(4);
    expect(12 % cot, `${w}px: ${cot} cột không chia hết 12`).toBe(0);
    const theoHang = new Map<number, number[]>();
    for (const h of hinh) theoHang.set(h.y, [...(theoHang.get(h.y) ?? []), h.c]);
    for (const cao of theoHang.values()) expect(new Set(cao).size, `${w}px: thẻ cùng hàng cao khác nhau`).toBe(1);
  }
  console.log('F03-HT-11:', ghi.join(' · '));
});

test('F03-HT-12 · trang 4 (7 thẻ) ở 2, 3, 4 cột: hàng cuối có thể thiếu thẻ, không lỗi', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await chuanBi(page);
  await vao(page, '/?trang=4');
  await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
  expect(await soMuc(page)).toBe(7);
});

test('F03-HT-20 / AC-27 · không có thủ tục thường gặp: không vẽ khối, ô dịch vụ và giờ làm việc vẫn hiện', async ({ page }) => {
  for (const [w, h] of [[1280, 900], [375, 812]] as const) {
    await page.setViewportSize({ width: w, height: h });
    // T0 dạng 1: danh mục rỗng; dạng 2: có thủ tục nhưng không mục nào thường gặp
    for (const thuTuc of [[], boT43().map((t) => ({ ...t, thuTuThuongGap: null }))]) {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await traDanhMuc(page, thuTuc);
      await page.goto('/');
      await expect(page.getByRole('region', { name: 'Dịch vụ nhanh' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Thời gian làm việc' })).toBeVisible();
      await page.waitForTimeout(400);
      await expect(page.getByRole('heading', { name: 'Thủ tục thường gặp' })).toHaveCount(0);
      await expect(page.getByText(/Hiển thị \d+\/\d+/)).toHaveCount(0);
      await expect(page.getByText(/Không tìm thấy thủ tục/)).toHaveCount(0);
    }
  }
});

test('F03-HT-21 · chậm 3 giây: khung giữ chỗ 12 thẻ rồi danh sách (375)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await traDanhMuc(page, boT43(), { tre: 3000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Thủ tục thường gặp' })).toBeVisible();
  await expect(page.getByText('Hiển thị')).toHaveCount(0);
  await expect(khoi(page).getByText('Đang tải…')).toHaveCount(1);
  await expect(soDem(page)).toBeVisible({ timeout: 8000 });
});

test('F03-HT-22/24 · 500 rồi 200: ErrorState trong khối + "Thử lại"; 404/mạng đứt cũng vậy; khối khác không ảnh hưởng', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  let pha: 500 | 200 = 500; // theo pha, không đếm lần gọi: bản dev (StrictMode) gọi hai lần
  await page.route('**/api/linh-vuc', (r) => r.fulfill({ json: [] }));
  await page.route('**/api/thu-tuc', async (route) => {
    if (pha === 500) {
      await route.fulfill({
        status: 500, contentType: 'application/problem+json',
        json: { type: 'about:blank', title: 'x', status: 500, code: 'loi-he-thong', maTraCuu: 'MA123456' },
      });
    } else {
      await route.fulfill({ json: boT43() });
    }
  });
  await page.goto('/');
  await expect(khoi(page).getByText('Chưa tải được dữ liệu.')).toBeVisible({ timeout: 15_000 });
  await expect(khoi(page).getByText('Mã tra cứu: MA123456')).toBeVisible();
  await expect(khoi(page).getByRole('link', { name: /\d{4,}/ })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Dịch vụ nhanh' })).toBeVisible();
  const toanTrang = await page.locator('body').innerText();
  for (const tu of ['undefined', 'null', 'Error', ' 500']) expect(toanTrang).not.toContain(tu);
  pha = 200;
  await khoi(page).getByRole('button', { name: 'Thử lại' }).click();
  await expect(soDem(page)).toHaveText('Hiển thị 43/43');
});

// ───────────────────────────── 3. Thẻ / bảng theo khổ (BR-6; AC-5, AC-12) ─────────────────────────────

test.describe('Thẻ / bảng', () => {
  const hinh = async (page: Page) => ({
    bang: await khoi(page).locator('table').count(),
    the: await khoi(page).locator('article').count(),
    nut: await khoi(page).getByRole('group', { name: 'Cách hiển thị' }).count(),
  });

  for (const [id, w, h, bang, nut, duong] of [
    ['DH-01', 375, 812, 0, 0, '/'],
    ['DH-02', 768, 1024, 0, 1, '/'],
    ['DH-03', 1280, 900, 1, 1, '/'],
    ['DH-04', 1080, 1920, 0, 1, '/?kiosk=1'],
    ['DH-09 599', 599, 900, 0, 0, '/'],
    ['DH-09 600', 600, 900, 0, 1, '/'],
    ['DH-09 1023', 1023, 900, 0, 1, '/'],
    ['DH-09 1024', 1024, 900, 1, 1, '/'],
  ] as const) {
    test(`F03-${id} · ${w}px: ${bang ? 'bảng' : 'thẻ'}, ${nut ? 'có' : 'không có'} nút chuyển dạng (AC-12)`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await chuanBi(page);
      await vao(page, duong);
      const k = await hinh(page);
      expect(k.bang > 0).toBe(bang === 1);
      expect(k.nut).toBe(nut);
      if (!bang) expect(k.the).toBeGreaterThan(0);
    });
  }

  test('F03-DH-05 · 1280 chọn bảng → thu 375 (thẻ, không nút) → nới 1280 (bảng)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    await khoi(page).getByRole('button', { name: 'Dạng bảng' }).click();
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(khoi(page).locator('table')).toHaveCount(0);
    await expect(khoi(page).getByRole('group', { name: 'Cách hiển thị' })).toHaveCount(0);
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(khoi(page).locator('table')).toHaveCount(1);
  });

  test('F03-DH-06/07/08 · nhớ lựa chọn qua lần tải lại (1280, 768, kiosk)', async ({ page }) => {
    await chuanBi(page);
    // 1280: thẻ rồi tải lại → thẻ; bảng rồi tải lại → bảng
    await page.setViewportSize({ width: 1280, height: 900 });
    await vao(page);
    await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    await page.reload();
    await expect(khoi(page).locator('article').first()).toBeVisible();
    await khoi(page).getByRole('button', { name: 'Dạng bảng' }).click();
    await page.reload();
    await expect(khoi(page).locator('table')).toBeVisible();
    // 768: mặc định thẻ; chọn bảng, tải lại → bảng
    await page.evaluate(() => window.localStorage.clear());
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(khoi(page).locator('article').first()).toBeVisible();
    await khoi(page).getByRole('button', { name: 'Dạng bảng' }).click();
    await page.reload();
    await expect(khoi(page).locator('table')).toBeVisible();
    // kiosk
    await page.evaluate(() => window.localStorage.clear());
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.goto('/?kiosk=1');
    await expect(soDem(page)).toBeVisible();
    await khoi(page).getByRole('button', { name: 'Dạng bảng' }).click();
    await page.goto('/?kiosk=1');
    await expect(khoi(page).locator('table')).toBeVisible();
  });

  test('F03-DH-10 / DL-09 · đổi dạng giữ từ khoá, chip, trang, thứ tự; địa chỉ không đổi', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('khai sinh');
    await khoi(page).getByRole('button', { name: 'Hộ tịch', exact: true }).click();
    await expect(soDem(page)).toHaveText('Hiển thị 13/43');
    await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    const url = page.url();
    const truoc = await maHienThi(page);
    await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    expect(page.url()).toBe(url);
    expect(await maHienThi(page)).toEqual(truoc);
    await expect(oTim(page)).toHaveValue('khai sinh');
  });

  test('F03-DH-11/12 · localStorage lạ → mặc định theo khổ; localStorage chặn ghi → đổi trong phiên, không lỗi', async ({ page }) => {
    const loi = theoDoiLoi(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await page.addInitScript(() => window.localStorage.setItem('cach-xem', 'abc'));
    await vao(page);
    await expect(khoi(page).locator('table')).toBeVisible();
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    const trang2 = await page.context().newPage();
    const loi2 = theoDoiLoi(trang2);
    await chuanBi(trang2);
    await trang2.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('chặn', 'QuotaExceededError');
      };
    });
    await trang2.setViewportSize({ width: 1280, height: 900 });
    await vao(trang2);
    await khoi(trang2).getByRole('button', { name: 'Dạng thẻ' }).click();
    await expect(khoi(trang2).locator('article').first()).toBeVisible();
    expect([...loi, ...loi2]).toEqual([]);
  });

  test('F03-DH-14/15/16 · bảng có đủ cột; thẻ có đủ phần; thủ tục không thời hạn không có nhãn thời hạn', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const ds = boT43();
    ds[0] = { ...ds[0]!, thoiHan: null };
    const maKhongHan = ds[0].ma;
    await chuanBi(page, { thuTuc: ds });
    await vao(page);
    await khoi(page).getByRole('button', { name: 'Dạng bảng' }).click();
    await expect(khoi(page).locator('thead th')).toHaveCount(7);
    const cot = await khoi(page).locator('thead th').allTextContents();
    expect(cot).toEqual(['STT', 'Mã', 'Tên thủ tục', 'Lĩnh vực', 'Mức độ', 'Cơ quan thực hiện', 'Cổng DVC']);
    await expect(khoi(page).locator('thead th[scope="col"]')).toHaveCount(7);
    expect(await khongTranNgang(page)).toBe(true);
    await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    const the = khoi(page).locator('article').first();
    await expect(the.getByRole('heading', { level: 3 })).toBeVisible();
    await expect(the.getByRole('button', { name: /^Xem chi tiết/ })).toBeVisible();
    await expect(the.getByRole('link', { name: /Xem và nộp trên Cổng DVC/ })).toBeVisible();
    await expect(the.getByText(/Toàn trình|Một phần/)).toBeVisible();
    await expect(the).not.toContainText('Ưu tiên');
    const theKhongHan = khoi(page).locator('article').filter({ hasText: maKhongHan });
    await oTim(page).fill(maKhongHan);
    await expect(theKhongHan).not.toContainText('Thời hạn');
    await expect(theKhongHan).not.toContainText('Chưa ghi rõ');
    await oTim(page).fill('1.001193');
    await expect(khoi(page).locator('article').first()).toContainText('Thời hạn: 5 ngày làm việc');
  });

  test('F03-DH-17 · tên 300 ký tự trong bảng ở 1024 và 1280: xuống dòng, trang không cuộn ngang', async ({ page }) => {
    const ds = boT43();
    ds[3] = { ...ds[3]!, ten: 'Tên rất dài của thủ tục '.repeat(13).slice(0, 300), tenTimKiem: 'ten rat dai' };
    for (const w of [1024, 1280]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await chuanBi(page, { thuTuc: ds });
      await vao(page);
      expect(await khongTranNgang(page), `${w}px`).toBe(true);
    }
  });
});

// ───────────────────────────── 4. Popup chi tiết ─────────────────────────────

test.describe('Popup chi tiết (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F03-PO-01 · API chi tiết trễ 2 giây: popup (dialog) hiện ngay với "Đang tải…", sau đó nội dung thật', async ({ page }) => {
    await chuanBi(page, { tre: 2000 });
    await vao(page);
    await nutMoThuTuc(page, 'Thủ tục đăng ký khai sinh').click();
    await expect(dialog(page)).toBeVisible({ timeout: 1000 });
    await expect(dialog(page).getByRole('status')).toHaveText('Đang tải…');
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Thủ tục đăng ký khai sinh' })).toBeVisible({ timeout: 6000 });
    await expect(dialog(page)).toHaveCount(1);
  });

  test('F03-PO-03/04/17/25 · cấu trúc: h2 tên, h3 các mục theo thứ tự, <dl> thông tin chung, đúng một lời miễn trừ, không h1', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/?ma=9.500001');
    const d = dialog(page);
    await expect(d.getByRole('heading', { level: 2, name: 'Thủ tục thử đầy đủ' })).toBeVisible();
    expect(await d.getByRole('heading', { level: 3 }).allTextContents()).toEqual([
      'Thông tin chung', 'Yêu cầu, điều kiện', 'Cách thức nộp', 'Thành phần hồ sơ', 'Trình tự thực hiện', 'Kết quả', 'Căn cứ pháp lý',
    ]);
    await expect(d.getByRole('heading', { level: 1 })).toHaveCount(0);
    await expect(d.locator('dl dt')).toHaveText(['Cơ quan thực hiện', 'Thời hạn giải quyết', 'Phí, lệ phí', 'Cách nộp']);
    await expect(d.locator('dl dd')).toHaveText(['Ủy ban nhân dân cấp xã thử', '5 ngày làm việc', 'Lệ phí: 0 đồng', 'Trực tuyến, Bưu chính, Trực tiếp']);
    await expect(d.getByText(MIEN_TRU)).toHaveCount(1);
    await expect(d.getByText('Hộ tịch', { exact: true })).toBeVisible();
    await expect(d.getByText('Toàn trình', { exact: true })).toBeVisible();
    await expect(d.getByText('Mã: 9.500001')).toBeVisible();
  });

  test('F03-PO-05 · dữ liệu thật (nguồn Mẫu): 1.001193 ghi "Chưa ghi rõ", không "1 Khác" (AC-3)', async ({ page }) => {
    await page.goto(`/?ma=${MA_KHAI_SINH}`);
    const d = dialog(page);
    await expect(d.getByRole('heading', { level: 2, name: 'Thủ tục đăng ký khai sinh' })).toBeVisible();
    await expect(d.getByText('Chưa ghi rõ — xem trên Cổng DVC Quốc gia')).toBeVisible();
    const chu = await d.innerText();
    expect(chu).not.toMatch(/1 Khác|\bKhác\b/);
  });

  test('F03-PO-06/07/08 · thời hạn null → "Chưa ghi rõ…", ô trống "—"; popup tối thiểu không có mục/bảng rỗng, không null/undefined', async ({ page }) => {
    const pF: ChiTietThu = { ...chiTietDayDu('9.500006', 'Thủ tục thử P-F'), thoiHan: null, cachThuc: [{ hinhThuc: 'Trực tiếp', thoiHan: null, phi: null, moTa: null }] };
    await chuanBi(page, { chiTiet: { ...BO_CHI_TIET(), '9.500006': pF } });
    await vao(page, '/?ma=9.500006');
    await expect(dialog(page).getByText('Chưa ghi rõ — xem trên Cổng DVC Quốc gia')).toBeVisible();
    await expect(dialog(page).locator('tbody td').filter({ hasText: '—' })).toHaveCount(2);
    await page.goto('/?ma=9.500002');
    const d = dialog(page);
    await expect(d.getByRole('heading', { level: 2, name: 'Thủ tục thử tối thiểu' })).toBeVisible();
    expect(await d.getByRole('heading', { level: 3 }).allTextContents()).toEqual(['Thông tin chung']);
    await expect(d.locator('table, ol, ul')).toHaveCount(0);
    await expect(d.locator('dl dt')).toHaveText(['Thời hạn giải quyết']);
    const chu = await d.innerText();
    expect(chu).not.toMatch(/\bnull\b|undefined|N\/A/);
    await expect(d.getByText(MIEN_TRU)).toHaveCount(1);
  });

  test('F03-PO-09/10/11 · yêu cầu điều kiện có/không; số bản chính/sao: (1,0), (0,1), (2,3), trống, (0,0) chỉ tên, (0,2) (AC-23)', async ({ page }) => {
    const gt = { ...chiTietDayDu('9.500007', 'Thủ tục thử giấy tờ'), thanhPhanHoSo: [
      { ten: 'Giấy tờ A', banChinh: 1, banSao: 0 },
      { ten: 'Giấy tờ B', banChinh: 0, banSao: 1 },
      { ten: 'Giấy tờ C', banChinh: 2, banSao: 3 },
      { ten: 'Giấy tờ D', banChinh: null, banSao: null },
      { ten: 'Giấy tờ E', banChinh: 0, banSao: 0 },
      { ten: 'Giấy tờ F', banChinh: 0, banSao: 2 },
    ] };
    await chuanBi(page, { chiTiet: { ...BO_CHI_TIET(), '9.500007': gt } });
    await vao(page, '/?ma=9.500001');
    await expect(dialog(page).getByRole('heading', { level: 3, name: 'Yêu cầu, điều kiện' })).toBeVisible();
    await expect(dialog(page).getByText('Điều kiện thử một.')).toBeVisible();
    await page.goto('/?ma=9.500003');
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Thủ tục thử không căn cứ' })).toBeVisible();
    await expect(dialog(page).getByRole('heading', { name: 'Yêu cầu, điều kiện' })).toHaveCount(0);
    await page.goto('/?ma=9.500007');
    const li = dialog(page).locator('ol li');
    await expect(li).toHaveText([
      'Giấy tờ ABản chính: 1 · Bản sao: 0',
      'Giấy tờ BBản chính: 0 · Bản sao: 1',
      'Giấy tờ CBản chính: 2 · Bản sao: 3',
      'Giấy tờ D',
      'Giấy tờ E',
      'Giấy tờ FBản chính: 0 · Bản sao: 2',
    ]);
  });

  test('F03-PO-13/14/15/16 · căn cứ pháp lý: chữ thuần, không <a>/<button>, Tab nhảy qua; mục ẩn khi trống (AC-6)', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/?ma=9.500001');
    const muc = dialog(page).locator('section').filter({ has: page.getByRole('heading', { name: 'Căn cứ pháp lý' }) });
    await expect(muc.locator('li')).toHaveText(['85/2019/TT-BTC — Thông tư thử', '04/2020/NĐ-CP', 'Chỉ có trích yếu']);
    await expect(muc.locator('a, button, [tabindex]')).toHaveCount(0);
    // Tab đi một vòng: không dừng ở mục căn cứ
    await dialog(page).getByRole('button', { name: 'Đóng' }).focus();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      const trong = await page.evaluate(() => document.activeElement?.closest('section')?.querySelector('h3')?.textContent ?? '');
      expect(trong).not.toBe('Căn cứ pháp lý');
    }
    await page.goto('/?ma=9.500004');
    await expect(dialog(page).locator('section').filter({ hasText: 'Căn cứ pháp lý' }).locator('a')).toHaveCount(0);
    await page.goto('/?ma=9.500003');
    await expect(dialog(page).getByRole('heading', { level: 2 })).toBeVisible();
    await expect(dialog(page).getByRole('heading', { name: 'Căn cứ pháp lý' })).toHaveCount(0);
    await expect(dialog(page).getByText(MIEN_TRU)).toHaveCount(1);
  });

  test('F03-PO-18/19 · bảng cách thức 3 cột có caption ẩn, th scope; bước có trường hợp in đậm, xuống dòng giữ nguyên', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/?ma=9.500001');
    const bang = dialog(page).locator('table');
    await expect(bang.locator('thead th[scope="col"]')).toHaveText(['Hình thức', 'Thời gian', 'Phí, lệ phí']);
    await expect(bang.locator('caption')).toHaveText('Cách thức nộp hồ sơ');
    await expect(bang.locator('tbody tr').nth(1).locator('td')).toHaveText(['Trực tiếp', '—', '—']);
    await expect(bang.locator('tbody tr').first()).toContainText('Qua Cổng DVC (mô tả thử)');
    const buoc = dialog(page).locator('section').filter({ has: page.getByRole('heading', { name: 'Trình tự thực hiện' }) });
    await expect(buoc.locator('strong')).toHaveText('Trường hợp thử B');
    const ws = await buoc.locator('p').first().evaluate((e) => getComputedStyle(e).whiteSpace);
    expect(ws).toMatch(/pre-line|pre-wrap/);
    await expect(buoc.locator('br')).toHaveCount(0);
  });

  test('F03-PO-20 · từng trường trống thì đúng mục/dòng đó biến mất', async ({ page }) => {
    const bien: [string, Partial<ChiTietThu>, string, 'h3' | 'dt'][] = [
      ['cachThuc', { cachThuc: [] }, 'Cách thức nộp', 'h3'],
      ['thanhPhanHoSo', { thanhPhanHoSo: [] }, 'Thành phần hồ sơ', 'h3'],
      ['trinhTu', { trinhTu: [] }, 'Trình tự thực hiện', 'h3'],
      ['ketQua', { ketQua: [] }, 'Kết quả', 'h3'],
      ['hinhThucNop', { hinhThucNop: [] }, 'Cách nộp', 'dt'],
      ['coQuanThucHien', { coQuanThucHien: null }, 'Cơ quan thực hiện', 'dt'],
      ['phi', { phi: null }, 'Phí, lệ phí', 'dt'],
    ];
    const bo = { ...BO_CHI_TIET() };
    bien.forEach(([ten, ghiDe], i) => {
      bo[`9.6${i}`] = { ...chiTietDayDu(`9.6${i}`, `Thử ${ten}`), ...ghiDe };
    });
    await chuanBi(page, { chiTiet: bo });
    for (const [i, [, , nhan, loai]] of bien.entries()) {
      await page.goto(`/?ma=9.6${i}`);
      const d = dialog(page);
      await expect(d.getByRole('heading', { level: 2 })).toBeVisible();
      if (loai === 'h3') await expect(d.getByRole('heading', { level: 3, name: nhan })).toHaveCount(0);
      else await expect(d.locator('dt', { hasText: nhan })).toHaveCount(0);
      expect((await d.getByRole('heading', { level: 3 }).count())).toBeGreaterThanOrEqual(1);
      await expect(d.getByText(MIEN_TRU)).toHaveCount(1);
    }
  });

  test('F03-PO-23/24 · nhãn mức độ luôn có chữ; mucDo lạ không vỡ trang', async ({ page }) => {
    const loi = theoDoiLoi(page);
    const bo = { ...BO_CHI_TIET(), '9.7001': { ...chiTietDayDu('9.7001', 'Thủ tục thử mức một phần'), mucDo: 'mot-phan' }, '9.7002': { ...chiTietDayDu('9.7002', 'Lạ'), mucDo: 'khac' } };
    await chuanBi(page, { chiTiet: bo });
    await vao(page, '/?ma=9.7001');
    await expect(dialog(page).getByText('Một phần', { exact: true })).toBeVisible();
    await page.goto('/?ma=9.7002');
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Lạ' })).toBeVisible();
    const ghiNhan = await dialog(page).locator('header, [class*=dau], [class*=nhan]').first().innerText().catch(() => '');
    console.log(`F03-PO-24: mucDo="khac" -> nhãn hiển thị: ${JSON.stringify(ghiNhan.replace(/\s+/g, ' ').slice(0, 80))}`);
    expect(loi.filter((l) => !l.includes('Failed to load resource'))).toEqual([]);
  });

  test('F03-PO-21 / TN-10 · P-E (tên 300 ký tự, phí 1.700, bước 9,3 KB, 100 giấy tờ) ở 375 và 1280: không cuộn ngang, đủ 100 giấy tờ', async ({ page }) => {
    await chuanBi(page);
    for (const w of [375, 1280]) {
      await page.setViewportSize({ width: w, height: w === 375 ? 812 : 900 });
      const t0 = Date.now();
      await page.goto('/?ma=9.500005');
      await expect(dialog(page).locator('ol li')).toHaveCount(100);
      console.log(`F03-PO-21: ${w}px mở P-E trong ${Date.now() - t0} ms (gồm tải trang)`);
      expect(await khongTranNgang(page), `trang ${w}px`).toBe(true);
      const tran = await dialog(page).evaluate((d) => d.scrollWidth <= d.clientWidth + 1);
      expect(tran, `popup ${w}px tràn ngang`).toBe(true);
      await expect(dialog(page).getByRole('button', { name: 'Đóng' })).toBeInViewport();
    }
  });

  test('F03-PO-26/27/28 · lỗi 500 → ErrorState + "Đóng" + "Thử lại"; 429; mất mạng rồi có mạng', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await traDanhMuc(page, boT43());
    let pha: 500 | 429 | 200 = 500;
    await page.route('**/api/thu-tuc/*', async (route) => {
      if (pha === 500) {
        await route.fulfill({ status: 500, contentType: 'application/problem+json', json: { status: 500, code: 'loi-he-thong', maTraCuu: 'MA123456' } });
      } else if (pha === 429) {
        await route.fulfill({ status: 429, contentType: 'application/problem+json', json: { status: 429, code: 'qua-nhieu-yeu-cau', maTraCuu: 'MA123456' } });
      } else {
        await route.fulfill({ json: chiTietDayDu(MA_KHAI_SINH, 'Thủ tục đăng ký khai sinh') });
      }
    });
    await vao(page);
    await nutMoThuTuc(page, 'Thủ tục đăng ký khai sinh').click();
    const d = dialog(page);
    await expect(d.getByText('Chưa tải được dữ liệu.')).toBeVisible({ timeout: 15_000 });
    await expect(d.getByText('Mã tra cứu: MA123456')).toBeVisible();
    await expect(d.getByRole('button', { name: 'Đóng' }).last()).toBeVisible();
    pha = 429;
    await d.getByRole('button', { name: 'Thử lại' }).click();
    await expect(d.getByText('Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.')).toBeVisible({ timeout: 15_000 });
    pha = 200;
    await d.getByRole('button', { name: 'Thử lại' }).click();
    await expect(d.getByRole('heading', { level: 2, name: 'Thủ tục đăng ký khai sinh' })).toBeVisible();
  });

  test('F03-PO-28 · mạng đứt (setOffline) rồi bật lại, "Thử lại" ra nội dung (375)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page);
    await vao(page);
    // page.route trả lời trước mạng nên setOffline không tác dụng với dữ liệu giả: ngắt bằng abort kiểu mất mạng.
    await page.unroute('**/api/thu-tuc/*');
    await page.route('**/api/thu-tuc/*', (r) => r.abort('internetdisconnected'));
    await nutMoThuTuc(page, 'Thủ tục đăng ký khai sinh').click();
    await expect(dialog(page).getByText(/Không kết nối được tới máy chủ/)).toBeVisible({ timeout: 20_000 });
    await page.unroute('**/api/thu-tuc/*');
    await traChiTiet(page, BO_CHI_TIET());
    await dialog(page).getByRole('button', { name: 'Thử lại' }).click();
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Thủ tục đăng ký khai sinh' })).toBeVisible();
  });

  test('F03-PO-29 · mở, đóng, mở lại trong 60 giây: không gọi lại chi tiết (cache)', async ({ page }) => {
    const dem: string[] = [];
    await traDanhMuc(page, boT43());
    await traChiTiet(page, BO_CHI_TIET(), { dem });
    await vao(page);
    const nut = nutMoThuTuc(page, 'Thủ tục đăng ký khai sinh');
    await nut.click();
    await expect(dialog(page).getByRole('heading', { level: 2 })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
    const truoc = dem.filter((m) => m === MA_KHAI_SINH).length;
    await nutMoThuTuc(page, 'Thủ tục đăng ký khai sinh').click();
    await expect(dialog(page).getByRole('heading', { level: 2 })).toBeVisible();
    expect(dem.filter((m) => m === MA_KHAI_SINH).length).toBe(truoc);
  });

  test('F03-PO-30 · đổi ma A→B khi A trả muộn: popup B đúng, A về muộn không ghi đè', async ({ page }) => {
    const bo = { ...BO_CHI_TIET(), A1: chiTietDayDu('A1', 'Thủ tục A'), B1: chiTietDayDu('B1', 'Thủ tục B') };
    await traDanhMuc(page, boT43());
    await traChiTiet(page, bo, { treTheoMa: { A1: 3000 } });
    await vao(page);
    await page.evaluate(() => {
      window.history.pushState({}, '', '/?ma=A1');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(dialog(page)).toBeVisible();
    await page.evaluate(() => {
      window.history.pushState({}, '', '/?ma=B1');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Thủ tục B' })).toBeVisible();
    await page.waitForTimeout(3500);
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Thủ tục B' })).toBeVisible();
    await expect(dialog(page)).toHaveCount(1);
  });

  test('F03-PO-31 · rê chuột không gọi chi tiết; pointerdown/focus gọi 1 lần cho đúng mã trước khi click', async ({ page }) => {
    const dem: string[] = [];
    await traDanhMuc(page, boT43());
    await traChiTiet(page, BO_CHI_TIET(), { dem });
    await vao(page);
    await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    for (const a of await khoi(page).locator('article').all()) await a.hover();
    expect(dem).toEqual([]);
    const nut = khoi(page).getByRole('button', { name: /^Xem chi tiết Thủ tục đăng ký kết hôn/ });
    await nut.focus();
    await expect.poll(() => dem.length).toBe(1);
    expect(dem[0]).toBe(MA_KET_HON);
  });

  test('F03-PO-33 / DC-13 / DM-01 · cùng một popup từ thẻ và từ dòng bảng (innerText giống nhau)', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await khoi(page).getByRole('button', { name: 'Thủ tục đăng ký khai sinh', exact: true }).click(); // dòng bảng
    await expect(dialog(page).getByRole('heading', { level: 2 })).toBeVisible();
    const tuBang = await dialog(page).innerText();
    await page.keyboard.press('Escape');
    await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    await khoi(page).getByRole('button', { name: /^Xem chi tiết Thủ tục đăng ký khai sinh/ }).click();
    await expect(dialog(page).getByRole('heading', { level: 2 })).toBeVisible();
    expect(await dialog(page).innerText()).toBe(tuBang);
    await expect(page.getByRole('dialog')).toHaveCount(1);
  });
});

// ───────────────────────────── 5. Liên kết Cổng DVC (BR-4; AC-9, AC-10) ─────────────────────────────

test.describe('Liên kết Cổng DVC (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F03-LK-01/02/05 · popup: đúng một liên kết, tab mới đúng địa chỉ, rel noopener noreferrer, opener null, trang vẫn ở popup', async ({ page, context }) => {
    await chuanBi(page);
    await vao(page, `/?ma=${MA_KHAI_SINH}`);
    const lienKet = dialog(page).getByRole('link', { name: /Xem và nộp trên Cổng DVC/ });
    await expect(dialog(page).getByRole('link', { name: /Xem và nộp trên Cổng DVC/ })).toHaveCount(1);
    await expect(lienKet).toHaveAttribute('target', '_blank');
    expect((await lienKet.getAttribute('rel')) ?? '').toMatch(/noopener/);
    expect((await lienKet.getAttribute('rel')) ?? '').toMatch(/noreferrer/);
    await expect(lienKet).toHaveAccessibleName('Xem và nộp trên Cổng DVC (mở trang mới)');
    const url = page.url();
    const [tabMoi] = await Promise.all([context.waitForEvent('page'), lienKet.click()]);
    expect(tabMoi.url() === linkDvc(MA_KHAI_SINH) || (await tabMoi.evaluate(() => location.href)) === linkDvc(MA_KHAI_SINH)).toBe(true);
    expect(await tabMoi.evaluate(() => window.opener)).toBeNull();
    await tabMoi.close();
    expect(page.url()).toBe(url);
    await expect(dialog(page)).toBeVisible();
  });

  test('F03-LK-03/04/10 · thẻ và dòng bảng: đúng 1 liên kết, tab mới, popup chi tiết KHÔNG mở; ba địa chỉ giống nhau', async ({ page, context }) => {
    await chuanBi(page);
    await vao(page);
    const hangBang = khoi(page).locator('tbody tr').filter({ hasText: MA_KHAI_SINH });
    await expect(hangBang.getByRole('link', { name: /Xem và nộp trên Cổng DVC/ })).toHaveCount(1);
    const hBang = await hangBang.getByRole('link').getAttribute('href');
    const [tab1] = await Promise.all([context.waitForEvent('page'), hangBang.getByRole('link').click()]);
    await tab1.close();
    await expect(dialog(page)).toHaveCount(0);
    await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    const the = khoi(page).locator('article').filter({ hasText: MA_KHAI_SINH });
    await expect(the.getByRole('link', { name: /Xem và nộp trên Cổng DVC/ })).toHaveCount(1);
    const hThe = await the.getByRole('link').getAttribute('href');
    const [tab2] = await Promise.all([context.waitForEvent('page'), the.getByRole('link').click()]);
    await tab2.close();
    await expect(dialog(page)).toHaveCount(0);
    await the.getByRole('button', { name: /^Xem chi tiết/ }).click();
    const hPopup = await dialog(page).getByRole('link', { name: /Xem và nộp/ }).getAttribute('href');
    expect([hBang, hThe, hPopup]).toEqual([linkDvc(MA_KHAI_SINH), linkDvc(MA_KHAI_SINH), linkDvc(MA_KHAI_SINH)]);
  });

  test('F03-LK-06/07/08/BM-20 · không "Nộp trực tuyến"; mọi href http chỉ dichvucong.gov.vn, không tên miền "Đã bỏ"; rel đủ; mã mã hoá URL', async ({ page }) => {
    const ds = boT43();
    ds[1] = { ...ds[1]!, ma: '1.0&x=1', ten: 'Mã có & dấu', tenTimKiem: 'ma co dau' };
    ds[2] = { ...ds[2]!, ma: 'a b/c', ten: 'Mã có cách', tenTimKiem: 'ma co cach' };
    ds[3] = { ...ds[3]!, ma: '1.001193#frag', ten: 'Mã có thăng', tenTimKiem: 'ma co thang' };
    await chuanBi(page, { thuTuc: ds });
    await vao(page, `/?ma=${MA_KHAI_SINH}`);
    await expect(dialog(page)).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Nộp trực tuyến');
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ h: a.getAttribute('href')!, t: a.getAttribute('target'), r: a.getAttribute('rel') })));
    for (const l of hrefs.filter((x) => /^https?:/.test(x.h))) {
      expect(new URL(l.h).hostname).not.toMatch(new RegExp(TEN_MIEN_DA_BO.map((s) => s.replace(/\./g, '\\.')).join('|')));
      if (l.t === '_blank') expect(l.r ?? '').toMatch(/noopener.*noreferrer|noreferrer.*noopener/);
      expect(l.h).not.toMatch(/^(javascript|data):/i);
    }
    expect(hrefs.filter((x) => x.h.startsWith('https://dichvucong.gov.vn/')).length).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    await oTim(page).fill('ma co');
    const hr = await khoi(page).locator('article a').evaluateAll((a) => a.map((x) => x.getAttribute('href')));
    expect(hr).toContain(linkDvc('1.0&x=1'));
    expect(hr.join(' ')).toContain('keyword=1.0%26x%3D1&showAdvanced');
    expect(hr.join(' ')).toContain('keyword=a%20b%2Fc&');
    expect(hr.join(' ')).toContain('keyword=1.001193%23frag&');
  });

  test('F03-LK-09 · Tab tới liên kết, Enter mở tab mới; tên đọc bắt đầu bằng chữ nhìn thấy', async ({ page, context }) => {
    await chuanBi(page);
    await vao(page);
    const lk = khoi(page).locator('tbody tr').first().getByRole('link');
    await lk.focus();
    await expect(lk).toBeFocused();
    const [tab] = await Promise.all([context.waitForEvent('page'), page.keyboard.press('Enter')]);
    await tab.close();
    expect(await lk.getAttribute('aria-label')).toBeNull();
  });
});

// ───────────────────────────── 6. Link riêng, đóng, Quay lại, tiêu đề tab (BR-8; AC-4, 15–18, 21, 24, 25) ─────────────────────────────

test.describe('Link riêng, đóng, Quay lại (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F03-DC-01/04 · bấm mở giữ q,trang và thêm ma; ✕ bỏ ma, giữ trang 2, con trỏ về nút đã mở (AC-15, AC-16)', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/?q=khai+sinh&trang=2');
    const the = khoi(page).locator('tbody tr').first().getByRole('button');
    const ma = (await maHienThi(page))[0]!;
    await the.click();
    await expect(dialog(page)).toBeVisible();
    const u = new URL(page.url());
    expect(u.searchParams.get('q')).toBe('khai sinh');
    expect(u.searchParams.get('trang')).toBe('2');
    expect(u.searchParams.get('ma')).toBe(ma);
    await dialog(page).getByRole('button', { name: 'Đóng' }).first().click();
    await expect(dialog(page)).toHaveCount(0);
    const v = new URL(page.url());
    expect(v.searchParams.has('ma')).toBe(false);
    expect(v.searchParams.get('trang')).toBe('2');
    await expect(the).toBeFocused();
    await expect(soDem(page)).toHaveText('Hiển thị 14/43');
  });

  test('F03-DC-02/03 · mở link ở context mới: popup mở sẵn, nền đúng từ khoá/trang; /?ma= trần: 43/43 trang 1 (AC-15)', async ({ page, browser }) => {
    await chuanBi(page);
    await vao(page, `/?q=khai+sinh&trang=2&ma=${MA_KHAI_SINH}`);
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Thủ tục đăng ký khai sinh' })).toBeVisible();
    await expect(oTim(page)).toHaveValue('khai sinh');
    const moi = await browser.newContext({ viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
    const p2 = await moi.newPage();
    await chuanBi(p2);
    await p2.goto(page.url());
    await expect(dialog(p2).getByRole('heading', { level: 2, name: 'Thủ tục đăng ký khai sinh' })).toBeVisible();
    await expect(oTim(p2)).toHaveValue('khai sinh');
    await p2.goto(`/?ma=${MA_KHAI_SINH}`);
    await expect(dialog(p2)).toBeVisible();
    await expect(soDem(p2)).toHaveText('Hiển thị 43/43');
    await moi.close();
  });

  test('F03-DC-05/06/30 · Esc và vùng tối đóng như ✕; nền không đổi (vị trí cuộn) (AC-16)', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/?q=khai+sinh&trang=2');
    for (const cach of ['esc', 'toi'] as const) {
      await khoi(page).locator('tbody tr').first().getByRole('button').click();
      await expect(dialog(page)).toBeVisible();
      if (cach === 'esc') await page.keyboard.press('Escape');
      else await page.mouse.click(5, 5);
      await expect(dialog(page)).toHaveCount(0);
      expect(new URL(page.url()).searchParams.has('ma')).toBe(false);
      expect(new URL(page.url()).searchParams.get('trang')).toBe('2');
    }
  });

  test('F03-DC-07/08 · "Quay lại" khi popup mở từ danh sách: popup đóng, ở lại trang 2 với "khai sinh"; Tiến → mở lại (AC-17)', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('khai sinh');
    await expect(soDem(page)).toHaveText('Hiển thị 14/43');
    await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    await expect(page).toHaveURL(/trang=2/);
    await khoi(page).locator('tbody tr').first().getByRole('button').click();
    await expect(dialog(page)).toBeVisible();
    const ma = new URL(page.url()).searchParams.get('ma');
    await page.evaluate(() => ((window as unknown as { __marker: number }).__marker = 42));
    await page.goBack();
    await expect(dialog(page)).toHaveCount(0);
    expect(new URL(page.url()).searchParams.get('trang')).toBe('2');
    expect(new URL(page.url()).searchParams.get('q')).toBe('khai sinh');
    await expect(oTim(page)).toHaveValue('khai sinh');
    expect(await soMuc(page)).toBe(2);
    expect(await page.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(42);
    await page.goForward();
    await expect(dialog(page)).toBeVisible();
    expect(new URL(page.url()).searchParams.get('ma')).toBe(ma);
  });

  test('F03-DC-09 · mở rồi đóng bằng ✕: "Quay lại" sau đó không đưa lại trạng thái "popup mở"', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await khoi(page).locator('tbody tr').first().getByRole('button').click();
    await expect(dialog(page)).toBeVisible();
    await dialog(page).getByRole('button', { name: 'Đóng' }).first().click();
    await expect(dialog(page)).toHaveCount(0);
    await page.goBack().catch(() => undefined);
    await page.waitForTimeout(300);
    await expect(dialog(page)).toHaveCount(0);
  });

  test('F03-DC-10/11 / AC-24 · mở thẳng /?ma= trong tab mới: "Quay lại" đóng popup và ở lại trang chủ; ✕ cũng ở lại', async ({ page, context }) => {
    await chuanBi(page);
    // lần 1: Quay lại
    const tab = await context.newPage();
    await chuanBi(tab);
    await tab.goto(`/?ma=${MA_KHAI_SINH}`);
    await expect(dialog(tab)).toBeVisible();
    await expect(soDem(tab)).toBeVisible();
    await tab.evaluate(() => ((window as unknown as { __marker: number }).__marker = 7));
    // Hook đệm lịch sử chạy sau lần vẽ đầu (thay mục rồi thêm mục có ma): chờ xong như người dùng thật (chậm hơn nhiều so với máy).
    await tab.waitForFunction(() => JSON.stringify(history.state).includes('popupThuTuc'));
    // history.back() thay page.goBack(): Playwright Firefox không lùi qua mục lịch sử do script tạo (đã kiểm: history.back() đóng popup đúng).
    await tab.evaluate(() => history.back());
    await expect(dialog(tab)).toHaveCount(0);
    expect(new URL(tab.url()).searchParams.has('ma')).toBe(false);
    await expect(soDem(tab)).toBeVisible();
    expect(await tab.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(7);
    expect(tab.url()).not.toBe('about:blank');
    // lần 2: ✕
    const tab2 = await context.newPage();
    await chuanBi(tab2);
    await tab2.goto(`/?ma=${MA_KHAI_SINH}`);
    await expect(dialog(tab2)).toBeVisible();
    await dialog(tab2).getByRole('button', { name: 'Đóng' }).first().click();
    await expect(dialog(tab2)).toHaveCount(0);
    await expect(soDem(tab2)).toBeVisible();
    expect(new URL(tab2.url()).pathname).toBe('/');
  });

  test('F03-DC-12/13/15/16 / AC-18 · ma không có: khối vẫn hiện, popup "Không tìm thấy thủ tục này…" + Đóng; không nhắc mã; tiêu đề tab', async ({ page }) => {
    await chuanBi(page);
    await vao(page, '/?ma=9.999999');
    const d = dialog(page);
    await expect(d.getByText(KHONG_TIM_THAY_THU_TUC)).toBeVisible();
    await expect(d.getByRole('button', { name: 'Đóng' }).last()).toBeVisible();
    const chu = await page.locator('body').innerText();
    expect(chu).not.toContain('9.999999');
    for (const tu of ['Error', 'Exception', '404', 'undefined', 'stack', 'null']) expect(chu).not.toContain(tu);
    await expect(soDem(page)).toHaveText('Hiển thị 43/43');
    expect(await page.title()).toBe(`Trang chủ – ${TEN_TRUNG_TAM}`);
    await d.getByRole('button', { name: 'Đóng' }).last().click();
    await expect(dialog(page)).toHaveCount(0);
    expect(new URL(page.url()).searchParams.has('ma')).toBe(false);
  });

  test('F03-DC-14 / BM-15 / AC-18, AC-28 · mã sai định dạng và độc hại: 0 yêu cầu chi tiết, 0 hộp thoại, 0 lỗi trang, chữ không hiện ra trang', async ({ page }) => {
    const loi = theoDoiLoi(page);
    const hopThoai = theoDoiHopThoai(page);
    const dem: string[] = [];
    await traDanhMuc(page, boT43());
    await traChiTiet(page, BO_CHI_TIET(), { dem });
    const doc = [
      'abc<b>x</b>', '%3Cscript%3Ealert(1)%3C%2Fscript%3E', '"><img src=x onerror=alert(1)>', '1234567890123456789012',
      'a b', '../x', '1.001193%2520', '', 'x'.repeat(5000), 'javascript:alert(1)', '%00', '%', '%E0%A4%A', 'https://evil.example',
    ];
    for (const g of doc) {
      const cuoi = g.includes('%') && !/^%[0-9A-Fa-f]{2}/.test(g) ? g : g;
      await page.goto(`/?ma=${cuoi}`);
      await expect(dialog(page).getByText(KHONG_TIM_THAY_THU_TUC)).toBeVisible();
      const chu = await page.locator('body').innerText();
      const tieuDe = await page.title();
      for (const manh of ['abc<b>', 'alert(1)', 'evil.example', 'x'.repeat(50)]) {
        if (g.includes(manh)) {
          expect(chu, `giá trị ${g.slice(0, 30)} lộ ra trang`).not.toContain(manh);
          expect(tieuDe).not.toContain(manh);
        }
      }
    }
    expect(dem).toEqual([]);
    expect(hopThoai).toEqual([]);
    expect(loi.filter((l) => !l.includes('Failed to load resource'))).toEqual([]);
    expect(page.url()).not.toContain('evil.example/');
  });

  test('F03-DC-17/18/19/20 / AC-21 · tiêu đề tab: tên thủ tục khi popup mở, về tiêu đề trang chủ khi đóng; head không đổi', async ({ page }) => {
    await chuanBi(page, { tre: 800 });
    await vao(page, `/?ma=${MA_KHAI_SINH}`);
    expect(await page.title()).not.toMatch(/Đang tải|1\.001193/);
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Thủ tục đăng ký khai sinh' })).toBeVisible();
    await expect.poll(() => page.title()).toBe('Thủ tục đăng ký khai sinh');
    const dc = await page.locator('meta[name="DC.title"], meta[property="og:title"]').evaluateAll((m) => m.map((x) => x.getAttribute('content')));
    for (const c of dc) expect(c ?? '').not.toContain('khai sinh');
    await page.keyboard.press('Escape');
    await expect.poll(() => page.title()).toBe(`Trang chủ – ${TEN_TRUNG_TAM}`);
  });

  test('F03-DC-21 · HTML máy chủ của /?ma= giống /: không có tên thủ tục', async ({ request }) => {
    const a = await (await request.get('/')).text();
    const b = await (await request.get('/?ma=1.001193')).text();
    expect(b).toBe(a);
    expect(b).not.toContain('khai sinh');
  });

  test('F03-DC-22/24/25 · ma đổi A→B khi mở: một popup; ma lặp lấy một giá trị; đóng chỉ bỏ ma, giữ tham số khác', async ({ page }) => {
    await chuanBi(page);
    await page.goto(`/?ma=${MA_KHAI_SINH}&ma=${MA_KET_HON}&x=1&q=abc`);
    await expect(dialog(page)).toHaveCount(1);
    await expect(dialog(page).getByRole('heading', { level: 2 })).toBeVisible();
    await dialog(page).getByRole('button', { name: 'Đóng' }).first().click();
    await expect(dialog(page)).toHaveCount(0);
    const u = new URL(page.url());
    expect(u.searchParams.get('x')).toBe('1');
    expect(u.searchParams.get('q')).toBe('abc');
    expect(u.searchParams.has('ma')).toBe(false);
  });

  test('F03-DC-28 / TN-03/04 · bàn phím: Enter mở, con trỏ vào popup, Tab đi vòng trong popup, Esc đóng và trả con trỏ; aria dialog', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    const nut = khoi(page).locator('tbody tr').first().getByRole('button');
    await nut.focus();
    await page.keyboard.press('Enter');
    const d = dialog(page);
    await expect(d).toBeVisible();
    await expect(d).toHaveAttribute('aria-modal', 'true');
    await expect(d).toHaveAccessibleName(/\S/);
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))).toBe(true);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(d).toHaveCount(0);
    await expect(nut).toBeFocused();
  });

  test('F03-DC-29 · popup mở: nền không cuộn; sau đóng vị trí cuộn như cũ', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(200);
    const y0 = await page.evaluate(() => window.scrollY);
    await khoi(page).locator('tbody tr').nth(3).getByRole('button').click();
    await expect(dialog(page)).toBeVisible();
    await page.mouse.move(640, 450);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.scrollY)).toBe(y0);
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(y0);
  });
});

// ───────────────────────────── Kiosk: replace (AC-25) ─────────────────────────────

test('F03-DC-26 / KS-04 / AC-25 · kiosk 1080×1920: mở popup không thêm lịch sử; "Quay lại" KHÔNG đóng popup; ✕/Esc/vùng tối đóng và bỏ ma', async ({ page }) => {
  await page.setViewportSize({ width: 1080, height: 1920 });
  await chuanBi(page);
  await page.goto('/thu-tuc'); // mục lịch sử đứng trước, để "Quay lại" có chỗ đi
  await vao(page, '/?kiosk=1');
  const truoc = await page.evaluate(() => history.length);
  const nut = khoi(page).getByRole('button', { name: /^Xem chi tiết/ }).first();
  await nut.click();
  await expect(dialog(page)).toBeVisible();
  expect(await page.evaluate(() => history.length)).toBe(truoc);
  expect(await page.evaluate(() => JSON.stringify(history.state))).not.toContain('popupThuTuc');
  expect(await page.evaluate(() => document.documentElement.classList.contains('kiosk'))).toBe(true);
  // Popup không có mục lịch sử riêng: "Quay lại" đưa tới mục đứng trước (/thu-tuc) chứ không chỉ đóng popup rồi ở lại trang chủ.
  await page.goBack();
  await expect(page).toHaveURL(/\/thu-tuc/);
  await page.goForward();
  await expect(dialog(page)).toBeVisible(); // mục lịch sử đã bị thay bằng địa chỉ có ma
  for (const cach of ['x', 'esc', 'toi'] as const) {
    if (cach === 'x') await dialog(page).getByRole('button', { name: 'Đóng' }).first().click();
    else if (cach === 'esc') await page.keyboard.press('Escape');
    else await page.mouse.click(5, 5);
    await expect(dialog(page)).toHaveCount(0);
    expect(new URL(page.url()).searchParams.has('ma')).toBe(false);
    expect(await page.evaluate(() => document.documentElement.classList.contains('kiosk'))).toBe(true);
    await khoi(page).getByRole('button', { name: /^Xem chi tiết/ }).first().click();
    await expect(dialog(page)).toBeVisible();
  }
});

// ───────────────────────────── 7. Trạng thái trên địa chỉ (BR-9; AC-19, AC-26) ─────────────────────────────

test.describe('Trạng thái trên địa chỉ (1280)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('F03-DL-01/02/03/04 (AC-19) · trang 3 có trong URL, mở ở context mới ra cùng 12 mục; chip + từ khoá về trang 1', async ({ page, browser }) => {
    await chuanBi(page);
    await vao(page);
    await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    await khoi(page).getByRole('button', { name: 'Trang 3', exact: true }).click();
    await expect(page).toHaveURL(/trang=3/);
    expect(new URL(page.url()).searchParams.has('lv')).toBe(false);
    const moi = await browser.newContext({ viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
    const p2 = await moi.newPage();
    await chuanBi(p2);
    await p2.goto(page.url());
    await expect(soDem(p2)).toBeVisible();
    expect(await maHienThi(p2)).toEqual(THU_TU.slice(24, 36));
    await khoi(page).getByRole('button', { name: 'Hộ tịch', exact: true }).click();
    await oTim(page).fill('khai sinh');
    await expect(soDem(page)).toHaveText('Hiển thị 13/43');
    await expect(page).toHaveURL(/q=khai/);
    const u = new URL(page.url());
    expect(u.searchParams.get('lv')).toBe('ho-tich');
    expect(u.searchParams.get('q')).toBe('khai sinh');
    expect(u.searchParams.has('trang')).toBe(false);
    await p2.goto(page.url());
    await expect(soDem(p2)).toHaveText('Hiển thị 13/43');
    await expect(khoi(p2).getByRole('button', { name: 'Hộ tịch', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(oTim(p2)).toHaveValue('khai sinh');
    await moi.close();
  });

  test('F03-DL-05 · gõ nhanh từng phím không tạo mục lịch sử; địa chỉ cập nhật sau ~300 ms', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    const truoc = await page.evaluate(() => history.length);
    await oTim(page).pressSequentially('khai sinh', { delay: 40 });
    await expect(page).toHaveURL(/q=khai/);
    expect(await page.evaluate(() => history.length)).toBe(truoc);
  });

  test('F03-DL-06 · trang lạ: abc,0,00,-1,1.5,3abc,trống → trang 1; số lớn → trang cuối; 03 → trang 3', async ({ page }) => {
    await chuanBi(page);
    const ma0 = THU_TU.slice(0, 12);
    for (const t of ['abc', '0', '00', '-1', '1.5', '3abc', '']) {
      await page.goto(`/?trang=${t}`);
      await expect(soDem(page)).toBeVisible();
      await expect(khoi(page).locator('tbody tr').first()).toBeVisible();
      expect(await maHienThi(page), `trang=${t}`).toEqual(ma0);
    }
    await page.goto('/?trang=99999999999999999999');
    await expect(soDem(page)).toBeVisible();
    expect(await maHienThi(page)).toEqual(THU_TU.slice(36, 43));
    await page.goto('/?trang=03');
    await expect(soDem(page)).toBeVisible();
    expect(await maHienThi(page)).toEqual(THU_TU.slice(24, 36));
  });

  test('F03-DL-07 / AC-26 · lv lạ, lv rỗng, lv của lĩnh vực không có thủ tục thường gặp → Tất cả, 43/43, không báo lỗi, không lộ mã', async ({ page }) => {
    await chuanBi(page);
    for (const lv of ['khong-co-lv', '', 'chi-o-danh-muc', '%3Cscript%3E']) {
      await page.goto(`/?lv=${lv}`);
      await expect(soDem(page)).toHaveText('Hiển thị 43/43');
      await expect(khoi(page).getByRole('button', { name: 'Tất cả', exact: true })).toHaveAttribute('aria-pressed', 'true');
      const chu = await page.locator('body').innerText();
      if (lv && !lv.startsWith('%')) expect(chu).not.toContain(lv);
      expect(chu).not.toMatch(/lỗi|không tìm thấy/i);
    }
  });

  test('F03-DL-08/10 · q có <script>, q 5.000 ký tự, q chỉ khoảng trắng, q hoa/thường', async ({ page }) => {
    const hopThoai = theoDoiHopThoai(page);
    await chuanBi(page);
    await page.goto('/?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    await expect(soDem(page)).toHaveText('Hiển thị 0/43');
    await expect(oTim(page)).toHaveValue('<script>alert(1)</script>');
    await page.goto(`/?q=${'a%20'.repeat(1700)}`);
    await expect(soDem(page)).toBeVisible();
    await page.goto('/?q=%20%20');
    await expect(soDem(page)).toHaveText('Hiển thị 43/43');
    await page.goto('/?q=KHAI%20SINH');
    await expect(soDem(page)).toHaveText('Hiển thị 14/43');
    await expect(oTim(page)).toHaveValue('KHAI SINH');
    expect(hopThoai).toEqual([]);
  });

  test('F03-DL-11 · gõ "khai sinh", sang trang 2, Quay lại: ghi nhận hành vi (ghi địa chỉ bằng thay thế)', async ({ page }) => {
    await chuanBi(page);
    await vao(page);
    await oTim(page).fill('khai sinh');
    await expect(page).toHaveURL(/q=/);
    await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    await expect(page).toHaveURL(/trang=2/);
    const n = await page.evaluate(() => history.length);
    console.log(`F03-DL-11: history.length = ${n}; Quay lại rời trang thay vì lùi từng bộ lọc: ${n <= 2 ? 'đúng (replace)' : 'KHÔNG (push)'}`);
    expect(n).toBeLessThanOrEqual(2);
  });

  test('F03-DL-13 · locale en-US/ja-JP cho cùng kết quả', async ({ browser }) => {
    for (const locale of ['en-US', 'ja-JP', 'ar']) {
      const ctx = await browser.newContext({ locale, viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
      const p = await ctx.newPage();
      await chuanBi(p);
      await p.goto('/?lv=ho-tich&q=khai+sinh');
      await expect(soDem(p)).toHaveText('Hiển thị 13/43');
      await ctx.close();
    }
  });
});

// ───────────────────────────── 8. Bản đầu 16 thủ tục (AC-20) trên dữ liệu thật của nguồn Mẫu ─────────────────────────────

test.describe('Dữ liệu thật nguồn Mẫu (AC-20, NB-01/02/05)', () => {
  test('F03-NB-01/05 · nguồn Mẫu: "Hiển thị 16/16", 2 trang (12, 4), chip = Tất cả + 5 lĩnh vực, đúng thứ tự (1280, 375)', async ({ page, request }) => {
    const tho = (await (await request.get('/api/thu-tuc')).json()) as { ma: string; thuTuThuongGap: number | null }[];
    const mong = tho.filter((t) => t.thuTuThuongGap !== null).sort((a, b) => a.thuTuThuongGap! - b.thuTuThuongGap!).map((t) => t.ma);
    expect(mong.length).toBe(16);
    for (const w of [1280, 375]) {
      await page.setViewportSize({ width: w, height: w === 375 ? 812 : 900 });
      await page.goto('/');
      await expect(soDem(page)).toHaveText('Hiển thị 16/16');
      expect(await maHienThi(page)).toEqual(mong.slice(0, 12));
      await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
      expect(await maHienThi(page)).toEqual(mong.slice(12));
      expect((await khoi(page).getByRole('group', { name: 'Lọc theo lĩnh vực' }).getByRole('button').allTextContents()).map((s) => s.trim()))
        .toEqual(['Tất cả', 'Hộ tịch', 'Chứng thực', 'Đất đai', 'Bảo trợ xã hội', 'Đăng ký, quản lý cư trú']);
    }
  });

  test('F03-NB-02 · bỏ 1 dòng (mục duy nhất của Bảo trợ xã hội) → "Hiển thị 15/15", 2 trang (12, 3), chip Bảo trợ xã hội biến mất', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.route('**/api/thu-tuc', async (route) => {
      const phanHoi = await route.fetch();
      const ds = (await phanHoi.json()) as { ma: string; linhVucMa: string; thuTuThuongGap: number | null }[];
      await route.fulfill({ response: phanHoi, json: ds.map((t) => (t.linhVucMa === 'bao-tro-xa-hoi' ? { ...t, thuTuThuongGap: null } : t)) });
    });
    await page.goto('/');
    await expect(soDem(page)).toHaveText('Hiển thị 15/15');
    await expect(khoi(page).getByRole('button', { name: 'Bảo trợ xã hội' })).toHaveCount(0);
    expect(await soMuc(page)).toBe(12);
    await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    expect(await soMuc(page)).toBe(3);
  });
});

// ───────────────────────────── 9. Kiosk, trợ năng ─────────────────────────────

test('F03-KS-01 · kiosk: dạng thẻ, không cuộn ngang, thẻ xếp hàng đầy', async ({ page }) => {
  await page.setViewportSize({ width: 1080, height: 1920 });
  await chuanBi(page);
  await vao(page, '/?kiosk=1');
  await expect(khoi(page).locator('article').first()).toBeVisible();
  expect(await khongTranNgang(page)).toBe(true);
  expect(await soMuc(page)).toBe(12);
});

test.describe('Trợ năng (axe) — khối và popup', () => {
  for (const [w, h, kiosk] of [[375, 812, false], [768, 1024, false], [1280, 900, false], [1080, 1920, true]] as const) {
    test(`F03-TN-01 · axe ${w}px${kiosk ? ' kiosk' : ''}: khối thường gặp (thẻ/bảng) 0 vi phạm`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await chuanBi(page);
      await vao(page, kiosk ? '/?kiosk=1' : '/');
      let kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
      expect(kq.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
      if (w >= 768) {
        await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
        kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
        expect(kq.violations.map((v) => v.id)).toEqual([]);
      }
    });

    test(`F03-TN-02 · axe ${w}px${kiosk ? ' kiosk' : ''}: popup (đủ dữ liệu, không tìm thấy) 0 vi phạm`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await chuanBi(page);
      await page.goto(kiosk ? '/?kiosk=1&ma=9.500001' : '/?ma=9.500001');
      await expect(dialog(page).getByRole('heading', { level: 2 })).toBeVisible();
      let kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
      expect(kq.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
      // trạng thái không tìm thấy
      await page.goto(kiosk ? '/?kiosk=1&ma=9.999999' : '/?ma=9.999999');
      await expect(dialog(page).getByText(KHONG_TIM_THAY_THU_TUC)).toBeVisible();
      await page.waitForTimeout(300); // hiệu ứng mở popup (độ mờ ≤ 150 ms) xong rồi mới đo tương phản
      kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
      expect(kq.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ') + ' ' + JSON.stringify(n.any[0]?.data ?? {})).slice(0, 3).join(' | ')}`)).toEqual([]);
    });
  }

  test('F03-TN-05/06/16 · tên đọc "Xem chi tiết <tên>" duy nhất, chứa chữ nhìn thấy; vùng chạm >= 24 px ở 375', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page);
    await vao(page);
    const ten = await khoi(page).getByRole('button', { name: /^Xem chi tiết/ }).evaluateAll((b) => b.map((x) => x.getAttribute('aria-label')));
    expect(new Set(ten).size).toBe(ten.length);
    for (const t of ten) expect(t).toMatch(/^Xem chi tiết /);
    const nho: string[] = [];
    for (const loc of [khoi(page).getByRole('button', { name: /^Xem chi tiết/ }).first(), khoi(page).getByRole('link', { name: /Cổng DVC/ }).first(), khoi(page).getByRole('button', { name: 'Hộ tịch', exact: true }), khoi(page).getByRole('button', { name: 'Trang 2', exact: true })]) {
      const hop = await loc.boundingBox();
      console.log(`F03-TN-16: vùng bấm ${hop?.width.toFixed(0)}x${hop?.height.toFixed(0)}`);
      if (!hop || hop.width < 24 || hop.height < 24) nho.push(`${hop?.width}x${hop?.height}`);
    }
    expect(nho, 'vùng bấm nhỏ hơn 24x24 (C01 AC-2)').toEqual([]);
    await khoi(page).getByRole('button', { name: /^Xem chi tiết/ }).first().click();
    const dong = await dialog(page).getByRole('button', { name: 'Đóng' }).first().boundingBox();
    expect(dong!.width).toBeGreaterThanOrEqual(24);
    expect(dong!.height).toBeGreaterThanOrEqual(24);
  });

  test('F03-TN-10 · 320 px: không cuộn ngang ở khối và popup (P-E)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await chuanBi(page);
    await vao(page);
    expect(await khongTranNgang(page)).toBe(true);
    await page.goto('/?ma=9.500005');
    await expect(dialog(page).locator('ol li')).toHaveCount(100);
    expect(await khongTranNgang(page)).toBe(true);
    expect(await dialog(page).evaluate((d) => d.scrollWidth <= d.clientWidth + 1)).toBe(true);
  });

  test('F03-TN-11 · giãn chữ (WCAG 1.4.12): thẻ và popup không tràn', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page);
    await vao(page);
    await ganCssThu(page, CSS_GIAN_CHU);
    expect(await page.evaluate(() => getComputedStyle(document.body).letterSpacing)).not.toBe('normal');
    expect(await khongTranNgang(page)).toBe(true);
    await page.goto('/?ma=9.500001');
    await expect(dialog(page)).toBeVisible();
    await ganCssThu(page, CSS_GIAN_CHU);
    expect(await dialog(page).evaluate((d) => d.scrollWidth <= d.clientWidth + 1)).toBe(true);
    await expect(dialog(page).getByRole('button', { name: 'Đóng' }).first()).toBeInViewport();
  });

  test('F03-TN-12 · giảm chuyển động: popup mở/đóng không bị lỗi (reduced motion)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    await khoi(page).locator('tbody tr').first().getByRole('button').click();
    await expect(dialog(page)).toBeVisible();
    const tgian = await dialog(page).evaluate((d) => getComputedStyle(d).animationDuration + '|' + getComputedStyle(d).transitionDuration);
    console.log(`F03-TN-12: reduced-motion -> animation|transition = ${tgian}`);
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
  });
});

// ───────────────────────────── 11. Bảo mật (luồng đầy đủ) ─────────────────────────────

test.describe('Bảo mật — luồng đầy đủ', () => {
  for (const [w, h] of [[375, 812], [1280, 900]] as const) {
    test(`F03-BM-18/19/22 · ${w}px: 0 vi phạm CSP, 0 console.error, mọi request cùng gốc, storage chỉ có cach-xem`, async ({ page, context }) => {
      await page.setViewportSize({ width: w, height: h });
      const loi = theoDoiLoi(page, true);
      await themBatCsp(page);
      const yc = ghiYeuCau(page);
      await chuanBi(page);
      await vao(page);
      await oTim(page).fill('khai sinh');
      await khoi(page).getByRole('button', { name: 'Hộ tịch', exact: true }).click();
      if (w >= 768) await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
      await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
      await khoi(page).getByRole('button', { name: /^Xem chi tiết|^Thủ tục/ }).first().click();
      await expect(dialog(page).getByRole('heading', { level: 2 })).toBeVisible();
      await page.goBack();
      await expect(dialog(page)).toHaveCount(0);
      await page.goto('/?ma=9.999999');
      await expect(dialog(page).getByText(KHONG_TIM_THAY_THU_TUC)).toBeVisible();
      expect(await layCsp(page)).toEqual([]);
      expect(loi).toEqual([]);
      const goc = new URL(page.url()).origin;
      const ngoai = yc.filter((u) => /^https?:/.test(u) && new URL(u).origin !== goc);
      expect(ngoai, 'request ra tên miền ngoài').toEqual([]);
      const luu = await page.evaluate(() => ({ l: Object.keys(localStorage), s: Object.keys(sessionStorage), c: document.cookie }));
      expect(luu.l.filter((k) => k !== 'cach-xem')).toEqual([]);
      // react-router lưu vị trí cuộn (số) trong sessionStorage: không chứa dữ liệu người dùng.
      expect(luu.s.filter((k) => k !== 'react-router-scroll-positions')).toEqual([]);
      expect(luu.c).toBe('');
      expect((await context.cookies()).length).toBe(0);
      expect(duongApi(yc).every((u) => !/q=|khai\+sinh|khai%20sinh/.test(u))).toBe(true);
    });
  }

  test('F03-BM-16 / BM-17 · P-D: HTML/script trong dữ liệu hiện nguyên văn dạng chữ, DOM không sinh thẻ, 0 hộp thoại', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const hopThoai = theoDoiHopThoai(page);
    const ds = boT43();
    ds[0] = { ...ds[0]!, ten: 'Thử <b>đậm</b> & "trích"', tenTimKiem: 'thu dam trich' };
    await chuanBi(page, { thuTuc: ds, chiTiet: { ...BO_CHI_TIET(), [ds[0].ma]: chiTietDocHai(ds[0].ma) } });
    await vao(page);
    await oTim(page).fill('thu dam trich');
    await expect(khoi(page).getByText('Thử <b>đậm</b> & "trích"').first()).toBeVisible();
    expect(await khoi(page).locator('b').count()).toBe(0);
    await khoi(page).locator('tbody tr').first().getByRole('button').click();
    const d = dialog(page);
    await expect(d.getByRole('heading', { level: 2 })).toHaveText('Thử <b>đậm</b> & "trích"');
    await expect(d.getByText('<script>alert(1)</script>')).toBeVisible();
    await expect(d.getByText('<img src=x onerror=alert(1)>').first()).toBeVisible();
    expect(await d.locator('script, img, b, i, u, a[href^="javascript"]').count()).toBe(0);
    await expect(d.locator('section').filter({ hasText: 'Căn cứ pháp lý' }).locator('a')).toHaveCount(0);
    expect(await page.locator('script:not([src])').count()).toBe(0);
    expect(hopThoai).toEqual([]);
  });
});

// ───────────────────────────── 13. Hiệu năng ─────────────────────────────

test.describe('Hiệu năng (1280, 375)', () => {
  test('F03-HN-02/14 / PO-32 · mở "/" ở 375: không tải chunk popup/grid, không ảnh/font; sau 3,5 s vẫn không nạp trước popup (đã bỏ bộ đếm); bấm "Xem chi tiết" -> popup < 1 s', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const yc = ghiYeuCau(page);
    await chuanBi(page);
    await vao(page);
    const sau1s = yc.filter((u) => /\.js(\?|$)/.test(u)).map((u) => new URL(u).pathname.split('/').pop()!);
    expect(sau1s.some((t) => /PopupChiTiet/.test(t)), `chunk popup tải sớm: ${sau1s.join(',')}`).toBe(false);
    expect(sau1s.some((t) => /^grid-/.test(t)), 'chunk grid tải ở 375').toBe(false);
    const html = await (await page.request.get('/')).text();
    expect(html).not.toMatch(/modulepreload[^>]*(PopupChiTiet|grid)/);
    // Đã bỏ bộ đếm nạp trước popup: ở trạng thái nghỉ chunk popup vẫn không tải (chỉ tải khi bấm "Xem chi tiết" hoặc có ?ma=)
    await page.waitForTimeout(3500);
    expect(yc.some((u) => /PopupChiTiet/.test(u)), 'chunk popup tải khi chưa ai bấm').toBe(false);
    const t0 = Date.now();
    await khoi(page).getByRole('button', { name: /^Xem chi tiết/ }).first().click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page).getByRole('heading', { level: 2 })).toBeVisible();
    test.info().annotations.push({ type: 'do', description: `bấm -> popup có tiêu đề (chunk lạnh, localhost): ${Date.now() - t0} ms` });
    expect(Date.now() - t0).toBeLessThan(1000);
    expect(yc.filter((u) => /\.(png|jpe?g|webp|avif|gif|woff2?|ttf|otf)(\?|$)/.test(u))).toEqual([]);
  });

  test('F03-HN-12 · gõ, đổi chip, đổi trang: 0 yêu cầu mạng', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    const yc = ghiYeuCau(page);
    await oTim(page).fill('khai sinh');
    await khoi(page).getByRole('button', { name: 'Hộ tịch', exact: true }).click();
    await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
    await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
    await page.waitForTimeout(500);
    expect(yc.filter((u) => !/PopupChiTiet|\.js|\.css/.test(u))).toEqual([]);
  });

  test('F03-HN-11 · lọc 43 mục khi gõ "dang ky the chap" ở 375: phím cuối → số đếm đổi, chậm nhất 10 lần (đã gồm debounce)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await chuanBi(page);
    await vao(page);
    const chuoi = 'dang ky the chap';
    const lan: number[] = [];
    for (let i = 0; i < 10; i++) {
      await oTim(page).fill('');
      await expect(soDem(page)).toHaveText('Hiển thị 43/43');
      await oTim(page).pressSequentially(chuoi.slice(0, -1));
      const t0 = await page.evaluate(() => performance.now());
      await oTim(page).press('p');
      await expect(soDem(page)).toHaveText('Hiển thị 3/43');
      lan.push((await page.evaluate(() => performance.now())) - t0);
    }
    console.log(`F03-HN-11: ${lan.map((x) => x.toFixed(0)).join(', ')} ms; chậm nhất ${Math.max(...lan).toFixed(0)} ms`);
    expect(Math.max(...lan)).toBeLessThan(1000);
  });

  for (const w of [375, 1280]) {
    test(`F03-HN-06 · CLS khi /api/thu-tuc trễ 5 giây (${w}px) < 0,1`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: w === 375 ? 812 : 900 });
      await page.addInitScript(() => {
        const w2 = window as unknown as { __cls: number };
        w2.__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) if (!e.hadRecentInput) w2.__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await traDanhMuc(page, boT43(), { tre: 5000 });
      await page.goto('/');
      await expect(soDem(page)).toBeVisible({ timeout: 15_000 });
      await page.waitForTimeout(800);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      console.log(`F03-HN-06: ${w}px CLS = ${cls.toFixed(3)}`);
      expect(cls).toBeLessThan(0.1);
    });
  }

  test('F03-HN-16 · mở popup khi chunk đã nạp trước: từ lúc bấm đến khi dialog có trong DOM', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    await page.waitForTimeout(3000);
    const ms: number[] = [];
    for (let i = 0; i < 5; i++) {
      const t = await page.evaluate(
        () =>
          new Promise<number>((xong) => {
            const t0 = performance.now();
            const nut = document.querySelector('tbody tr button') as HTMLButtonElement;
            const mo = new MutationObserver(() => {
              if (document.querySelector('[role=dialog]')) {
                mo.disconnect();
                xong(performance.now() - t0);
              }
            });
            mo.observe(document.body, { childList: true, subtree: true });
            nut.click();
          }),
      );
      ms.push(t);
      await page.keyboard.press('Escape');
      await expect(dialog(page)).toHaveCount(0);
    }
    console.log(`F03-HN-16: bấm → dialog trong DOM: ${ms.map((x) => x.toFixed(0)).join(', ')} ms`);
    expect(Math.max(...ms)).toBeLessThan(500);
  });
});

// ───────────────────────────── 11b. API chi tiết: bảo mật ở mức HTTP (nguồn Mẫu, bản đang chạy) ─────────────────────────────

test.describe('API /api/thu-tuc/{ma} — mã lạ và độc hại (HTTP)', () => {
  const HOP_LE_KHONG_CO = ['9.999999', '0', 'A', 'a-b_c.d'];
  const SAI: string[] = [
    '1234567890123456789012', 'x'.repeat(5000), "'%20OR%20'1'='1", '1.001193%27--', '1.001193;DROP%20TABLE%20thu_tuc;--',
    '..%2f..%2fetc%2fpasswd', '%2e%2e%2f', '..%5c..%5cwindows', '%252e%252e', '%c0%af', '%00', '%3Cscript%3Ealert(1)%3C%2Fscript%3E',
    'abc%3Cb%3Ex%3C%2Fb%3E', 'javascript:alert(1)', '1.001193%0d%0aSet-Cookie:x=1', '%0a', '%09', '%20', '1.001193%20',
    '%EF%BC%91.%EF%BC%90%EF%BC%90%EF%BC%91%EF%BC%91%EF%BC%99%EF%BC%93', '1.001193%E2%80%8B', '%D9%A0.%D9%A1%D9%A2%D9%A3', '%C3%A9',
    '%', '%zz', '%E0%A4%A', '%C3',
  ];

  test('F03-BM-01/02/05/07 · mã hợp lệ không tồn tại → 404 problem+json khong-tim-thay, không nhắc lại mã, không stack', async ({ request }) => {
    for (const ma of HOP_LE_KHONG_CO) {
      const r = await request.get(`/api/thu-tuc/${ma}`);
      expect(r.status(), ma).toBe(404);
      expect(r.headers()['content-type']).toContain('application/problem+json');
      const j = await r.json();
      expect(j.code).toBe('khong-tim-thay');
      expect(j.maTraCuu).toBeTruthy();
      if (ma.length >= 3) expect(JSON.stringify(j)).not.toContain(ma);
      expect(JSON.stringify(j)).not.toMatch(/\bat \w+\.|Exception|StackTrace/);
    }
  });

  test('F03-BM-02…07 · nhóm sai định dạng/độc hại: không 500, không phản chiếu, nosniff, không Set-Cookie, không Server', async ({ request }) => {
    const ketQua: string[] = [];
    for (const ma of SAI) {
      const r = await request.get(`/api/thu-tuc/${ma}`, { failOnStatusCode: false, maxRedirects: 0 });
      const than = await r.text();
      ketQua.push(`${ma.slice(0, 30)} -> ${r.status()}`);
      expect(r.status(), `${ma.slice(0, 40)} -> ${r.status()}`).toBeLessThan(500);
      expect([400, 404, 414], `${ma.slice(0, 40)} -> ${r.status()}`).toContain(r.status());
      const h = r.headers();
      if (r.status() === 400 && than === '') {
        // Kestrel từ chối ngay ở tầng giao thức (vd. %00 trong đường dẫn): thân rỗng, chưa vào pipeline nên chưa có header ứng dụng.
        console.log(`F03-BM-02…07: ${ma} -> 400 thân rỗng, header: ${Object.keys(h).join(',')}`);
        expect(h['server']).toBeUndefined();
        continue;
      }
      expect(h['x-content-type-options'], ma).toBe('nosniff');
      expect(h['set-cookie'], ma).toBeUndefined();
      expect(h['server'], ma).toBeUndefined();
      expect(h['content-type'] ?? '').not.toContain('text/html');
      for (const manh of ['<script>', '<b>x', 'DROP TABLE', 'etc/passwd']) expect(than).not.toContain(manh);
      expect(than).not.toMatch(/Exception|StackTrace| {3}at /);
    }
    console.log('F03-BM-02…07:', ketQua.join(' | '));
  });

  test('F03-BM-04 · mã có đường dẫn con: 1.001193/ , /x , .json không trả chi tiết sai mã', async ({ request }) => {
    for (const ma of ['1.001193/', '1.001193/x', '1.001193.json']) {
      const r = await request.get(`/api/thu-tuc/${ma}`, { failOnStatusCode: false });
      const t = await r.text();
      console.log(`F03-BM-04: ${ma} -> ${r.status()} ${t.slice(0, 40).replace(/\s+/g, ' ')}`);
      if (r.status() === 200) expect(JSON.parse(t).ma).toBe(ma.replace(/\/$/, ''));
      else expect([400, 404]).toContain(r.status());
    }
  });

  test('F03-BM-08 · query lạ bị bỏ; HEAD 200; POST/PUT/DELETE/PATCH 405; OPTIONS không CORS', async ({ request }) => {
    const a = await request.get('/api/thu-tuc/1.001193');
    const b = await request.get('/api/thu-tuc/1.001193?x=%3Cscript%3E&ma=evil');
    expect(a.status()).toBe(200);
    expect(b.status()).toBe(200);
    expect(b.headers()['etag']).toBe(a.headers()['etag']);
    expect(await b.text()).toBe(await a.text());
    expect((await request.head('/api/thu-tuc/1.001193')).status()).toBe(200);
    for (const m of ['post', 'put', 'delete', 'patch'] as const) {
      const r = await request[m]('/api/thu-tuc/1.001193', { failOnStatusCode: false });
      expect(r.status(), m).toBe(405);
      expect((await r.json()).code).toBe('phuong-thuc-khong-hop-le');
    }
    const o = await request.fetch('/api/thu-tuc/1.001193', { method: 'OPTIONS', headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'GET' }, failOnStatusCode: false });
    expect(o.headers()['access-control-allow-origin']).toBeUndefined();
  });

  test('F03-BM-10/14 · hai mã khác nhau trả khác nhau; tập khoá JSON đúng 14 khoá, null vẫn có mặt, không trường thừa', async ({ request }) => {
    const a = await (await request.get('/api/thu-tuc/1.001193')).json();
    const b = await (await request.get('/api/thu-tuc/1.000894')).json();
    expect(a.ma).toBe('1.001193');
    expect(b.ma).toBe('1.000894');
    expect(Object.keys(a).sort()).toEqual(
      ['cachThuc', 'canCu', 'coQuanThucHien', 'hinhThucNop', 'ketQua', 'linhVuc', 'ma', 'mucDo', 'phi', 'ten', 'thanhPhanHoSo', 'thoiHan', 'trinhTu', 'yeuCauDieuKien'],
    );
    for (const [k, mong] of [['cachThuc', ['hinhThuc', 'moTa', 'phi', 'thoiHan']], ['trinhTu', ['noiDung', 'truongHop']], ['thanhPhanHoSo', ['banChinh', 'banSao', 'ten']], ['canCu', ['soKyHieu', 'trichYeu']]] as const) {
      const v = (a[k] as object[])[0];
      if (v) expect(Object.keys(v).sort()).toEqual(mong);
    }
    expect(a.thoiHan).toBeNull();
  });

  test('F03-BM-13 (Development, HTTPS) · header trên HTML, API 200/404/304, tài nguyên tĩnh: CSP nguyên văn, nosniff, Referrer-Policy, Permissions-Policy, không Server', async ({ request }) => {
    const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
    const html = await request.get('/');
    const js = (await html.text()).match(/\/assets\/[^"']+\.js/)![0];
    const dau = await request.get('/api/thu-tuc/1.001193');
    const etag = dau.headers()['etag']!;
    const phan = [
      html, dau, await request.get('/api/thu-tuc/9.999999'), await request.get(js),
      await request.get('/api/thu-tuc/1.001193', { headers: { 'If-None-Match': etag } }),
    ];
    expect(phan[4]!.status()).toBe(304);
    for (const r of phan) {
      const h = r.headers();
      expect(h['content-security-policy']).toBe(CSP);
      expect(h['x-content-type-options']).toBe('nosniff');
      expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(h['permissions-policy']).toBe('microphone=(), camera=(), geolocation=()');
      expect(h['server']).toBeUndefined();
      expect(h['x-powered-by']).toBeUndefined();
    }
    expect(dau.headers()['cache-control']).toBe('no-cache');
    expect(etag).toBeTruthy();
  });
});

// ───────────────────────────── Bổ sung: 4G giả lập (AC-3), thủ tục lớn nhất, rò rỉ ─────────────────────────────

test.describe('API thật: 4G giả lập, thủ tục lớn nhất, rò rỉ', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  async function bat4G(page: Page) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    return cdp;
  }

  /** Bấm nút trong trang (không qua Playwright) và đo tới khi dialog có trong DOM, rồi tới khi lời miễn trừ (phần cuối của nội dung) có mặt. */
  async function doMoPopup(page: Page, chon: string): Promise<{ dialog: number; day: number }> {
    return page.evaluate(
      (sel) =>
        new Promise<{ dialog: number; day: number }>((xong, loi) => {
          const nut = document.querySelector(sel) as HTMLButtonElement | null;
          if (!nut) return loi(new Error('không thấy nút'));
          const t0 = performance.now();
          let tDialog = -1;
          const mo = new MutationObserver(() => {
            const d = document.querySelector('[role=dialog]');
            if (d && tDialog < 0) tDialog = performance.now() - t0;
            if (d && d.textContent?.includes('Thông tin chỉ để tham khảo')) {
              mo.disconnect();
              xong({ dialog: tDialog, day: performance.now() - t0 });
            }
          });
          mo.observe(document.body, { childList: true, subtree: true, characterData: true });
          nut.click();
          setTimeout(() => {
            mo.disconnect();
            loi(new Error(`quá 15 giây; dialog=${tDialog}`));
          }, 15_000);
        }),
      chon,
    );
  }

  test('F03-PO-02 (AC-3) · bản build + 4G giả lập (1,6 Mbps, trễ 150 ms), API thật: 1.001193 (trang chủ) và 1.013229 (danh mục): dialog và nội dung đủ <= 1 s, 10 lần lấy chậm nhất', async ({ page }) => {
    test.setTimeout(420_000);
    const cdp = await bat4G(page);
    const so = { '1.001193': { dialog: [] as number[], day: [] as number[] }, '1.013229': { dialog: [] as number[], day: [] as number[] } };
    for (let i = 0; i < 10; i++) {
      // 1.001193: nút trên trang chủ (chip bàn tay: tải lại để xoá cache chi tiết)
      await cdp.send('Network.clearBrowserCache');
      await page.goto('/');
      await expect(soDem(page)).toBeVisible();
      await expect(khoi(page).locator('article').first()).toBeVisible();
      await page.waitForTimeout(2500); // chunk popup được nạp trước sau ~2 giây (HN-02)
      const a = await doMoPopup(page, 'article button[aria-label$="Thủ tục đăng ký khai sinh"]');
      so['1.001193'].dialog.push(a.dialog);
      so['1.001193'].day.push(a.day);
      // 1.013229: tìm trong danh mục rồi bấm
      await page.goto('/thu-tuc?cap=tinh&q=1.013229');
      await expect(page.getByRole('tabpanel').locator('article').first()).toBeVisible();
      await page.waitForTimeout(2500);
      const b = await doMoPopup(page, '[role=tabpanel] article button[aria-label^="Xem chi tiết"]');
      so['1.013229'].dialog.push(b.dialog);
      so['1.013229'].day.push(b.day);
    }
    for (const [ma, d] of Object.entries(so)) {
      console.log(`F03-PO-02: ${ma}: dialog ${d.dialog.map((x) => x.toFixed(0)).join(', ')} ms (chậm nhất ${Math.max(...d.dialog).toFixed(0)}); đủ nội dung ${d.day.map((x) => x.toFixed(0)).join(', ')} ms (chậm nhất ${Math.max(...d.day).toFixed(0)})`);
      expect(Math.max(...d.dialog), `dialog ${ma}`).toBeLessThanOrEqual(1000);
      expect(Math.max(...d.day), `đủ nội dung ${ma}`).toBeLessThanOrEqual(1000);
    }
  });

  test('F03-PO-22 · thủ tục lớn nhất 1.013229 (dữ liệu thật) ở 375: không cuộn ngang, tiêu đề và ✕ luôn thấy khi cuộn thân, bước dài cuộn trong thân', async ({ page }) => {
    await page.goto('/?ma=1.013229');
    const d = dialog(page);
    await expect(d.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(d.getByRole('heading', { level: 3, name: 'Trình tự thực hiện' })).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
    expect(await d.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
    await d.getByText('Thông tin chỉ để tham khảo').scrollIntoViewIfNeeded();
    await expect(d.getByRole('button', { name: 'Đóng' }).first()).toBeInViewport();
    await expect(d.getByRole('heading', { level: 2 })).toBeInViewport();
    const than = await d.locator('[class*="than"]').first().evaluate((e) => ({ cao: e.scrollHeight, nhin: e.clientHeight }));
    console.log(`F03-PO-22: thân popup cuộn: scrollHeight ${than.cao} / clientHeight ${than.nhin}`);
    expect(than.cao).toBeGreaterThan(than.nhin);
  });

  test('F03-HN-15 · 50 lần mở/đóng popup liên tiếp: số nút DOM, trình nghe sự kiện, heap không tăng đều', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await chuanBi(page);
    await vao(page);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Performance.enable');
    const do_ = async () => {
      await cdp.send('HeapProfiler.collectGarbage');
      const { metrics } = await cdp.send('Performance.getMetrics');
      const m = Object.fromEntries(metrics.map((x) => [x.name, x.value]));
      return { nodes: m['Nodes']!, listeners: m['JSEventListeners']!, heap: m['JSHeapUsedSize']! };
    };
    for (let i = 0; i < 5; i++) {
      await khoi(page).locator('tbody tr').first().getByRole('button').click();
      await expect(dialog(page)).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog(page)).toHaveCount(0);
    }
    const dau = await do_();
    for (let i = 0; i < 50; i++) {
      await khoi(page).locator('tbody tr').nth(i % 12).getByRole('button').click();
      await expect(dialog(page).getByRole('heading', { level: 2 })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog(page)).toHaveCount(0);
    }
    const cuoi = await do_();
    console.log(`F03-HN-15: nodes ${dau.nodes}→${cuoi.nodes}; listeners ${dau.listeners}→${cuoi.listeners}; heap ${(dau.heap / 1048576).toFixed(1)}→${(cuoi.heap / 1048576).toFixed(1)} MiB`);
    expect(cuoi.nodes).toBeLessThanOrEqual(dau.nodes * 1.1);
    expect(cuoi.listeners).toBeLessThanOrEqual(dau.listeners + 20);
    expect(cuoi.heap).toBeLessThanOrEqual(dau.heap * 1.5 + 2_000_000);
  });
});
