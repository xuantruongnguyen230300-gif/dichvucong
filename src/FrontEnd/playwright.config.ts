import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'dien-thoai',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'kiosk',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1080, height: 1920 } },
    },
    // Trình duyệt trong danh sách hỗ trợ (BR-14): chỉ chạy kiểm tra trình duyệt cũ.
    { name: 'firefox', testMatch: /trinh-duyet-cu\.spec\.ts/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: /trinh-duyet-cu\.spec\.ts/, use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    // Cổng cố định như url bên dưới, không theo biến PORT của môi trường (vite.config.ts đọc PORT cho Aspire)
    env: { PORT: '5173' },
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
