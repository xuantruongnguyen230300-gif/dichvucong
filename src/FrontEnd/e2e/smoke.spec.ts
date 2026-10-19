import { expect, test } from '@playwright/test';

test('mở trang chủ, route nạp lười hiển thị, không tràn ngang', async ({ page }) => {
  const loi: string[] = [];
  page.on('pageerror', (e) => loi.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') loi.push(m.text());
  });

  await page.goto('/');

  // Tiêu đề mặc định của index.html, rồi "<Tên trang> – <Tên trung tâm>" khi dữ liệu Trung tâm về (F08): chấp nhận cả hai, không phụ thuộc thời điểm
  await expect(page).toHaveTitle(/Tra cứu thủ tục hành chính|^Trang chủ/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const tranNgang = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(tranNgang).toBe(false);
  expect(loi).toEqual([]);
});

test('đường dẫn lạ hiện trang không tìm thấy', async ({ page }) => {
  await page.goto('/khong-co-trang-nay');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeVisible();
});
