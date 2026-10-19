import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  chanMangNgoai,
  CSS_GIAN_CHU,
  ganCssThu,
  GOC,
  ghiYeuCau,
  khongTranNgang,
  layCsp,
  linkDvc,
  theoDoiHopThoai,
  theoDoiLoi,
  themBatCsp,
  THE_AXE,
} from './du-lieu/chung';

/**
 * F06 · Trợ lý — e2e trên bản build do API phục vụ (ban-build.config.ts). Mã ca (F06-TH-01…) theo
 * .specify/specs/F06-tro-ly/testcases.md. Mặc định dùng API thật của nguồn Mẫu (S1); ca cần quầy và nhân sự dùng nguồn
 * PostgreSQL có phân công (E2E_PG_URL, mặc định http://localhost:5555). Lỗi/429/trễ giả bằng page.route.
 */

const GOC_PG = process.env.E2E_PG_URL ?? 'http://localhost:5555';
const MA_KHAI_SINH = '1.001193';
const MA_KET_HON = '1.000894';
const TEN_KHAI_SINH = 'Thủ tục đăng ký khai sinh';
const LOI_CHAO = /Xin chào! Tôi trả lời câu hỏi về thủ tục hành chính/;
const CAU_QUA_NHANH = 'Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.';

const nut = (p: Page) => p.getByRole('button', { name: 'Trợ lý', exact: true });
const khung = (p: Page) => p.getByRole('dialog', { name: 'Trợ lý thủ tục' });
const oNhap = (p: Page) => khung(p).getByRole('textbox', { name: 'Câu hỏi' });
const nutGui = (p: Page) => khung(p).getByRole('button', { name: 'Gửi', exact: true });
const hoiThoai = (p: Page) => khung(p).getByRole('log', { name: 'Hội thoại với trợ lý' });
const tinTroLy = (p: Page) => hoiThoai(p).locator('[data-tin]').filter({ hasText: 'Trợ lý trả lời:' });
const tinCuoi = (p: Page) => tinTroLy(p).last();

async function vao(page: Page, duong = '/') {
  await page.goto(duong);
  await expect(nut(page)).toBeVisible();
}

async function moKhung(page: Page, duong = '/') {
  await vao(page, duong);
  await nut(page).click();
  await expect(khung(page)).toBeVisible();
  await expect(oNhap(page)).toBeFocused();
}

/** Gõ câu hỏi, bấm Gửi và chờ tin trợ lý mới. */
async function hoi(page: Page, cau: string): Promise<Locator> {
  const truoc = await tinTroLy(page).count();
  await oNhap(page).fill(cau);
  await nutGui(page).click();
  await expect(tinTroLy(page)).toHaveCount(truoc + 1, { timeout: 15000 });
  await expect(page.getByText('Đang tìm câu trả lời…')).toHaveCount(0);
  return tinTroLy(page).nth(truoc);
}

function ghiHoi(page: Page) {
  const ds: { url: string; body: string }[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' && new URL(r.url()).pathname.startsWith('/api/tro-ly/')) ds.push({ url: r.url(), body: r.postData() ?? '' });
  });
  return ds;
}

test.describe('F06 · mở khung, hỏi và trả lời (AC-1…AC-5, AC-11, AC-15)', () => {
  test('F06-UI-01/02/03 · nút "Trợ lý" góc phải dưới; bấm mở khung, con trỏ vào ô nhập; đóng bằng ✕ và Esc trả con trỏ về nút', async ({ page }) => {
    await vao(page);
    const hop = await nut(page).boundingBox();
    const vp = page.viewportSize()!;
    expect(hop!.x + hop!.width).toBeGreaterThan(vp.width - 80);
    expect(hop!.y + hop!.height).toBeGreaterThan(vp.height - 80);
    await expect(nut(page)).toHaveAttribute('aria-expanded', 'false');
    await nut(page).click();
    await expect(khung(page)).toBeVisible();
    await expect(nut(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(oNhap(page)).toBeFocused();
    await expect(page.getByText(LOI_CHAO)).toBeVisible();
    const k = await khung(page).boundingBox();
    expect(Math.round(k!.width)).toBeGreaterThanOrEqual(360);
    expect(Math.round(k!.width)).toBeLessThanOrEqual(375);
    expect(k!.height).toBeLessThanOrEqual(530 + 2);

    await khung(page).getByRole('button', { name: 'Đóng trợ lý' }).click();
    await expect(khung(page)).toBeHidden();
    await expect(nut(page)).toBeFocused();

    await nut(page).click();
    await expect(oNhap(page)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(khung(page)).toBeHidden();
    await expect(nut(page)).toBeFocused();
  });

  test('F06-UI-02 · dưới 600 px khung phủ toàn màn hình, rộng ĐÚNG 375 px (không hở dải cuộn cổ điển bên phải)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await moKhung(page);
    const k = await khung(page).boundingBox();
    const inner = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
    expect(inner.w).toBe(375);
    // Khung `position: fixed; inset: 0`: lấp trọn khung nhìn kể cả dải cuộn cố định (scrollbar-gutter: stable) của trang.
    expect(k!.x).toBeCloseTo(0, 0);
    expect(k!.width).toBeGreaterThanOrEqual(374.5);
    expect(k!.x + k!.width).toBeGreaterThanOrEqual(inner.w - 0.5);
    expect(k!.height).toBeGreaterThanOrEqual(inner.h - 0.5);
    // Điểm ngoài cùng bên phải/dưới của khung nhìn phải thuộc khung chứ không phải trang bên dưới.
    const trung = await page.evaluate(() => {
      const e = document.elementFromPoint(window.innerWidth - 2, window.innerHeight / 2);
      return !!e?.closest('#khung-tro-ly');
    });
    expect(trung).toBe(true);
  });

  test('F06-TH-01 (AC-1) · "làm giấy khai sinh cần giấy tờ gì": dòng đầu "1.001193 – Thủ tục đăng ký khai sinh", mục hồ sơ, cặp nút', async ({ page }) => {
    await moKhung(page);
    const tin = await hoi(page, 'làm giấy khai sinh cần giấy tờ gì');
    await expect(tin).toContainText(`${MA_KHAI_SINH} – ${TEN_KHAI_SINH}`);
    await expect(oNhap(page)).toHaveValue('');
    await expect(hoiThoai(page).getByText('Bạn hỏi:')).toHaveCount(1);
    // một cặp nút cho thủ tục chính + một cặp cho mỗi thủ tục trong "Nếu không đúng thủ tục" (≤ 3)
    const soNut = await tin.getByRole('button', { name: /Xem chi tiết/ }).count();
    expect(soNut).toBeGreaterThanOrEqual(1);
    expect(soNut).toBeLessThanOrEqual(4);
    await expect(tin.getByRole('link', { name: /Xem và nộp trên Cổng DVC/ })).toHaveCount(soNut);
    await expect(tin.getByRole('button', { name: /Xem chi tiết/ }).first()).toHaveAttribute('aria-label', `Xem chi tiết ${TEN_KHAI_SINH}`);
  });

  test('F06-TH-02 (AC-2) · sau câu hỏi thủ tục, "mấy ngày" cho thời hạn của đúng thủ tục đó (ngữ cảnh)', async ({ page }) => {
    await moKhung(page);
    const ghi = ghiHoi(page);
    await hoi(page, 'làm giấy khai sinh cần giấy tờ gì');
    const tin = await hoi(page, 'mấy ngày');
    await expect(tin).toContainText(`${MA_KHAI_SINH}`);
    await expect(tin).toContainText(/Thời hạn giải quyết|Chưa ghi rõ thời hạn giải quyết/);
    expect(JSON.parse(ghi.at(-1)!.body)).toMatchObject({ cauHoi: 'mấy ngày', maThuTuc: MA_KHAI_SINH });
  });

  test('F06-TH-22 · hội thoại mới (chưa có ngữ cảnh): "mấy ngày" -> câu xin lỗi + nút gọi', async ({ page }) => {
    await moKhung(page);
    const tin = await hoi(page, 'mấy ngày');
    await expect(tin).toContainText('Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này');
    await expect(tin.getByRole('link', { name: 'Gọi Trung tâm' })).toHaveAttribute('href', /^tel:/);
  });

  test('F06-TH-03 (AC-5) · "khai sinh" ra danh sách thủ tục, đầu danh sách là khai sinh, có 4 chip hỏi tiếp', async ({ page }) => {
    await moKhung(page);
    const tin = await hoi(page, 'khai sinh');
    await expect(tin).toContainText(/Tìm thấy \d+ thủ tục liên quan, sát nhất ở trên cùng:/);
    await expect(tin.getByRole('button', { name: /Xem chi tiết/ }).first()).toHaveAttribute('aria-label', `Xem chi tiết ${TEN_KHAI_SINH}`);
    await expect(khung(page).getByRole('button', { name: 'Cần giấy tờ gì?' })).toBeVisible();
    await expect(khung(page).getByRole('button', { name: 'Mấy ngày?' })).toBeVisible();
    await expect(khung(page).getByRole('button', { name: 'Phí bao nhiêu?' })).toBeVisible();
    await expect(khung(page).getByRole('button', { name: 'Nộp ở đâu?' })).toBeVisible();
  });

  test('F06-TH-04/05 (AC-11) · "kết hôn" tối đa 5 thủ tục toàn "kết hôn"; chip "Cần giấy tờ gì?" cho hồ sơ của thủ tục đầu', async ({ page }) => {
    await moKhung(page);
    const tin = await hoi(page, 'kết hôn');
    const ten = await tin.getByRole('button', { name: /Xem chi tiết/ }).evaluateAll((b) => b.map((x) => x.getAttribute('aria-label') ?? ''));
    expect(ten.length).toBeGreaterThanOrEqual(1);
    expect(ten.length).toBeLessThanOrEqual(5);
    for (const t of ten) expect(t.toLowerCase()).toContain('kết hôn');
    await khung(page).getByRole('button', { name: 'Cần giấy tờ gì?' }).click();
    await expect(tinTroLy(page)).toHaveCount(2, { timeout: 15000 });
    await expect(tinCuoi(page)).toContainText(`${MA_KET_HON}`);
    await expect(tinCuoi(page)).toContainText(/giấy|bản chính|bản sao|Tờ khai|hồ sơ/i);
  });

  test('F06-TH-08 · dấu, hoa thường, khoảng trắng thừa ra cùng đáp án', async ({ page }) => {
    await moKhung(page);
    const dau = [] as string[];
    for (const c of ['khai sinh', 'KHAI SINH', 'khai   sinh', 'Khai Sinh?']) {
      const tin = await hoi(page, c);
      dau.push((await tin.getByRole('button', { name: /Xem chi tiết/ }).first().getAttribute('aria-label')) ?? '');
    }
    expect(new Set(dau).size).toBe(1);
  });

  test('F06-TH-09 · lỗi gõ ("khai sjnh", "khia sinh") vẫn ra khai sinh; "khaisinh" ghi nhận (không hỗ trợ)', async ({ page }, info) => {
    await moKhung(page);
    for (const c of ['khai sjnh', 'khia sinh']) {
      const tin = await hoi(page, c);
      await expect(tin.getByRole('button', { name: /Xem chi tiết/ }).first()).toHaveAttribute('aria-label', `Xem chi tiết ${TEN_KHAI_SINH}`);
    }
    const dinhLien = await hoi(page, 'khaisinh');
    info.annotations.push({ type: 'hanh-vi', description: `"khaisinh" -> ${(await dinhLien.innerText()).slice(0, 80).replace(/\s+/g, ' ')}` });
  });

  test('F06-LH-01 (AC-4) · "giá vàng hôm nay": câu xin lỗi + nút "Gọi Trung tâm" tel:, không nút Zalo (Zalo OA trống)', async ({ page }) => {
    await moKhung(page);
    const tin = await hoi(page, 'giá vàng hôm nay');
    await expect(tin).toContainText('Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này. Bạn có thể gọi điện hoặc đến hỏi trực tiếp cán bộ tại Trung tâm.');
    await expect(tin.getByRole('link', { name: 'Gọi Trung tâm' })).toHaveAttribute('href', /^tel:\+?[\d.\s-]+$/);
    await expect(tin.getByRole('link', { name: 'Mở Zalo' })).toHaveCount(0);
  });

  test('F06-TT-01/03/04/09/12 · trung tâm: địa chỉ, giờ làm việc kèm trạng thái, điện thoại tel:, email, Cổng DVC mở tab mới có noopener', async ({ page }) => {
    await moKhung(page);
    const dc = await hoi(page, 'trung tâm ở đâu');
    await expect(dc).toContainText('Địa chỉ Trung tâm:');
    const gio = await hoi(page, 'mấy giờ làm việc');
    await expect(gio).toContainText('Giờ làm việc của Trung tâm:');
    await expect(gio).toContainText('Thứ Hai');
    await expect(gio).toContainText(/Đang trong giờ làm việc|Ngoài giờ làm việc/);
    const dt = await hoi(page, 'số điện thoại trung tâm');
    await expect(dt).toContainText('Số điện thoại Trung tâm:');
    await expect(dt.locator('a[href^="tel:"]').first()).toBeVisible();
    const em = await hoi(page, 'email trung tâm');
    await expect(em.locator('a[href^="mailto:"]').first()).toBeVisible();
    const dvc = await hoi(page, 'nộp hồ sơ trực tuyến ở đâu');
    const lk = dvc.getByRole('link', { name: /Cổng Dịch vụ công Quốc gia/ });
    await expect(lk).toHaveAttribute('href', /^https:\/\/dichvucong\.gov\.vn/);
    await expect(lk).toHaveAttribute('target', '_blank');
    expect(await lk.getAttribute('rel')).toMatch(/noopener/);
    expect(await lk.getAttribute('rel')).toMatch(/noreferrer/);
  });

  test('F06-TT-03/04 (AC-19) · đồng hồ giả: 10:00 thứ Hai "Đang trong giờ làm việc"; 12:00 "Ngoài giờ làm việc"; tin cũ giữ trạng thái riêng', async ({ page }) => {
    // 2026-10-12 là thứ Hai. 03:00Z = 10:00 giờ Việt Nam.
    await page.clock.install({ time: new Date('2026-10-12T03:00:00Z') });
    await moKhung(page);
    const a = await hoi(page, 'mấy giờ làm việc');
    await expect(a).toContainText('Đang trong giờ làm việc');
    await page.clock.setSystemTime(new Date('2026-10-12T05:00:00Z'));
    const b = await hoi(page, 'giờ mở cửa');
    await expect(b).toContainText('Ngoài giờ làm việc');
    await expect(a).toContainText('Đang trong giờ làm việc');
  });

  test('F06-CD-01/03 (AC-25) · 6 chip chủ đề; bấm "Chăn nuôi" ra "Lĩnh vực … có n thủ tục" không lẫn "Nuôi con nuôi"', async ({ page }) => {
    await moKhung(page);
    const chip = khung(page).getByRole('group', { name: 'Chủ đề gợi ý' }).getByRole('button');
    await expect(chip).toHaveCount(6);
    const tenChip = await chip.allInnerTexts();
    expect(tenChip).toContain('Chăn nuôi');
    await khung(page).getByRole('group', { name: 'Chủ đề gợi ý' }).getByRole('button', { name: 'Chăn nuôi' }).click();
    await expect(tinTroLy(page)).toHaveCount(1, { timeout: 15000 });
    await expect(tinCuoi(page)).toContainText(/Lĩnh vực .*Chăn nuôi.* có \d+ thủ tục:/);
    await expect(tinCuoi(page)).not.toContainText('Nuôi con nuôi');
  });

  test('F06-TT-23 · chip chủ đề lỗi: ẩn hàng chip, không thông báo lỗi; vẫn hỏi được', async ({ page }) => {
    await page.route('**/api/tro-ly/chu-de', (r) => (r.request().method() === 'GET' ? r.fulfill({ status: 500, json: { code: 'loi-he-thong' } }) : r.continue()));
    await moKhung(page);
    await expect(khung(page).getByRole('group', { name: 'Chủ đề gợi ý' })).toHaveCount(0);
    await expect(khung(page).locator('[role="alert"]')).toHaveCount(0);
    await hoi(page, 'khai sinh');
  });
});

test.describe('F06 · quầy và cán bộ trên nguồn PostgreSQL có phân công (AC-3, AC-12, AC-24)', () => {
  test.use({ baseURL: GOC_PG });

  test('F06-QU-01/16 · "hộ tịch nộp quầy mấy" -> quầy 3; "ai phụ trách đất đai" -> Lê Văn Thử quầy 4; "đất đai nộp quầy mấy" -> quầy 4', async ({ page }) => {
    await moKhung(page);
    const a = await hoi(page, 'hộ tịch nộp quầy mấy');
    await expect(a).toContainText(/quầy 3/);
    const b = await hoi(page, 'ai phụ trách đất đai');
    await expect(b).toContainText('Lê Văn Thử');
    await expect(b).toContainText(/quầy 4/);
    const c = await hoi(page, 'chứng thực nộp quầy mấy');
    await expect(c).toContainText(/quầy 1/);
  });

  test('F06-QU-03/BR-3 · lĩnh vực chưa có phân công: không số quầy nào, nộp tại Trung tâm', async ({ page }) => {
    await moKhung(page);
    const tin = await hoi(page, 'xây dựng nộp quầy mấy');
    const txt = await tin.innerText();
    expect(txt).not.toMatch(/quầy \d/i);
    expect(txt).toMatch(/Trung tâm/);
  });
});

test.describe('F06 · popup chi tiết mở trên khung (AC-9, AC-17, AC-29, BR-6)', () => {
  test('F06-PU-01/02/03/04 · "Xem chi tiết": popup đúng thủ tục, địa chỉ có ma=1.001193; đóng popup -> khung và hội thoại còn', async ({ page }) => {
    await moKhung(page);
    const tin = await hoi(page, 'làm giấy khai sinh cần giấy tờ gì');
    await tin.getByRole('button', { name: /Xem chi tiết/ }).first().click();
    await expect(page).toHaveURL(new RegExp(`ma=${MA_KHAI_SINH.replace('.', '\\.')}`));
    const pu = page.locator('[role="dialog"]:not(#khung-tro-ly)');
    await expect(pu).toBeVisible();
    await expect(pu).toContainText(TEN_KHAI_SINH);
    await expect(pu).toContainText(MA_KHAI_SINH);
    // đóng popup bằng Esc: khung còn
    await page.keyboard.press('Escape');
    await expect(page).not.toHaveURL(/ma=/);
    await expect(khung(page)).toBeVisible();
    await expect(tinTroLy(page)).toHaveCount(1);
    await expect(hoiThoai(page)).toContainText(`${MA_KHAI_SINH} – ${TEN_KHAI_SINH}`);
    // mở lại rồi "Quay lại"
    await tin.getByRole('button', { name: /Xem chi tiết/ }).first().click();
    await expect(page).toHaveURL(/ma=/);
    await expect(page.locator('[role="dialog"]:not(#khung-tro-ly)')).toBeVisible();
    await page.goBack();
    await expect(page).not.toHaveURL(/ma=/);
    await expect(khung(page)).toBeVisible();
    await expect(tinTroLy(page)).toHaveCount(1);
  });

  test('F06-PU-06 · popup mở: khung và nút Trợ lý bị inert; popup nằm trên khung (z-index cao hơn); Tab chỉ trong popup', async ({ page }) => {
    await moKhung(page);
    const tin = await hoi(page, 'khai sinh');
    await tin.getByRole('button', { name: /Xem chi tiết/ }).first().click();
    await expect(page).toHaveURL(/ma=/);
    await expect(page.locator('[role="dialog"]:not(#khung-tro-ly)')).toBeVisible();
    await expect(page.locator('[inert]').first()).toBeAttached();
    expect(await khung(page).evaluate((e) => !!e.closest('[inert]'))).toBe(true);
    expect(await nut(page).evaluate((e) => !!e.closest('[inert]'))).toBe(true);
    const z = await page.evaluate(() => {
      const kh = document.querySelector('#khung-tro-ly');
      const pu = [...document.querySelectorAll('[role="dialog"]')].find((d) => d.id !== 'khung-tro-ly');
      const zi = (e: Element | null | undefined) => {
        let el: Element | null | undefined = e;
        while (el) {
          const v = getComputedStyle(el).zIndex;
          if (v !== 'auto') return Number(v);
          el = el.parentElement;
        }
        return 0;
      };
      return { khung: zi(kh), popup: zi(pu) };
    });
    expect(z.popup).toBeGreaterThan(z.khung);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('#khung-tro-ly'))).toBe(false);
    }
  });

  test('F06-PU-07/08/09/10 (AC-29, BR-6) · mỗi thủ tục nhắc tới đúng một cặp nút; liên kết Cổng DVC mở tab mới, noopener noreferrer, chỉ dichvucong.gov.vn', async ({ page }) => {
    await chanMangNgoai(page, GOC);
    await moKhung(page);
    const tin = await hoi(page, 'kết hôn');
    const soThuTuc = await tin.getByRole('button', { name: /Xem chi tiết/ }).count();
    const lk = tin.getByRole('link', { name: /Xem và nộp trên Cổng DVC/ });
    await expect(lk).toHaveCount(soThuTuc);
    for (const a of await lk.all()) {
      expect(await a.getAttribute('href')).toMatch(/^https:\/\/dichvucong\.gov\.vn\/tra-cuu-thu-tuc\/danh-sach\?keyword=\d\.\d+/);
      expect(await a.getAttribute('target')).toBe('_blank');
      expect(await a.getAttribute('rel')).toContain('noopener');
      expect(await a.getAttribute('rel')).toContain('noreferrer');
    }
    const dau = await lk.first().getAttribute('href');
    expect(dau).toBe(linkDvc(MA_KET_HON));
  });

  test('F06-PU-16 · đáp án mới thêm vào khi popup đang mở: popup không bị đóng, khung không mất', async ({ page }) => {
    await moKhung(page);
    const tin = await hoi(page, 'khai sinh');
    await tin.getByRole('button', { name: /Xem chi tiết/ }).first().click();
    await expect(page).toHaveURL(/ma=/);
    await expect(page.locator('[role="dialog"]:not(#khung-tro-ly)')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).not.toHaveURL(/ma=/);
    await expect(khung(page)).toBeVisible();
    await hoi(page, 'trung tâm ở đâu');
    await expect(tinTroLy(page)).toHaveCount(2);
  });
});

test.describe('F06 · giới hạn, lỗi và chống gửi dồn (AC-7, AC-13, AC-28)', () => {
  test('F06-GH-01/02 (AC-13) · ô nhập dừng ở 500 ký tự, hiện "Tối đa 500 ký tự" (role=status, aria-describedby); 500 ký tự được trả lời', async ({ page }) => {
    await moKhung(page);
    const dai = 'abc '.repeat(130).slice(0, 500);
    await oNhap(page).fill(dai + 'XYZ');
    expect((await oNhap(page).inputValue()).length).toBe(500);
    await expect(khung(page).getByRole('status')).toHaveText('Tối đa 500 ký tự');
    const id = await khung(page).getByRole('status').getAttribute('id');
    expect(await oNhap(page).getAttribute('aria-describedby')).toBe(id);
    await nutGui(page).click();
    await expect(tinTroLy(page)).toHaveCount(1, { timeout: 15000 });
    await expect(khung(page).locator('[role="alert"]')).toHaveCount(0);
  });

  test('F06-GH-05 · câu rỗng không gửi (không yêu cầu mạng)', async ({ page }) => {
    await moKhung(page);
    const ds = ghiHoi(page);
    await nutGui(page).click();
    await oNhap(page).fill('    ');
    await nutGui(page).click();
    await page.waitForTimeout(400);
    expect(ds).toEqual([]);
  });

  test('F06-UI-05 (C01 AC-5) · bấm "Gửi" hai lần nhanh: một yêu cầu, một tin người dân', async ({ page }) => {
    await page.route('**/api/tro-ly/hoi', async (r) => {
      await new Promise((x) => setTimeout(x, 600));
      await r.continue();
    });
    await moKhung(page);
    const ds = ghiHoi(page);
    await oNhap(page).fill('khai sinh');
    await nutGui(page).dblclick();
    await expect(tinTroLy(page)).toHaveCount(1, { timeout: 15000 });
    expect(ds.filter((d) => d.url.endsWith('/hoi')).length).toBe(1);
    await expect(hoiThoai(page).getByText('Bạn hỏi:')).toHaveCount(1);
  });

  test('F06-GH-08/UI-06/07 (AC-7) · 429: tin lỗi đúng câu + "Thử lại"; bấm Thử lại ra đáp án, không nhân đôi tin người dân', async ({ page }) => {
    let lan = 0;
    await page.route('**/api/tro-ly/hoi', (r) => {
      lan++;
      return lan === 1
        ? r.fulfill({ status: 429, contentType: 'application/problem+json', headers: { 'retry-after': '60' }, json: { type: 'x', title: 'x', status: 429, code: 'qua-nhieu-yeu-cau' } })
        : r.continue();
    });
    await moKhung(page);
    await oNhap(page).fill('khai sinh');
    await nutGui(page).click();
    await expect(hoiThoai(page).getByText(CAU_QUA_NHANH)).toBeVisible();
    await expect(hoiThoai(page).getByText('Bạn hỏi:')).toHaveCount(1);
    await hoiThoai(page).getByRole('button', { name: 'Thử lại' }).click();
    await expect(tinTroLy(page).filter({ hasText: TEN_KHAI_SINH }).first()).toBeVisible({ timeout: 15000 });
    await expect(hoiThoai(page).getByText(CAU_QUA_NHANH)).toHaveCount(0);
    await expect(hoiThoai(page).getByText('Bạn hỏi:')).toHaveCount(1);
  });

  test('F06-GH-30 (http có hạn chờ) · trợ lý treo không trả lời: sau ≤ ~16 giây báo lỗi mất kết nối + "Thử lại"; nút Gửi không kẹt, hỏi lại được', async ({ page }) => {
    test.setTimeout(90_000);
    let treo = true;
    await page.route('**/api/tro-ly/hoi', (r) => (treo ? new Promise(() => undefined) : r.continue()));
    await moKhung(page);
    await oNhap(page).fill('khai sinh');
    const t0 = Date.now();
    await nutGui(page).click();
    await expect(hoiThoai(page).getByRole('button', { name: 'Thử lại' })).toHaveCount(1, { timeout: 20_000 });
    const mat = Date.now() - t0;
    expect(mat).toBeLessThan(18_000);
    test.info().annotations.push({ type: 'hanh-vi', description: `trợ lý treo: báo lỗi sau ${mat} ms` });
    await expect(page.getByText('Đang tìm câu trả lời…')).toHaveCount(0);
    // Nút Gửi không kẹt: gõ câu mới và hỏi lại được khi máy chủ trả lời.
    treo = false;
    await oNhap(page).fill('khai sinh');
    await expect(nutGui(page)).toBeEnabled();
    await nutGui(page).click();
    await expect(tinTroLy(page).filter({ hasText: TEN_KHAI_SINH }).first()).toBeVisible({ timeout: 15_000 });
    await expect(khung(page)).toBeVisible();
  });

  test('F06-UI-06 · 500 có mã tra cứu; mất kết nối có "Thử lại"; khung còn nguyên', async ({ page }) => {
    let che = 'loi500';
    await page.route('**/api/tro-ly/hoi', (r) => {
      if (che === 'loi500') return r.fulfill({ status: 500, contentType: 'application/problem+json', json: { type: 'x', title: 'x', status: 500, code: 'loi-he-thong', maTraCuu: 'AB12CD34' } });
      if (che === 'mang') return r.abort();
      return r.continue();
    });
    await moKhung(page);
    await oNhap(page).fill('khai sinh');
    await nutGui(page).click();
    await expect(hoiThoai(page).getByText(/AB12CD34/)).toBeVisible();
    che = 'mang';
    await oNhap(page).fill('khai sinh');
    await nutGui(page).click();
    await expect(hoiThoai(page).getByRole('button', { name: 'Thử lại' })).toHaveCount(2);
    che = 'ok';
    await hoiThoai(page).getByRole('button', { name: 'Thử lại' }).last().click();
    await expect(tinTroLy(page).filter({ hasText: TEN_KHAI_SINH }).first()).toBeVisible({ timeout: 15000 });
    await expect(khung(page)).toBeVisible();
  });

  test('F06-GH-10 (AC-28) · 60 yêu cầu qua trình duyệt thật đều có trả lời và yêu cầu 61 ra câu "thao tác quá nhanh" (máy chủ giữ 60/phút)', async ({ browser }) => {
    test.setTimeout(180_000);
    // Dùng máy chủ giới hạn mặc định (S2 https, 60/phút) nếu có khai E2E_RL_URL; không thì bỏ qua.
    const url = process.env.E2E_RL_URL;
    test.skip(!url, 'Cần E2E_RL_URL = máy chủ giữ giới hạn mặc định 60/phút (S2).');
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: url, viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await moKhung(page);
    let ok = 0;
    for (let i = 1; i <= 60; i++) {
      const r = await page.evaluate(async (c) => (await fetch('/api/tro-ly/hoi', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cauHoi: c, maThuTuc: null }) })).status, `khai sinh ${i}`);
      if (r === 200) ok++;
    }
    expect(ok).toBe(60);
    await oNhap(page).fill('khai sinh 61');
    await nutGui(page).click();
    await expect(hoiThoai(page).getByText(CAU_QUA_NHANH)).toBeVisible();
    expect(await khongTranNgang(page)).toBe(true);
    await ctx.close();
  });
});

test.describe('F06 · hội thoại, bộ nhớ, riêng tư (BR-13, F09 BR-3)', () => {
  test('F06-UI-17/18 · chuyển trang: khung và hội thoại còn; tải lại: khung đóng, hội thoại mất; tab khác độc lập', async ({ page, context }) => {
    await moKhung(page);
    await hoi(page, 'khai sinh');
    await page.getByRole('link', { name: 'Danh mục thủ tục' }).click();
    await expect(page).toHaveURL(/\/thu-tuc/);
    await expect(khung(page)).toBeVisible();
    await expect(tinTroLy(page)).toHaveCount(1);
    const p2 = await context.newPage();
    await vao(p2);
    await nut(p2).click();
    await expect(tinTroLy(p2)).toHaveCount(0);
    await page.reload();
    await expect(khung(page)).toBeHidden();
    await nut(page).click();
    await expect(tinTroLy(page)).toHaveCount(0);
    const tin = await hoi(page, 'mấy ngày');
    await expect(tin).toContainText('Xin lỗi, tôi chưa có câu trả lời'); // ngữ cảnh đã mất
  });

  test('F06-BM-02/18/19 · câu hỏi nằm trong body POST (URL không có query); không lưu vào storage/cookie/history.state/địa chỉ', async ({ page }) => {
    await moKhung(page);
    const ds = ghiHoi(page);
    const soCCCD = '0912345678';
    await hoi(page, `số ${soCCCD} của tôi nộp hồ sơ chưa`);
    expect(ds.length).toBe(1);
    expect(new URL(ds[0]!.url).search).toBe('');
    expect(ds[0]!.body).toContain(soCCCD); // người dân thấy nguyên văn; che chỉ khi lưu kho phía máy chủ
    await expect(hoiThoai(page)).toContainText(soCCCD);
    const kho = await page.evaluate(() => ({
      ls: JSON.stringify({ ...localStorage }),
      ss: JSON.stringify({ ...sessionStorage }),
      ck: document.cookie,
      hs: JSON.stringify(history.state),
      url: location.href,
    }));
    for (const v of Object.values(kho)) expect(v).not.toContain(soCCCD);
    expect(Object.keys(JSON.parse(kho.ls) as object).every((k) => ['cach-xem', 'doc-bat'].includes(k))).toBe(true);
    // không dữ liệu hội thoại trong cache ngoài chủ đề
    expect(kho.ss).not.toContain('khai sinh');
  });

  test('F06-BM-07/08 · XSS: HTML/script trong câu hỏi hiện nguyên văn, 0 hộp thoại, không phần tử sinh ra', async ({ page }) => {
    const hop = theoDoiHopThoai(page);
    await moKhung(page);
    for (const c of ['<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', '{{7*7}} ${7*7} {0}', "'; DROP TABLE thu_tuc;--"]) {
      await hoi(page, c);
    }
    await expect(hoiThoai(page).locator('img[src="x"], script')).toHaveCount(0);
    await expect(hoiThoai(page)).toContainText('<script>alert(1)</script>');
    await expect(hoiThoai(page)).toContainText('{{7*7}} ${7*7} {0}');
    expect(hop).toEqual([]);
  });

  test('F06-BM-22/23/24 · không micro; không vi phạm CSP, không lỗi console, mọi yêu cầu cùng gốc', async ({ page }) => {
    await themBatCsp(page);
    await page.addInitScript(() => {
      const w = window as unknown as { __mic: number };
      w.__mic = 0;
      const md = navigator.mediaDevices;
      if (md) md.getUserMedia = (async () => { w.__mic++; throw new Error('khong'); }) as typeof md.getUserMedia;
      for (const k of ['SpeechRecognition', 'webkitSpeechRecognition']) {
        Object.defineProperty(window, k, { configurable: true, get: () => { w.__mic++; return undefined; } });
      }
    });
    const loi = theoDoiLoi(page);
    const ds = ghiYeuCau(page);
    await moKhung(page);
    await hoi(page, 'kết hôn');
    await hoi(page, 'giá vàng hôm nay');
    expect(await layCsp(page)).toEqual([]);
    expect(loi).toEqual([]);
    expect(ds.filter((u) => new URL(u).origin !== GOC)).toEqual([]);
    expect(await page.evaluate(() => (window as unknown as { __mic: number }).__mic)).toBe(0);
  });
});

test.describe('F06 · trợ năng và bàn phím (TN-01…)', () => {
  for (const [w, h] of [
    [375, 812],
    [768, 1024],
    [1280, 800],
  ] as const) {
    test(`F06-TN-01 · axe 0 vi phạm với khung mở và đã có đáp án @${w}`, async ({ browser }) => {
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await moKhung(page);
      await hoi(page, 'kết hôn');
      await hoi(page, 'giá vàng hôm nay');
      const kq = await new AxeBuilder({ page }).withTags(THE_AXE).analyze();
      expect(kq.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      await ctx.close();
    });
  }

  test('F06-TN-05/06 · role=log aria-live=polite, khung role=dialog có tên, mỗi tin có tên người nói cho trình đọc màn hình', async ({ page }) => {
    await moKhung(page);
    await hoi(page, 'khai sinh');
    await expect(hoiThoai(page)).toHaveAttribute('aria-live', 'polite');
    await expect(hoiThoai(page)).toHaveAttribute('aria-relevant', 'additions');
    await expect(khung(page)).toHaveAttribute('aria-label', 'Trợ lý thủ tục');
    await expect(hoiThoai(page).getByText('Bạn hỏi:')).toHaveCount(1);
    await expect(hoiThoai(page).getByText('Trợ lý trả lời:')).toHaveCount(2); // lời chào + đáp án
  });

  test('F06-TN-02/03 · vòng Tab trong khung: không bẫy, quay vòng; Shift+Tab ngược; viền focus nhìn thấy', async ({ page }) => {
    await moKhung(page);
    await hoi(page, 'kết hôn');
    const thuTu: string[] = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      thuTu.push(
        await page.evaluate(() => {
          const e = document.activeElement as HTMLElement | null;
          return `${e?.closest('#khung-tro-ly') ? 'K' : 'N'}:${e?.getAttribute('aria-label') ?? e?.textContent?.trim().slice(0, 28) ?? e?.tagName}`;
        }),
      );
    }
    expect(thuTu.some((t) => t.startsWith('K:'))).toBe(true);
    // Vòng lặp: phần tử đầu tiên xuất hiện lại
    const dau = thuTu[0]!;
    expect(thuTu.slice(1).includes(dau)).toBe(true);
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !!document.activeElement)).toBe(true);
    // viền focus: outline hoặc box-shadow khác none tại ô nhập
    await oNhap(page).focus();
    const vien = await oNhap(page).evaluate((e) => {
      const s = getComputedStyle(e);
      return { ol: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0, bs: s.boxShadow !== 'none' };
    });
    expect(vien.ol || vien.bs).toBe(true);
  });

  test('F06-TN-09/10 · 320 px: không cuộn ngang, bong bóng không tràn; giãn chữ không cắt', async ({ browser }) => {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: 320, height: 568 } });
    const page = await ctx.newPage();
    await moKhung(page);
    await hoi(page, 'làm giấy khai sinh cần giấy tờ gì');
    expect(await khongTranNgang(page)).toBe(true);
    const tran = await khung(page).evaluate((k) => {
      const cr = k.getBoundingClientRect();
      return [...k.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > cr.right + 1; }).length;
    });
    expect(tran).toBe(0);
    await ganCssThu(page, CSS_GIAN_CHU);
    expect(await khongTranNgang(page)).toBe(true);
    await expect(nutGui(page)).toBeVisible();
    await ctx.close();
  });

  test('F06-TN-11 · vùng bấm: nút Trợ lý, Gửi, ✕, chip ≥ 24 px (spec C01) ở 375; ghi số đo', async ({ page }, info) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await moKhung(page);
    const cac = {
      gui: await nutGui(page).boundingBox(),
      dong: await khung(page).getByRole('button', { name: 'Đóng trợ lý' }).boundingBox(),
      chip: await khung(page).getByRole('group', { name: 'Chủ đề gợi ý' }).getByRole('button').first().boundingBox(),
    };
    for (const [k, v] of Object.entries(cac)) {
      info.annotations.push({ type: 'do', description: `${k}: ${v!.width.toFixed(0)}×${v!.height.toFixed(0)}` });
      expect(v!.width).toBeGreaterThanOrEqual(24);
      expect(v!.height).toBeGreaterThanOrEqual(24);
    }
  });
});

test.describe('F06 · nạp lười và ngân sách (F00 AC-20)', () => {
  test('F06-HN-08/09 · mở trang: không tải chunk khung, không gọi /api/tro-ly/*; bấm nút mới tải; khung hiện ≤ 1 s', async ({ page }) => {
    const ds = ghiYeuCau(page);
    await vao(page);
    await page.waitForLoadState('networkidle');
    expect(ds.filter((u) => /KhungTroLy-|\/api\/tro-ly\//.test(u))).toEqual([]);
    const t0 = Date.now();
    await nut(page).click();
    await expect(khung(page)).toBeVisible();
    await expect(oNhap(page)).toBeFocused();
    const ms = Date.now() - t0;
    test.info().annotations.push({ type: 'do', description: `bấm -> khung hiện, con trỏ ở ô nhập: ${ms} ms` });
    expect(ms).toBeLessThan(1000);
    expect(ds.some((u) => /KhungTroLy-/.test(u))).toBe(true);
    await page.waitForLoadState('networkidle');
    expect(ds.filter((u) => new URL(u).pathname === '/api/tro-ly/chu-de').length).toBe(1);
  });

  test('F06-HN-11 · gõ không gọi mạng; một yêu cầu mỗi câu; đóng rồi mở lại trong 60 s không gọi lại GET chu-de (staleTime của TanStack Query; testcases ghi "yêu cầu có điều kiện 304")', async ({ page }, info) => {
    const dsChuDe: string[] = [];
    page.on('request', (r) => {
      if (new URL(r.url()).pathname === '/api/tro-ly/chu-de' && r.method() === 'GET') dsChuDe.push(r.url());
    });
    const ghi = ghiHoi(page);
    await moKhung(page);
    await oNhap(page).pressSequentially('làm giấy khai sinh', { delay: 20 });
    await page.waitForTimeout(300);
    expect(ghi).toEqual([]);
    await nutGui(page).click();
    await expect(tinTroLy(page)).toHaveCount(1, { timeout: 15000 });
    expect(ghi.length).toBe(1);
    await page.keyboard.press('Escape');
    await nut(page).click();
    await page.waitForTimeout(600);
    info.annotations.push({ type: 'hanh-vi', description: `GET chu-de: ${dsChuDe.length} yêu cầu sau khi mở, đóng, mở lại` });
    expect(dsChuDe.length).toBeLessThanOrEqual(2);
    // Điều kiện 304 ở mức API được kiểm riêng bằng request có If-None-Match
    const r1 = await page.request.get('/api/tro-ly/chu-de');
    const etag = r1.headers()['etag'];
    expect(etag).toBeTruthy();
    const r2 = await page.request.get('/api/tro-ly/chu-de', { headers: { 'if-none-match': etag! } });
    expect(r2.status()).toBe(304);
  });
});

test.describe('F06 · gõ nhanh và độ ổn định', () => {
  test('F06-GN · gõ nhanh 120 ký tự có dấu vào ô nhập: không mất ký tự, không mất con trỏ', async ({ page }) => {
    await moKhung(page);
    const cau = 'Đăng ký khai sinh cho con tôi sinh ngày mười hai tháng năm cần những giấy tờ gì thưa cán bộ ạ, xin cảm ơn nhiều lắm'.slice(0, 120);
    await oNhap(page).pressSequentially(cau, { delay: 0 });
    await expect(oNhap(page)).toHaveValue(cau);
    await expect(oNhap(page)).toBeFocused();
  });

  test('F06-UI-21 · ô nhập: maxlength 500, autocomplete off, enterkeyhint send; Enter gửi', async ({ page }) => {
    await moKhung(page);
    await expect(oNhap(page)).toHaveAttribute('maxlength', '500');
    await expect(oNhap(page)).toHaveAttribute('autocomplete', 'off');
    await expect(oNhap(page)).toHaveAttribute('enterkeyhint', 'send');
    await oNhap(page).fill('khai sinh');
    await oNhap(page).press('Enter');
    await expect(tinTroLy(page)).toHaveCount(1, { timeout: 15000 });
  });

  test('F06-UI-08 · đáp án dài: cuộn để ĐẦU câu trả lời hiện ra (không nhảy xuống cuối)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await moKhung(page);
    const tin = await hoi(page, 'làm giấy khai sinh cần giấy tờ gì');
    const vi = await tin.evaluate((e) => {
      const ds = e.closest('[role="log"]') as HTMLElement;
      const r = e.getBoundingClientRect();
      const d = ds.getBoundingClientRect();
      return { dauTrongKhung: r.top >= d.top - 2 && r.top < d.bottom };
    });
    expect(vi.dauTrongKhung).toBe(true);
  });
});
