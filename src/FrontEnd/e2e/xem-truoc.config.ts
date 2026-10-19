import { defineConfig, devices } from '@playwright/test';

/**
 * Cấu hình của tester cho C01: trang xem trước `/dev/design-system` chỉ có ở bản dev (Vite), nên chạy trên máy chủ dev.
 * Một trình duyệt, một luồng (máy ít RAM). Khổ màn hình và chế độ kiosk do từng test đặt.
 *
 *   npx playwright test -c e2e/xem-truoc.config.ts
 */
export default defineConfig({
  testDir: '.',
  testMatch: /thanh-phan\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/dev/design-system',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
