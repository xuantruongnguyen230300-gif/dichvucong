import { expect, test } from '@playwright/test';

const dong = '#trinh-duyet-cu';

test('trình duyệt đủ mới: không thấy dòng hướng dẫn, trang chạy', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator(dong)).toBeHidden();
});

test('trình duyệt thiếu tính năng: thấy dòng hướng dẫn, không còn #root, không lỗi', async ({ page }) => {
  const loi: string[] = [];
  page.on('pageerror', (e) => loi.push(e.message));
  await page.route('**/api/trung-tam', (route) => route.fulfill({ status: 500, body: '' }));
  await page.addInitScript(() => {
    CSS.supports = () => false;
  });
  await page.goto('/');

  await expect(page.locator(dong)).toBeVisible();
  await expect(page.locator(dong)).toContainText('Trình duyệt');
  await expect(page.locator('#root')).toHaveCount(0);
  await expect(page.locator('#trinh-duyet-cu-sdt')).toBeHidden();
  expect(loi).toEqual([]);
});

test('API Trung tâm trả số điện thoại: dòng hướng dẫn hiện số, bấm gọi được', async ({ page }) => {
  await page.route('**/api/trung-tam', (route) =>
    route.fulfill({ json: { dienThoai: '0272 3 123 456' } }),
  );
  await page.addInitScript(() => {
    CSS.supports = () => false;
  });
  await page.goto('/');

  const so = page.locator('#trinh-duyet-cu-sdt');
  await expect(so).toHaveText('0272 3 123 456');
  await expect(so).toHaveAttribute('href', 'tel:02723123456');
});
