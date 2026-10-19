import { defineConfig, devices } from '@playwright/test';

/**
 * e2e trên BẢN BUILD PRODUCTION (có obfuscate) phục vụ bằng `vite preview`; mọi API do test giả bằng `page.route`,
 * nên không cần backend. Chạy: `npm run e2e:san-xuat` (tự build vào dist/e2e rồi mở preview ở cổng 4173).
 * Bắt các lỗi chỉ có ở bản build mà dev server và vitest không thấy: thiếu CSS của route, CLS, bản build lộ mã.
 */
export default defineConfig({
  testDir: '.',
  testMatch: /san-xuat\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'npx vite build --outDir dist/e2e --emptyOutDir && npx vite preview --outDir dist/e2e --port 4173 --strictPort',
    cwd: '..',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
