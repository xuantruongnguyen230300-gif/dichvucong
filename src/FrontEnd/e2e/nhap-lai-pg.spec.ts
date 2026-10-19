import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { MOC } from './du-lieu/trang-chu';

/**
 * Nhập lại bằng công cụ nhập thật trên PostgreSQL, KHÔNG build lại, KHÔNG khởi động lại API:
 * F03 AC-20/AC-22, F04 AC-7, F02 AC-3/AC-7 (F03 NB-03/04/06, F04 TKE-03/04, F02 DV-07/GD-11).
 *
 * Chạy khi có đủ biến môi trường (tester dựng sẵn, xem result/test.md):
 *   E2E_BASE_URL         địa chỉ API nguồn PostgreSql (vd. http://localhost:5555), DB đã nhập bản đầu 408 thủ tục
 *   E2E_IMPORT_DLL       DichVuCong.Import.dll của bản publish công cụ nhập
 *   E2E_EXCEL_DIR        thư mục 4 file Excel sinh bằng DichVuCong.DuLieuMau
 *   E2E_CONN_STRING      chuỗi kết nối tới DB mà API đang dùng
 * Cần python + openpyxl (du-lieu/sua_excel.py). Không đặt biến thì bỏ qua.
 */

const DLL = process.env.E2E_IMPORT_DLL;
const THU_MUC = process.env.E2E_EXCEL_DIR;
const KET_NOI = process.env.E2E_CONN_STRING;

test.skip(!DLL || !THU_MUC || !KET_NOI, 'Cần E2E_IMPORT_DLL, E2E_EXCEL_DIR, E2E_CONN_STRING (API nguồn PostgreSql).');
test.describe.configure({ mode: 'serial' });

function nhapLai(lenhSua: string) {
  execFileSync('python', ['-X', 'utf8', '-I', 'e2e/du-lieu/sua_excel.py', THU_MUC!, lenhSua], { stdio: 'pipe' });
  execFileSync('dotnet', [DLL!, 'nhap', 'tat-ca', THU_MUC!], {
    stdio: 'pipe',
    env: { ...process.env, ConnectionStrings__DichVuCong: KET_NOI! },
  });
}

const khoi = (p: Page) => p.getByRole('region', { name: 'Thủ tục thường gặp', exact: true });
const soDem = (p: Page) => khoi(p).getByText(/^Hiển thị \d+\/\d+$/);
const thongKe = (p: Page) => p.getByRole('list', { name: 'Thống kê danh mục' });

async function tenDauTien(p: Page): Promise<string[]> {
  await khoi(p).locator('tbody tr').first().waitFor();
  return khoi(p).locator('tbody tr').evaluateAll((r) => r.slice(0, 2).map((x) => x.querySelectorAll('td')[1]?.textContent?.trim() ?? ''));
}

test.use({ viewport: { width: 1280, height: 900 } });

let etagThuTuc = '';

test('PG-0 · bản đầu nhập bằng công cụ nhập: 16/16, 2 trang (12, 4); thống kê 266·408·75; 6 ô; giờ T2–T6 (F03 NB-03, F04 TKE-03)', async ({ page, request }) => {
  const r = await request.get('/api/thu-tuc');
  etagThuTuc = r.headers()['etag']!;
  expect(etagThuTuc).toBeTruthy();
  await page.goto('/');
  await expect(soDem(page)).toHaveText('Hiển thị 16/16');
  expect(await tenDauTien(page)).toEqual(['1.001193', '1.000894']);
  await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
  await expect(khoi(page).locator('tbody tr')).toHaveCount(4);
  await expect(page.getByRole('region', { name: 'Dịch vụ nhanh' }).getByRole('listitem')).toHaveCount(6);
  await page.goto('/thu-tuc');
  await expect(thongKe(page).getByRole('listitem')).toHaveText(['266Thủ tục cấp xã', '408Thủ tục cấp tỉnh', '75Lĩnh vực']);
});

test('PG-0b · dữ liệu nhập thật: gõ "khai sinh" ra đúng "Thủ tục đăng ký khai sinh" (F03 TK-22); giấy tờ ghi 0/0 hoặc trống không có số bản (F03 PO-12)', async ({ page, request }) => {
  await page.goto('/');
  await expect(soDem(page)).toHaveText('Hiển thị 16/16');
  // Kết quả đúng như API (dữ liệu thật có thêm "…bản sao Giấy khai sinh" nên không chỉ một mục): so với tập tính từ /api/thu-tuc.
  const tho = (await (await request.get('/api/thu-tuc')).json()) as { ma: string; tenTimKiem: string; thuTuThuongGap: number | null }[];
  const mong = tho.filter((t) => t.thuTuThuongGap !== null && t.tenTimKiem.includes('khai') && t.tenTimKiem.includes('sinh')).map((t) => t.ma);
  expect(mong).toContain('1.001193');
  await khoi(page).getByRole('searchbox').fill('khai sinh');
  await expect(soDem(page)).toHaveText(`Hiển thị ${mong.length}/16`);
  await expect(khoi(page).locator('tbody tr').first()).toContainText('Thủ tục đăng ký khai sinh');
  const ct = (await (await request.get('/api/thu-tuc/1.001193')).json()) as { thanhPhanHoSo: { ten: string; banChinh: number | null; banSao: number | null }[] };
  expect(ct.thanhPhanHoSo.some((g) => g.banChinh === 0 && g.banSao === 0)).toBe(false);
  expect(ct.thanhPhanHoSo.some((g) => g.banChinh === null && g.banSao === null)).toBe(true);
  expect(ct.thanhPhanHoSo.some((g) => (g.banChinh ?? 0) > 0)).toBe(true);
  await page.goto('/?ma=1.001193');
  const li = page.getByRole('dialog').locator('ol li');
  await expect(li.first()).toBeVisible();
  const chu = await li.allInnerTexts();
  expect(chu.some((t) => /Bản chính: 1 · Bản sao: 0/.test(t))).toBe(true);
  expect(chu.some((t) => !/Bản chính/.test(t))).toBe(true);
  expect(chu.some((t) => /Bản chính: 0 · Bản sao: 0/.test(t))).toBe(false);
});

test('PG-1 · bỏ 1 dòng ở sheet Thường gặp, nhập lại: "Hiển thị 15/15", 2 trang (12, 3), mất chip Bảo trợ xã hội; ETag đổi; If-None-Match cũ → 200 (AC-20)', async ({ page, request }) => {
  nhapLai('bo-dong-thuong-gap');
  const r = await request.get('/api/thu-tuc', { headers: { 'If-None-Match': etagThuTuc } });
  expect(r.status()).toBe(200);
  expect(r.headers()['etag']).not.toBe(etagThuTuc);
  etagThuTuc = r.headers()['etag']!;
  await page.goto('/');
  await expect(soDem(page)).toHaveText('Hiển thị 15/15');
  await expect(khoi(page).getByRole('button', { name: 'Bảo trợ xã hội' })).toHaveCount(0);
  await expect(khoi(page).locator('tbody tr')).toHaveCount(12);
  await khoi(page).getByRole('button', { name: 'Trang 2', exact: true }).click();
  await expect(khoi(page).locator('tbody tr')).toHaveCount(3);
});

test('PG-2 · đổi thứ tự trong file, nhập lại: khối đổi theo, không build lại (AC-22)', async ({ page }) => {
  nhapLai('doi-thu-tu');
  await page.goto('/');
  await expect(soDem(page)).toBeVisible();
  expect(await tenDauTien(page)).toEqual(['1.000894', '1.001193']);
  await khoi(page).getByRole('button', { name: 'Dạng thẻ' }).click();
  await expect(khoi(page).locator('article h3').first()).toHaveText('Thủ tục đăng ký kết hôn');
});

test('PG-3 · thêm 1 thủ tục cấp xã, nhập lại: ô cấp xã 267, hai ô còn lại giữ nguyên; chi tiết có ngay; ETag đổi (F04 AC-7)', async ({ page, request }) => {
  const truoc = await request.get('/api/thu-tuc');
  nhapLai('them-thu-tuc-xa');
  const sau = await request.get('/api/thu-tuc', { headers: { 'If-None-Match': truoc.headers()['etag']! } });
  expect(sau.status()).toBe(200);
  expect(sau.headers()['etag']).not.toBe(truoc.headers()['etag']);
  expect(((await sau.json()) as unknown[]).length).toBe(409);
  expect((await request.get('/api/thu-tuc/T10.001')).status()).toBe(200);
  await page.goto('/thu-tuc');
  await expect(thongKe(page).getByRole('listitem')).toHaveText(['267Thủ tục cấp xã', '408Thủ tục cấp tỉnh', '75Lĩnh vực']);
});

test('PG-4 · nhập thêm ô dịch vụ thứ 7 và giờ Thứ Bảy: trang chủ có 7 ô (ô mới ở cuối), dòng "Thứ Bảy"; 09:00 Thứ Bảy → "Đang" (F02 AC-3, AC-7, GD-11)', async ({ browser }) => {
  nhapLai('them-o');
  nhapLai('them-thu-bay');
  const ctx = await browser.newContext({ timezoneId: 'Asia/Ho_Chi_Minh', viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date(MOC.I3!) }); // Thứ Bảy 09:00
  await p.goto('/');
  const o = p.getByRole('region', { name: 'Dịch vụ nhanh' }).getByRole('listitem');
  await expect(o).toHaveCount(7);
  await expect(o.last()).toContainText('Ô mới T10');
  await expect(p.getByText('Đang trong giờ làm việc')).toBeVisible();
  await expect(p.getByRole('listitem').filter({ hasText: /^Thứ Bảy/ })).toContainText('07:00 – 11:30');
  await ctx.close();
});

test('PG-5 · giờ làm việc có ngày nghỉ chen giữa (xoá giờ Thứ Tư), nhập lại: khối giờ thành hai nhóm (F02 HD-05)', async ({ page }) => {
  nhapLai('bo-gio-thu-tu');
  await page.goto('/');
  const gio = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Thời gian làm việc' }) }).getByRole('listitem');
  await expect(gio.first()).toBeVisible();
  const nhom = (await gio.allInnerTexts()).map((t) => t.split(/\r?\n/)[0]);
  expect(nhom).toEqual(['Thứ Hai – Thứ Ba', 'Thứ Năm – Thứ Sáu', 'Thứ Bảy']); // Thứ Bảy chỉ có buổi sáng (PG-4) nên không gộp với Thứ Sáu
});

function thuMucTam() {
  const tam = mkdtempSync(join(tmpdir(), 'dvc-t10-'));
  cpSync(THU_MUC!, tam, { recursive: true });
  return tam;
}

function nhapMongBiTuChoi(tam: string, lenhSua: string): string {
  execFileSync('python', ['-X', 'utf8', '-I', 'e2e/du-lieu/sua_excel.py', tam, lenhSua], { stdio: 'pipe' });
  try {
    execFileSync('dotnet', [DLL!, 'nhap', 'tat-ca', tam], { stdio: 'pipe', env: { ...process.env, ConnectionStrings__DichVuCong: KET_NOI! } });
  } catch (e) {
    const loi = e as { status?: number; stderr?: Buffer; stdout?: Buffer };
    expect(loi.status).not.toBe(0);
    return `${loi.stderr?.toString('utf8') ?? ''}${loi.stdout?.toString('utf8') ?? ''}`;
  }
  throw new Error('Công cụ nhập đáng lẽ phải từ chối file này');
}

test('PG-6 · giờ "25:00" (buổi hỏng): công cụ nhập từ chối, không ghi gì; trang vẫn như cũ (F02 HD-06)', async ({ page, request }) => {
  const truoc = (await request.get('/api/trung-tam')).headers()['etag'];
  const tam = thuMucTam();
  try {
    const thongBao = nhapMongBiTuChoi(tam, 'gio-hong');
    console.log(`PG-6: ${thongBao.replace(/\s+/g, ' ').slice(0, 200)}`);
    expect(thongBao).toMatch(/25:00|giờ|Giờ làm việc/);
  } finally {
    rmSync(tam, { recursive: true, force: true });
  }
  expect((await request.get('/api/trung-tam')).headers()['etag']).toBe(truoc);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Thời gian làm việc' })).toBeVisible();
});

test('PG-7 · dòng Thường gặp trỏ tới mã không có trong sheet Thủ tục: công cụ nhập từ chối, khối thường gặp không đổi (F03 NB-07)', async ({ page, request }) => {
  const truoc = (await request.get('/api/thu-tuc')).headers()['etag'];
  const tam = thuMucTam();
  try {
    const thongBao = nhapMongBiTuChoi(tam, 'ma-la-thuong-gap');
    console.log(`PG-7: ${thongBao.replace(/\s+/g, ' ').slice(0, 220)}`);
    expect(thongBao).toMatch(/ZZ\.999/);
  } finally {
    rmSync(tam, { recursive: true, force: true });
  }
  expect((await request.get('/api/thu-tuc')).headers()['etag']).toBe(truoc);
  await page.goto('/');
  await expect(soDem(page)).toHaveText('Hiển thị 15/15');
});
