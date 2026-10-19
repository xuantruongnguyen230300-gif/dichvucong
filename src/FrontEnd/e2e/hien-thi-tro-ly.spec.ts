import { expect, test, type Page } from '@playwright/test';
import { GOC, CSS_GIAN_CHU, ganCssThu, khongTranNgang, theoDoiHopThoai, theoDoiLoi } from './du-lieu/chung';

/**
 * F06 · hiển thị từng loại đáp án, đồng hồ, trạng thái — e2e trên bản build (ban-build.config.ts) với đáp án giả bằng page.route
 * (dữ liệu phải có hình đúng hợp đồng plan §3.2). Mã ca (F06-VW-01…) theo .specify/specs/F06-tro-ly/testcases.md.
 */

const TT = { ten: 'Trung tâm thử', diaChi: 'Địa chỉ thử A' };
const NGAN = (ma: string, ten: string) => ({ ma, ten, linhVuc: 'Hộ tịch', mucDo: 'toan-trinh', capXa: true, capTinh: true });
const KHAI_SINH = NGAN('1.001193', 'Thủ tục đăng ký khai sinh');
const LIEN_HE = { dienThoai: '0272 389 3900', zaloOa: null as string | null };
const ND = {
  thoiHan: null, phi: null, hinhThucNop: null, thanhPhanHoSo: null, trinhTu: null, ketQua: null, canCu: null, tong: null,
};
const chung = { thuTucDangNoi: null as string | null };
const thuTuc = (muc: string, noiDung: object, extra: object = {}) => ({
  ...chung, loai: 'thu-tuc', muc, thuTuc: KHAI_SINH, thuTucKhac: [], noiDung: { ...ND, ...noiDung }, quay: null, noiTiepNhanChuyen: null, trungTam: TT, ...extra,
});
const trungTam = (muc: string, thongTin: object, lienHe: object | null = LIEN_HE) => ({
  ...chung, loai: 'trung-tam', muc, lienHe,
  thongTin: { coDuLieu: true, diaChi: null, banDo: null, gioLamViec: null, ghiChuNgayNghi: null, dienThoai: null, email: null, lienKet: null, ...thongTin },
});
const GIO = (thu: number, s: [string, string] | null, c: [string, string] | null = null) => ({ thu, sangTu: s?.[0] ?? null, sangDen: s?.[1] ?? null, chieuTu: c?.[0] ?? null, chieuDen: c?.[1] ?? null });
const GIO_T2_T6 = [1, 2, 3, 4, 5].map((t) => GIO(t, ['07:00', '11:30'], ['13:30', '17:00']));
const quay = (extra: object) => ({ ...chung, loai: 'quay', muc: 'quay', linhVuc: null, quay: null, noiTiepNhanChuyen: null, canBo: [], tong: 0, trungTam: TT, ...extra });
const khongHieu = (lienHe: object | null = LIEN_HE) => ({ ...chung, loai: 'khong-hieu', lienHe });
const chuDe = (extra: object) => ({ ...chung, loai: 'chu-de', chuDe: { tenHienThi: 'Hộ tịch', linhVuc: 'Hộ tịch' }, tong: 0, danhSachThuTuc: [], quay: null, noiTiepNhanChuyen: null, trungTam: TT, ...extra });

const nut = (p: Page) => p.getByRole('button', { name: 'Trợ lý', exact: true });
const khung = (p: Page) => p.getByRole('dialog', { name: 'Trợ lý thủ tục' });
const oNhap = (p: Page) => khung(p).getByRole('textbox', { name: 'Câu hỏi' });
const hoiThoai = (p: Page) => khung(p).getByRole('log', { name: 'Hội thoại với trợ lý' });
const tinTroLy = (p: Page) => hoiThoai(p).locator('[data-tin]').filter({ hasText: 'Trợ lý trả lời:' });

async function traHoi(page: Page, ...dapAn: object[]) {
  let i = 0;
  await page.route('**/api/tro-ly/hoi', (r) => r.fulfill({ json: dapAn[Math.min(i++, dapAn.length - 1)] }));
}

async function moKhung(page: Page, duong = '/') {
  await page.goto(duong);
  await nut(page).click();
  await expect(oNhap(page)).toBeFocused();
}

async function hoi(page: Page, cau = 'x') {
  const truoc = await tinTroLy(page).count();
  await oNhap(page).fill(cau);
  await oNhap(page).press('Enter');
  await expect(tinTroLy(page)).toHaveCount(truoc + 1, { timeout: 15000 });
  await expect(page.getByText('Đang tìm câu trả lời…')).toHaveCount(0);
  return tinTroLy(page).nth(truoc);
}

test.describe('F06 · thủ tục: hiển thị từng mục (VW-01…VW-08)', () => {
  test('F06-VW-01/02 · hồ sơ: dòng đầu "mã – tên", tối đa 8 giấy tờ có bản chính/bản sao, "và 4 giấy tờ nữa"; thời hạn null -> "chưa ghi rõ"', async ({ page }) => {
    const giay = Array.from({ length: 8 }, (_, i) => ({ ten: `Giấy tờ số ${i + 1}`, banChinh: i === 0 ? 1 : null, banSao: i === 1 ? 2 : null }));
    await traHoi(page, thuTuc('ho-so', { thanhPhanHoSo: giay, tong: 12 }), thuTuc('thoi-han', { thoiHan: null }), thuTuc('thoi-han', { thoiHan: '3 ngày làm việc' }));
    await moKhung(page);
    const a = await hoi(page);
    await expect(a).toContainText('1.001193 – Thủ tục đăng ký khai sinh');
    await expect(a.locator('ol > li')).toHaveCount(8);
    await expect(a).toContainText('Giấy tờ số 1 (1 bản chính)');
    await expect(a).toContainText('Giấy tờ số 2 (2 bản sao)');
    await expect(a).toContainText('và 4 giấy tờ nữa — xem chi tiết');
    const b = await hoi(page);
    await expect(b).toContainText('Chưa ghi rõ thời hạn giải quyết — xem trên Cổng DVC Quốc gia.');
    const c = await hoi(page);
    await expect(c).toContainText('Thời hạn giải quyết: 3 ngày làm việc');
    const txt = await hoiThoai(page).innerText();
    expect(txt).not.toMatch(/\bnull\b|undefined|NaN/);
  });

  test('F06-VW-04 / QU-02/04/05 (BR-3) · quay null: không có chữ "quầy <số>" và không tên cán bộ, kể cả khi máy chủ gửi nhầm canBo', async ({ page }) => {
    await traHoi(
      page,
      quay({ linhVuc: 'Chứng thực' }),
      quay({ muc: 'can-bo', canBo: [{ hoTen: 'Người Không Nên Hiện', xungHo: 'ông', chucVu: 'x', quay: 4, moTa: null }], tong: 1 }),
      thuTuc('noi-nop', { hinhThucNop: ['Trực tiếp', 'Trực tuyến', 'Bưu chính'] }),
    );
    await moKhung(page);
    const a = await hoi(page);
    await expect(a).toContainText('Hồ sơ lĩnh vực Chứng thực nộp tại Trung tâm thử, địa chỉ Địa chỉ thử A.');
    const b = await hoi(page);
    await expect(b).toContainText('Bạn cho biết lĩnh vực hoặc tên thủ tục');
    await expect(b).not.toContainText('Người Không Nên Hiện');
    const c = await hoi(page);
    await expect(c).toContainText('Hình thức nộp: Trực tiếp, Trực tuyến, Bưu chính');
    expect(await hoiThoai(page).innerText()).not.toMatch(/quầy\s*\d/i);
  });

  test('F06-QU-07/13/19 · cán bộ: tên, chức vụ, quầy; tối đa 10 trong 12 và "và 2 cán bộ nữa"; tên chứa HTML hiện chữ thuần', async ({ page }) => {
    const cb = Array.from({ length: 10 }, (_, i) => ({ hoTen: i === 0 ? '<b>Thử</b> Lê' : `Cán bộ ${i + 1}`, xungHo: 'ông', chucVu: 'Chuyên viên', quay: 4, moTa: i === 0 ? 'm'.repeat(500) : null }));
    await traHoi(page, quay({ muc: 'can-bo', linhVuc: 'Đất đai', quay: 4, canBo: cb, tong: 12 }));
    const hop = theoDoiHopThoai(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await moKhung(page);
    const a = await hoi(page);
    await expect(a).toContainText('Hồ sơ lĩnh vực Đất đai nộp tại quầy 4.');
    await expect(a.locator('ul > li')).toHaveCount(10);
    await expect(a).toContainText('ông <b>Thử</b> Lê (Chuyên viên) – quầy 4');
    await expect(a).toContainText('và 2 cán bộ nữa');
    await expect(a.locator('b')).toHaveCount(0);
    expect(await khongTranNgang(page)).toBe(true);
    expect(hop).toEqual([]);
  });

  test('F06-VW-07/08 · "Nếu không đúng thủ tục" tối đa 3; danh sách "Tìm thấy n thủ tục…" mỗi dòng có mã · cấp · lĩnh vực và một cặp nút', async ({ page }) => {
    const khac = [NGAN('1.000894', 'Thủ tục kết hôn'), NGAN('1.000656', 'Thủ tục thứ ba'), NGAN('2.000001', 'Thủ tục thứ tư')];
    await traHoi(
      page,
      thuTuc('ho-so', { thanhPhanHoSo: [{ ten: 'Tờ khai', banChinh: 1, banSao: null }] }, { thuTucKhac: khac }),
      { ...chung, loai: 'thu-tuc-danh-sach', thuTucDangNoi: '1.001193', danhSachThuTuc: [KHAI_SINH, ...khac] },
    );
    await moKhung(page);
    const a = await hoi(page);
    await expect(a).toContainText('Nếu không đúng thủ tục, chọn lại bên dưới:');
    await expect(a.getByRole('button', { name: /Xem chi tiết/ })).toHaveCount(4);
    const b = await hoi(page);
    await expect(b).toContainText('Tìm thấy 4 thủ tục liên quan, sát nhất ở trên cùng:');
    await expect(b.getByRole('button', { name: /Xem chi tiết/ })).toHaveCount(4);
    await expect(b.getByRole('link', { name: /Xem và nộp trên Cổng DVC/ })).toHaveCount(4);
    await expect(b).toContainText(/1\.001193 · Cấp xã, Cấp tỉnh · Hộ tịch/);
  });

  test('F06-VW-11 / TT-17/18 · trung-tam coDuLieu=false: "Chưa có thông tin về …" + nút gọi (+ Zalo khi có), không đoán giờ hay đường dẫn', async ({ page }) => {
    await traHoi(
      page,
      trungTam('gio-lam-viec', { coDuLieu: false }),
      trungTam('nop-truc-tuyen', { coDuLieu: false }, { dienThoai: '0272 389 3900', zaloOa: 'https://zalo.me/thu-nghiem' }),
    );
    await moKhung(page);
    const a = await hoi(page);
    await expect(a).toContainText('Chưa có thông tin về giờ làm việc.');
    await expect(a.getByRole('link', { name: 'Gọi Trung tâm' })).toHaveAttribute('href', 'tel:02723893900');
    await expect(a.locator('a[href^="http"]')).toHaveCount(0);
    const b = await hoi(page);
    await expect(b).toContainText('Chưa có thông tin về nộp hồ sơ trực tuyến.');
    await expect(b.getByRole('link', { name: 'Mở Zalo' })).toHaveAttribute('href', 'https://zalo.me/thu-nghiem');
    await expect(b).not.toContainText('Đang trong giờ làm việc');
  });
});

test.describe('F06 · Trung tâm: giờ, bản đồ, đồng hồ (TT-05…TT-24)', () => {
  test('F06-TT-15/16/24 · bản đồ trống: chỉ địa chỉ, không "Xem bản đồ"; có bản đồ: liên kết tab mới noopener; địa chỉ 500 ký tự + HTML ngắt dòng ở 375', async ({ page }) => {
    const dai = `<b>${'Số nhà dài '.repeat(45)}</b>`.slice(0, 500);
    await traHoi(page, trungTam('dia-chi', { diaChi: 'Địa chỉ thử A' }), trungTam('dia-chi', { diaChi: 'Địa chỉ thử B', banDo: 'https://maps.example.test/x' }), trungTam('dia-chi', { diaChi: dai }));
    await page.setViewportSize({ width: 375, height: 812 });
    await moKhung(page);
    const a = await hoi(page);
    await expect(a).toContainText('Địa chỉ Trung tâm: Địa chỉ thử A');
    await expect(a.getByRole('link', { name: 'Xem bản đồ' })).toHaveCount(0);
    const b = await hoi(page);
    const lk = b.getByRole('link', { name: 'Xem bản đồ' });
    await expect(lk).toHaveAttribute('target', '_blank');
    expect(await lk.getAttribute('rel')).toContain('noopener');
    const c = await hoi(page);
    await expect(c.locator('b')).toHaveCount(0);
    expect(await khongTranNgang(page)).toBe(true);
  });

  test('F06-TT-06/08/22 · giờ gộp "Thứ Hai – Thứ Sáu" + "Thứ Bảy" (sáng), không Chủ nhật; thứ Bảy 09:00: dữ liệu T2–T6 -> "Ngoài giờ", có thứ Bảy sáng -> "Đang trong giờ"; ghi chú ngày nghỉ', async ({ page }) => {
    // 2026-10-17 là thứ Bảy; 02:00Z = 09:00 giờ Việt Nam
    await page.clock.install({ time: new Date('2026-10-17T02:00:00Z') });
    await traHoi(
      page,
      trungTam('gio-lam-viec', { gioLamViec: GIO_T2_T6 }),
      trungTam('gio-lam-viec', { gioLamViec: [...GIO_T2_T6, GIO(6, ['07:00', '11:30'])], ghiChuNgayNghi: 'Trừ ngày nghỉ, lễ, Tết theo quy định' }),
    );
    await moKhung(page);
    const a = await hoi(page);
    await expect(a).toContainText('Thứ Hai – Thứ Sáu');
    await expect(a).toContainText('Ngoài giờ làm việc');
    const b = await hoi(page);
    await expect(b).toContainText('Thứ Hai – Thứ Sáu');
    await expect(b).toContainText('Thứ Bảy');
    await expect(b).not.toContainText('Chủ nhật');
    await expect(b).toContainText('Đang trong giờ làm việc');
    await expect(b).toContainText('Trừ ngày nghỉ, lễ, Tết theo quy định');
  });

  for (const tz of ['America/Los_Angeles', 'Pacific/Auckland', 'Asia/Tokyo']) {
    test(`F06-TT-07 · múi giờ máy khách ${tz}: 10:00 thứ Hai giờ Việt Nam vẫn "Đang trong giờ làm việc"`, async ({ browser }) => {
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: GOC, viewport: { width: 1280, height: 800 }, timezoneId: tz });
      const page = await ctx.newPage();
      await page.clock.install({ time: new Date('2026-10-12T03:00:00Z') });
      await traHoi(page, trungTam('gio-lam-viec', { gioLamViec: GIO_T2_T6 }));
      await moKhung(page);
      await expect(await hoi(page)).toContainText('Đang trong giờ làm việc');
      await ctx.close();
    });
  }
});

test.describe('F06 · nút gọi, Zalo, liên kết nguy hiểm (LH, BM)', () => {
  test('F06-LH-03/04/08 · không có Zalo OA: chỉ "Gọi Trung tâm" tel:; có Zalo: thêm "Mở Zalo" tab mới noopener noreferrer; lienHe null: không nút nào, không lỗi', async ({ page }) => {
    await traHoi(page, khongHieu(), khongHieu({ dienThoai: '0272 389 3900', zaloOa: 'https://zalo.me/thu-nghiem' }), khongHieu(null));
    await moKhung(page);
    const a = await hoi(page);
    await expect(a.getByRole('link', { name: 'Gọi Trung tâm' })).toHaveAttribute('href', 'tel:02723893900');
    await expect(a.getByRole('link', { name: 'Mở Zalo' })).toHaveCount(0);
    const b = await hoi(page);
    const z = b.getByRole('link', { name: 'Mở Zalo' });
    await expect(z).toHaveAttribute('href', 'https://zalo.me/thu-nghiem');
    await expect(z).toHaveAttribute('target', '_blank');
    expect(await z.getAttribute('rel')).toMatch(/noopener/);
    expect(await z.getAttribute('rel')).toMatch(/noreferrer/);
    const c = await hoi(page);
    await expect(c).toContainText('Xin lỗi, tôi chưa có câu trả lời');
    await expect(c.getByRole('link')).toHaveCount(0);
  });

  test('F06-LH-07 / BM-20 · liên kết javascript:, data:, vbscript: từ dữ liệu không hiện thành liên kết bấm được; 0 hộp thoại', async ({ page }) => {
    const hop = theoDoiHopThoai(page);
    await traHoi(
      page,
      khongHieu({ dienThoai: '0272 389 3900', zaloOa: 'javascript:alert(1)' }),
      trungTam('dia-chi', { diaChi: 'Địa chỉ', banDo: 'data:text/html,<script>alert(1)</script>' }),
      trungTam('nop-truc-tuyen', { lienKet: { ten: 'Cổng thử', url: 'vbscript:msgbox(1)' } }),
    );
    await moKhung(page);
    for (let i = 0; i < 3; i++) {
      const t = await hoi(page);
      for (const a of await t.locator('a').all()) {
        const href = (await a.getAttribute('href')) ?? '';
        expect(href).not.toMatch(/^(javascript|data|vbscript):/i);
        if (await a.isVisible()) await a.click({ trial: true }).catch(() => undefined);
      }
    }
    expect(hop).toEqual([]);
  });

  test('F06-BM-09/10 · mẫu {{…}} ${…} {0} trong tên thủ tục và địa chỉ hiện nguyên văn, không nội suy lại', async ({ page }) => {
    await traHoi(
      page,
      { ...chung, loai: 'thu-tuc-danh-sach', danhSachThuTuc: [NGAN('1.000001', '{{ma}} ${7*7} {0} {{ten}} <b>x</b>')] },
      trungTam('dia-chi', { diaChi: '{{7*7}} ${7*7} số {0}' }),
    );
    await moKhung(page);
    const a = await hoi(page);
    await expect(a.getByRole('button', { name: /Xem chi tiết/ })).toHaveAttribute('aria-label', 'Xem chi tiết {{ma}} ${7*7} {0} {{ten}} <b>x</b>');
    await expect(a).toContainText('{{ma}} ${7*7} {0} {{ten}} <b>x</b>');
    const b = await hoi(page);
    await expect(b).toContainText('{{7*7}} ${7*7} số {0}');
    await expect(b).not.toContainText('49');
  });
});

test.describe('F06 · chủ đề gợi ý (CD) và câu hỏi mẫu (MA)', () => {
  test('F06-CD-05/06/08 · 15 thủ tục: hiện 10 + "Hiển thị 10/15 thủ tục"; 0 thủ tục: "Chưa có thủ tục nào…"; có quầy: nêu quầy', async ({ page }) => {
    const muoi = Array.from({ length: 10 }, (_, i) => NGAN(`9.${String(i + 1).padStart(3, '0')}`, `Thủ tục thử ${i + 1}`));
    await page.route('**/api/tro-ly/chu-de', (r) => (r.request().method() === 'POST' ? r.fulfill({ json: chuDe({ tong: 15, danhSachThuTuc: muoi, quay: 3 }) }) : r.continue()));
    await moKhung(page);
    await khung(page).getByRole('group', { name: 'Chủ đề gợi ý' }).getByRole('button').first().click();
    const a = tinTroLy(page).first();
    await expect(a).toContainText('Lĩnh vực Hộ tịch có 15 thủ tục:');
    await expect(a.getByRole('button', { name: /Xem chi tiết/ })).toHaveCount(10);
    await expect(a).toContainText('Hiển thị 10/15 thủ tục');
    await expect(a).toContainText('Hồ sơ lĩnh vực Hộ tịch nộp tại quầy 3.');
    await page.unroute('**/api/tro-ly/chu-de');
    await page.route('**/api/tro-ly/chu-de', (r) => (r.request().method() === 'POST' ? r.fulfill({ json: chuDe({ tong: 0 }) }) : r.continue()));
    await khung(page).getByRole('group', { name: 'Chủ đề gợi ý' }).getByRole('button').first().click();
    await expect(tinTroLy(page).nth(1)).toContainText('Chưa có thủ tục nào thuộc lĩnh vực này.');
    await expect(tinTroLy(page).nth(1)).not.toContainText(/quầy|Trung tâm/);
  });

  test('F06-CD-10/12 · không có chủ đề: không hàng chip; POST chu-de 404: "Không tìm thấy nội dung bạn cần." trang không lỗi', async ({ page }) => {
    await page.route('**/api/tro-ly/chu-de', (r) =>
      r.request().method() === 'GET'
        ? r.fulfill({ json: [] })
        : r.fulfill({ status: 404, contentType: 'application/problem+json', json: { type: 'x', title: 'x', status: 404, code: 'khong-tim-thay' } }),
    );
    const loi = theoDoiLoi(page, true);
    await moKhung(page);
    await expect(khung(page).getByRole('group', { name: 'Chủ đề gợi ý' })).toHaveCount(0);
    expect(loi).toEqual([]);
    await page.unroute('**/api/tro-ly/chu-de');
    await page.route('**/api/tro-ly/chu-de', (r) =>
      r.request().method() === 'GET' ? r.fulfill({ json: [{ thuTu: 99, tenHienThi: 'Chủ đề đã mất' }] }) : r.fulfill({ status: 404, contentType: 'application/problem+json', json: { type: 'x', title: 'x', status: 404, code: 'khong-tim-thay' } }),
    );
    await page.reload();
    await nut(page).click();
    await khung(page).getByRole('button', { name: 'Chủ đề đã mất' }).click();
    await expect(hoiThoai(page).getByText('Không tìm thấy nội dung bạn cần.')).toBeVisible();
    await expect(khung(page)).toBeVisible();
  });

  test('F06-MA-01/07/08 · câu hỏi mẫu: giữ xuống dòng, chữ thuần (không HTML), 5.000 ký tự ngắt dòng ở 320', async ({ page }) => {
    const dai = 'Từ dài '.repeat(700).slice(0, 5000);
    await traHoi(
      page,
      { ...chung, loai: 'cau-hoi-mau', traLoi: 'Câu trả lời mẫu thử về điều kiện tách thửa.\nDòng hai.', danhSachThuTuc: [] },
      { ...chung, loai: 'cau-hoi-mau', traLoi: '<b>x</b> & "y"\n<script>alert(1)</script>', danhSachThuTuc: [] },
      { ...chung, loai: 'cau-hoi-mau', traLoi: dai, danhSachThuTuc: [] },
    );
    const hop = theoDoiHopThoai(page);
    await page.setViewportSize({ width: 320, height: 568 });
    await moKhung(page);
    const a = await hoi(page);
    await expect(a).toContainText('Câu trả lời mẫu thử về điều kiện tách thửa.');
    await expect(a).toContainText('Dòng hai.');
    expect(await a.locator('p').first().evaluate((e) => getComputedStyle(e).whiteSpace)).toBe('pre-line');
    const b = await hoi(page);
    await expect(b).toContainText('<b>x</b> & "y"');
    await expect(b.locator('b, script')).toHaveCount(0);
    await hoi(page);
    expect(await khongTranNgang(page)).toBe(true);
    expect(hop).toEqual([]);
  });
});

test.describe('F06 · ngữ cảnh, chip hỏi tiếp, trạng thái khung (TH, UI, PU, TN)', () => {
  test('F06-TH-20 · ngữ cảnh giữ qua câu về Trung tâm: "phí" vẫn của 1.001193 (body yêu cầu thứ ba có maThuTuc)', async ({ page }) => {
    const bodies: { cauHoi: string; maThuTuc: string | null }[] = [];
    await page.route('**/api/tro-ly/hoi', async (r) => {
      bodies.push(JSON.parse(r.request().postData() ?? '{}'));
      const n = bodies.length;
      await r.fulfill({ json: n === 1 ? { ...chung, loai: 'thu-tuc-danh-sach', thuTucDangNoi: '1.001193', danhSachThuTuc: [KHAI_SINH] } : n === 2 ? { ...trungTam('gio-lam-viec', { gioLamViec: GIO_T2_T6 }), thuTucDangNoi: '1.001193' } : { ...thuTuc('phi', { phi: '30.000 đồng' }), thuTucDangNoi: '1.001193' } });
    });
    await moKhung(page);
    await hoi(page, 'khai sinh');
    await hoi(page, 'giờ làm việc');
    const c = await hoi(page, 'phí');
    expect(bodies.map((b) => b.maThuTuc)).toEqual([null, '1.001193', '1.001193']);
    await expect(c).toContainText('Phí, lệ phí: 30.000 đồng');
  });

  test('F06-UI-10 · bốn chip hỏi tiếp chỉ dưới đáp án cuối; bấm "Mấy ngày?" gửi như câu hỏi kèm thủ tục đang nói tới', async ({ page }) => {
    const bodies: { cauHoi: string; maThuTuc: string | null }[] = [];
    await page.route('**/api/tro-ly/hoi', async (r) => {
      bodies.push(JSON.parse(r.request().postData() ?? '{}'));
      await r.fulfill({ json: { ...chung, loai: 'thu-tuc-danh-sach', thuTucDangNoi: '1.001193', danhSachThuTuc: [KHAI_SINH] } });
    });
    await moKhung(page);
    await hoi(page, 'khai sinh');
    await hoi(page, 'khai sinh lần hai');
    await expect(khung(page).getByRole('button', { name: 'Mấy ngày?' })).toHaveCount(1);
    await khung(page).getByRole('button', { name: 'Mấy ngày?' }).click();
    await expect(tinTroLy(page)).toHaveCount(3);
    expect(bodies.at(-1)).toEqual({ cauHoi: 'Mấy ngày?', maThuTuc: '1.001193' });
    await expect(khung(page).getByRole('button', { name: 'Mấy ngày?' })).toHaveCount(1); // chỉ dưới đáp án cuối
  });

  test('F06-UI-11 · chip chủ đề: chip lẻ không aria-pressed, nhóm có nhãn "Chủ đề gợi ý", thứ tự theo API', async ({ page }) => {
    await moKhung(page);
    const nhom = khung(page).getByRole('group', { name: 'Chủ đề gợi ý' });
    const chip = nhom.getByRole('button');
    for (const c of await chip.all()) expect(await c.getAttribute('aria-pressed')).toBeNull();
    const api = (await (await page.request.get('/api/tro-ly/chu-de')).json()) as { thuTu: number; tenHienThi: string }[];
    expect(await chip.allInnerTexts()).toEqual(api.sort((a, b) => a.thuTu - b.thuTu).map((x) => x.tenHienThi));
  });

  test('F06-UI-04 / TN-13 · tin chờ "Đang tìm câu trả lời…" (aria-busy, không hoạt ảnh) rồi đáp án; con trỏ ở ô nhập, không bị đáp án cướp', async ({ page }) => {
    await page.route('**/api/tro-ly/hoi', async (r) => {
      await new Promise((x) => setTimeout(x, 800));
      await r.fulfill({ json: khongHieu() });
    });
    await moKhung(page);
    await oNhap(page).fill('x');
    await oNhap(page).press('Enter');
    const cho = hoiThoai(page).locator('[aria-busy="true"]');
    await expect(cho).toContainText('Đang tìm câu trả lời…');
    expect(await cho.evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
    await expect(tinTroLy(page)).toHaveCount(1, { timeout: 5000 });
    await expect(oNhap(page)).toBeFocused();
  });

  test('F06-UI-09 · hơn 60 tin: giữ tối đa 60 trong bộ nhớ, trang không lỗi', async ({ page }) => {
    await traHoi(page, khongHieu());
    const loi = theoDoiLoi(page);
    await moKhung(page);
    for (let i = 0; i < 34; i++) {
      await oNhap(page).fill(`câu ${i}`);
      await oNhap(page).press('Enter');
      await expect(page.getByText('Đang tìm câu trả lời…')).toHaveCount(0, { timeout: 15000 });
    }
    // 34 câu hỏi + 34 đáp án = 68 tin; bộ nhớ giữ tối đa 60 (bỏ tin cũ nhất)
    expect(await hoiThoai(page).locator('[data-tin]').count()).toBe(60);
    await expect(hoiThoai(page)).toContainText('câu 33');
    expect(loi).toEqual([]);
  });

  test('F06-UI-19 · giảm chuyển động: khung không có hiệu ứng (animation/transition = none hoặc ≤ 0,01 s)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await moKhung(page);
    const dong = await khung(page).evaluate((e) => {
      const s = getComputedStyle(e);
      return { an: s.animationName, dur: s.animationDuration, tr: s.transitionDuration };
    });
    expect(dong.an === 'none' || parseFloat(dong.dur) <= 0.01).toBe(true);
    expect(parseFloat(dong.tr) <= 0.01).toBe(true);
  });

  test('F06-UI-20 · chunk khung nạp lỗi: nút còn, lần bấm sau mở được, không trang trắng', async ({ page }) => {
    let chan = true;
    await page.route(/KhungTroLy-[^/]+\.js/, (r) => (chan ? r.abort() : r.continue()));
    await page.goto('/');
    await nut(page).click();
    await page.waitForTimeout(800);
    await expect(khung(page)).toHaveCount(0);
    await expect(nut(page)).toBeVisible();
    chan = false;
    await nut(page).click();
    await expect(khung(page)).toBeVisible();
    await expect(oNhap(page)).toBeFocused();
  });

  test('F06-UI-24 · khung đóng bị ẩn (hidden): không nhận Tab; đóng rồi mở lại giữ hội thoại', async ({ page }) => {
    await traHoi(page, khongHieu());
    await moKhung(page);
    await hoi(page);
    await khung(page).getByRole('button', { name: 'Đóng trợ lý' }).click();
    await expect(page.locator('#khung-tro-ly')).toBeHidden();
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('#khung-tro-ly'))).toBe(false);
    }
    await nut(page).click();
    await expect(tinTroLy(page)).toHaveCount(1);
  });

  test('F06-PU-05/11/13/14 · "Xem chi tiết": tên đọc chứa chữ nhìn thấy; đóng popup trả con trỏ về nút đã bấm; trang giữ bộ lọc; mã lạ -> "Không tìm thấy thủ tục này" + Đóng, khung còn', async ({ page }) => {
    await page.route('**/api/tro-ly/hoi', (r) => r.fulfill({ json: { ...chung, loai: 'thu-tuc-danh-sach', thuTucDangNoi: null, danhSachThuTuc: [KHAI_SINH, NGAN('9.999999', 'Thủ tục đã bị xoá')] } }));
    await page.goto('/thu-tuc?cap=xa&q=khai+sinh');
    await nut(page).click();
    await expect(oNhap(page)).toBeFocused();
    const tin = await hoi(page, 'khai sinh');
    const b1 = tin.getByRole('button', { name: /Xem chi tiết/ }).first();
    expect(await b1.getAttribute('aria-label')).toContain('Xem chi tiết'); // tên đọc chứa chữ nhìn thấy (WCAG 2.5.3)
    await b1.click();
    const pu = page.locator('[role="dialog"]:not(#khung-tro-ly)');
    await expect(pu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(pu).toHaveCount(0);
    await expect(b1).toBeFocused();
    await expect(page).toHaveURL(/cap=xa&q=khai\+sinh/);
    await expect(page.getByRole('searchbox').first()).toHaveValue('khai sinh');
    await tin.getByRole('button', { name: /Xem chi tiết Thủ tục đã bị xoá/ }).click();
    await expect(pu).toContainText('Không tìm thấy thủ tục này');
    await page.getByRole('button', { name: 'Đóng' }).last().click();
    await expect(khung(page)).toBeVisible();
  });
});

test.describe('F06 · hiệu năng cảm nhận (HN-12) và quét câu bộ thử (QU-18)', () => {
  test('F06-HN-12 · 4G giả lập (1,6 Mbps, trễ 150 ms): từ Enter đến hiện đáp án ≤ 1 giây (đo, API thật nguồn Mẫu)', async ({ page, context }) => {
    await moKhung(page);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    const lan: number[] = [];
    for (const c of ['làm giấy khai sinh cần giấy tờ gì', 'kết hôn', 'mấy giờ làm việc']) {
      await oNhap(page).fill(c);
      const t0 = Date.now();
      await oNhap(page).press('Enter');
      await expect(tinTroLy(page)).toHaveCount(lan.length + 1, { timeout: 10000 });
      lan.push(Date.now() - t0);
    }
    test.info().annotations.push({ type: 'do', description: `Enter -> đáp án (4G giả lập): ${lan.join(', ')} ms` });
    expect(Math.max(...lan)).toBeLessThan(1000);
  });

  test('F06-QU-18 (BR-3) · quét 24 câu của bộ thử trên nguồn Mẫu (chưa phân công): không đáp án nào có "quầy <số>" hay tên cán bộ trên màn hình', async ({ page }) => {
    const cau = ['làm giấy khai sinh cần giấy tờ gì', 'hộ tịch nộp quầy mấy', 'chứng thực nộp quầy mấy', 'ai phụ trách đất đai', 'đăng ký khai sinh nộp ở đâu', 'nộp hồ sơ trực tuyến ở đâu', 'trung tâm ở đâu', 'mấy giờ làm việc', 'số điện thoại trung tâm', 'email trung tâm', 'giá vàng hôm nay', 'khai sjnh', 'kết hôn', 'cưới vợ', 'quầy 4 ai phụ trách', 'cán bộ nào xử lý hộ tịch', 'ông Cường ở quầy nào', 'chị Nhung', 'dieu kien tach thua', 'tách thửa cần giấy tờ gì', '1.001193 mấy ngày', 'xem bói', 'nộp ở quầy mấy', 'ai phụ trách'];
    await moKhung(page);
    for (const c of cau) await hoi(page, c);
    const txt = (await tinTroLy(page).allInnerTexts()).join('\n'); // chỉ lời trợ lý (câu người dân tự gõ "quầy 4" không tính)
    expect(txt).not.toMatch(/quầy\s*\d/i);
    expect(txt).not.toMatch(/Cán bộ phụ trách:/);
  });
});

test.describe('F06 · giãn chữ', () => {
  test('F06-TN-10 · giãn chữ WCAG 1.4.12 ở 375: không tràn ngang, nút Gửi và ô nhập vẫn thấy', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await traHoi(page, thuTuc('ho-so', { thanhPhanHoSo: [{ ten: 'Tờ khai đăng ký khai sinh', banChinh: 1, banSao: null }] }));
    await moKhung(page);
    await hoi(page);
    await ganCssThu(page, CSS_GIAN_CHU);
    expect(await khongTranNgang(page)).toBe(true);
    await expect(khung(page).getByRole('button', { name: 'Gửi', exact: true })).toBeVisible();
    await expect(oNhap(page)).toBeVisible();
  });
});
