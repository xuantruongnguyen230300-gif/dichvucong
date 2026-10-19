import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Connect, Plugin } from 'vite';
// `rolldown` đi kèm Vite 8; dùng riêng bộ minify của nó cho script này.
import { minifySync } from 'rolldown/utils';

/**
 * Đường dẫn API thông tin Trung tâm (F08) và tên trường số điện thoại trong JSON trả về.
 * Hợp đồng do F08 plan §3.1 giữ: đường dẫn `/api/trung-tam` và trường `dienThoai` ở gốc JSON; F08 không đổi hai hằng này.
 */
export const API_THONG_TIN_TRUNG_TAM = '/api/trung-tam';
export const TRUONG_DIEN_THOAI = 'dienThoai';

const DUONG_DEV = '/assets/trinh-duyet-cu.js';

/**
 * Script kiểm tra trình duyệt cũ (F00 plan §5): chỉ MINIFY, KHÔNG obfuscate — ngoại lệ có chủ đích
 * của mục Bảo mật trong CLAUDE.md (plan §8 câu 2, người dùng không phản đối). Lý do: phải chạy được
 * trên IE11 (ES5), obfuscator dễ sinh mã ngoài ES5; không chứa logic nghiệp vụ; dưới 1 KB.
 * Phát ra `/assets/trinh-duyet-cu-<hash>.js` (cache immutable như asset khác) và chèn
 * thẻ `<script defer src>` đầu `<head>`, đứng trước script module: hai loại cùng hoãn tới khi đọc xong HTML và chạy theo thứ tự
 * trong tài liệu, nên phép kiểm vẫn chạy trước ứng dụng nhưng không chặn lần vẽ đầu (Lighthouse tính ~300 ms khi đồng bộ).
 * `defer` có từ IE10. Không script inline (CSP `script-src 'self'`).
 */
export function trinhDuyetCu(): Plugin {
  const nguon = readFileSync(new URL('./trinh-duyet-cu.es5.js', import.meta.url), 'utf8')
    .replace('__API__', API_THONG_TIN_TRUNG_TAM)
    .replace('__TRUONG__', TRUONG_DIEN_THOAI);
  const result = minifySync('trinh-duyet-cu.js', nguon, {
    compress: { target: 'es2015' },
    mangle: true,
    codegen: { removeWhitespace: true },
  });
  if (result.errors.length > 0) throw new Error(`Minify trinh-duyet-cu: ${result.errors[0]?.message ?? ''}`);
  // Bộ minify đổi nháy thành dấu backtick (ES2015, IE11 không hiểu). Đổi lại thành nháy kép; nguồn
  // không có `"`, `\` hay `${` trong chuỗi nên phép đổi an toàn — có thì dừng build.
  if (/\$\{|"/.test(result.code)) throw new Error('trinh-duyet-cu: mã minify có `${` hoặc `"`, không đổi nháy an toàn được');
  const code = result.code.replace(/`/g, '"');
  if (/=>|\b(let|const)\b/.test(code)) throw new Error('trinh-duyet-cu: mã sau minify không còn là ES5');
  const tenFile = `assets/trinh-duyet-cu-${createHash('sha256').update(code).digest('base64url').slice(0, 8)}.js`;
  let build = false;

  return {
    name: 'dichvucong:trinh-duyet-cu',
    configResolved(config) {
      build = config.command === 'build';
    },
    buildStart() {
      if (build) this.emitFile({ type: 'asset', fileName: tenFile, source: code });
    },
    configureServer(server) {
      const phucVu: Connect.NextHandleFunction = (req, res, next) => {
        if (req.url !== DUONG_DEV) return next();
        res.setHeader('Content-Type', 'text/javascript');
        res.end(code);
      };
      server.middlewares.use(phucVu);
    },
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        { tag: 'script', attrs: { src: build ? `/${tenFile}` : DUONG_DEV, defer: true }, injectTo: 'head-prepend' as const },
      ],
    },
  };
}
