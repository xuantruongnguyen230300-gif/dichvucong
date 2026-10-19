import { defineConfig, devices } from '@playwright/test';

/**
 * Cấu hình của tester: chạy e2e trên BẢN BUILD do API phục vụ (không qua Vite dev), một trình duyệt, một luồng
 * (máy ít RAM). Cách dùng, ở thư mục src/FrontEnd:
 *
 *   npm run build
 *   (dotnet run --project ../BackEnd/DichVuCong.Api --launch-profile https  # nguồn Mẫu, https://localhost:7157)
 *   npx playwright test -c e2e/ban-build.config.ts
 *
 * Địa chỉ khác: đặt E2E_BASE_URL. Khổ màn hình do từng test đặt (375, 768, 1280, kiosk 1080x1920).
 */
export default defineConfig({
  testDir: '.',
  testMatch: /(khung-trang|ban-build|cls-ma-tran|tranh-ghi-dia-chi|trinh-duyet-cu|thu-tuc-thuong-gap|danh-muc|trang-chu|nhap-lai-pg|linh-vuc|tro-ly|doc-cau-tra-loi|kiosk)\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://localhost:7157',
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 800 },
  },
  // Firefox và WebKit chỉ chạy kiểm tra trình duyệt cũ (script defer của bản build); Chromium chạy tất cả.
  projects: [
    { name: 'chromium' },
    { name: 'firefox', testMatch: /trinh-duyet-cu\.spec\.ts/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: /trinh-duyet-cu\.spec\.ts/, use: { ...devices['Desktop Safari'] } },
    // Firefox/WebKit chạy một tập ca chính của F02, F03, F04 (popup, Quay lại, tab, gõ nhanh, ô dịch vụ): ca bám Chromium (CDP, clock) không chạy ở đây.
    {
      name: 'firefox-f02-f04',
      testMatch: /(thu-tuc-thuong-gap|danh-muc|trang-chu)\.spec\.ts/,
      grep: /F03-(TK-01|HT-04|DH-0[1-3]|PO-0[35]|PO-3[13]|DC-0[1-8]|DC-1[0-2]|DC-28|LK-0[1-4])|F04-(TK-0[1-2]|LK-01|XB-01|TAB-04|PT-01|DL-0[1-5]|PO-0[1-5])|F02-(DV-01|DV-0[3-6]|DV-1[1-5]|GD-0[1-3]|BN-01|GL-0[1-6]|RG-0[12])/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-f02-f04',
      testMatch: /(thu-tuc-thuong-gap|danh-muc|trang-chu)\.spec\.ts/,
      grep: /F03-(TK-01|HT-04|DH-0[1-3]|PO-0[35]|PO-3[13]|DC-0[1-8]|DC-1[0-2]|DC-28|LK-0[1-4])|F04-(TK-0[1-2]|LK-01|XB-01|TAB-04|PT-01|DL-0[1-5]|PO-0[1-5])|F02-(DV-01|DV-0[3-6]|DV-1[1-5]|GD-0[1-3]|BN-01|GL-0[1-6]|RG-0[12])/,
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
