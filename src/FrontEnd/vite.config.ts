import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { dacTaTrang } from './build/dac-ta-trang.ts';
import { kiemTraKichThuoc } from './build/kiem-tra-kich-thuoc.ts';
import { kiemTraLogo } from './build/kiem-tra-logo.ts';
import { API_URL_MAC_DINH, PORT_MAC_DINH, docApiUrl, docPort } from './build/moi-truong-dev.ts';
import { lopBangGrid, lopLoiVendor, lopQr } from './build/nhom-chunk.ts';
import { obfuscateProject } from './build/obfuscate.ts';
import { trinhDuyetCu } from './build/trinh-duyet-cu.ts';
import common from './src/core/i18n/vi/common.json' with { type: 'json' };

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Chèn chữ từ common.json vào index.html lúc build/dev: một nguồn, có sẵn cho trình thu thập không chạy JS. */
function chuTuI18n(): Plugin {
  const chu: Record<string, string> = {
    '%TIEU_DE%': common['ung-dung']['tieu-de'],
    '%MO_TA%': common['ung-dung']['mo-ta'],
    '%TRINH_DUYET_CU_HUONG_DAN%': common['trinh-duyet-cu']['huong-dan'],
    '%TRINH_DUYET_CU_GOI%': common['trinh-duyet-cu'].goi,
  };
  return {
    name: 'dichvucong:chu-i18n',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => Object.entries(chu).reduce((kq, [khoa, giaTri]) => kq.replace(khoa, () => escapeHtml(giaTri)), html),
    },
  };
}

// Chunk nạp cùng lúc ở `/` ngoài entry: trang chủ và câu chữ của nó (xem routes.tsx). Dùng cho bước kiểm ngân sách JS tải ban đầu.
const MODULE_CUA_TRANG_CHU = ['src/features/trang-chu/TrangChu', 'src/features/trang-chu/i18n/', 'src/features/thu-tuc/i18n/'];

// Dev server đọc hai biến môi trường (do .NET Aspire AppHost đặt; chạy tay `npm run dev` cũng đặt được):
//   API_URL  địa chỉ Api cho proxy /api và /health (URL http/https); không đặt = https://localhost:7157
//   PORT     cổng Vite dev server (số nguyên 1-65535); không đặt = 5173. Cổng bận thì dừng (strictPort).
// Giá trị sai thì dừng ngay với thông báo rõ. Chỉ đọc khi chạy dev server (không đọc ở Vitest, `npm run build`).
export default defineConfig(({ command }) => {
  const dev = command === 'serve' && !process.env.VITEST;
  const backend = dev ? docApiUrl(process.env.API_URL) : API_URL_MAC_DINH;
  const portDev = dev ? docPort(process.env.PORT) : PORT_MAC_DINH;

  return {
    plugins: [react(), chuTuI18n(), kiemTraLogo(), trinhDuyetCu(), dacTaTrang(common), obfuscateProject(), kiemTraKichThuoc({ moduleCuaTrangChu: MODULE_CUA_TRANG_CHU })],
    server: {
      port: portDev,
      strictPort: true,
      proxy: {
        '/api': { target: backend, secure: false },
        '/health': { target: backend, secure: false },
      },
    },
    build: {
      outDir: '../BackEnd/DichVuCong.Api/wwwroot',
      emptyOutDir: true,
      sourcemap: false,
      // Mức trình duyệt hỗ trợ (BR-14, plan F00 §2/§5). Ghi rõ để nâng Vite không tự đổi mức này.
      target: ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'],
      rolldownOptions: {
        output: {
          minify: { compress: { dropConsole: true, dropDebugger: true } },
          codeSplitting: {
            groups: [
              { name: 'vendor', test: lopLoiVendor },
              { name: 'grid', test: lopBangGrid },
              { name: 'qr', test: lopQr }, // uqr: nạp lười, không obfuscate (xem build/nhom-chunk.ts)
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}', 'build/**/*.test.ts'],
      setupFiles: ['src/test-setup.ts'],
      testTimeout: 15_000, // máy chậm hoặc chạy song song với việc khác
      // Mặc định vitest chạy (số lõi - 1) luồng jsdom; ở 8 lõi, các ca nạp chunk lười/gõ vào danh sách 43 mục lúc thì
      // quá 5 giây của findBy, lúc quá 15 giây (mỗi lần một ca khác nhau). 4 luồng: chậm hơn ~5 giây, 6/6 lần chạy liên tiếp xanh.
      maxWorkers: 4,
      // CSS Module cho tên class thật (test kiểm class); CSS thường bỏ qua
      css: { include: [/\.module\.css$/] },
    },
  };
});
