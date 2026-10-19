import JavaScriptObfuscator from 'javascript-obfuscator';
import { normalizePath, type Plugin } from 'vite';

/**
 * Obfuscate chỉ chunk có chứa mã trong `src/` của dự án, chỉ khi build production.
 * Bỏ qua chunk vendor, runtime và chunk chỉ có file ngôn ngữ `.json`.
 * Chạy ở generateBundle: sau khi minify và sau khi tên file có hash đã được tính.
 * `seed` cố định để cùng mã nguồn, cùng phiên bản và tuỳ chọn cho cùng kết quả.
 * Giới hạn: hash tên file tính trước obfuscate (asset cache `immutable`). Khi đổi version
 * `javascript-obfuscator` hoặc tuỳ chọn mà mã nguồn không đổi, phải đổi `seed` để hash đổi theo.
 *
 * THỨ TỰ HOOK LÀ BẮT BUỘC (lỗi "bản build không có CSS của route"): `vite:build-import-analysis` điền `__VITE_PRELOAD__`
 * (danh sách CSS và JS cần nạp trước cho từng `import()` nạp lười) bằng cách đọc chuỗi nguyên văn trong `import('./Trang-<hash>.js')`.
 * `enforce: 'post'` chỉ xếp plugin này TRƯỚC plugin đó, vì plugin của Vite nằm sau mọi plugin người dùng. Obfuscate trước thì chuỗi
 * thành lời gọi mảng chuỗi, Vite không đọc được, thay marker bằng `[]` và route nạp lười mất CSS (và modulepreload) của nó.
 * Vì vậy dùng `order: 'post'` ở cấp hook: chạy sau mọi hook generateBundle khác, kể cả của Vite.
 * `build/obfuscate.test.ts` và `e2e/ban-build.spec.ts` giữ điều này.
 */
export function obfuscateProject(): Plugin {
  let srcDir = '';
  return {
    name: 'dichvucong:obfuscate',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      srcDir = `${normalizePath(config.root)}/src/`;
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type !== 'chunk') continue;
          const hasProjectCode = file.moduleIds.some((id) => normalizePath(id).startsWith(srcDir) && !id.endsWith('.json'));
          if (!hasProjectCode) continue;

          file.code = JavaScriptObfuscator.obfuscate(file.code, {
            target: 'browser',
            seed: 1,
            sourceMap: false,
            compact: true,
            identifierNamesGenerator: 'hexadecimal',
            renameGlobals: false,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
            // Không đổi mức (vẫn tên hex, string array base64, CFF 0,3): bỏ hàm bọc và dịch chỉ số của string array để chunk nhỏ hơn
            // (chunk docCauTraLoi -6,7% gzip; mỗi chunk của dự án nhỏ đi). Giữ rotate và shuffle của string array.
            stringArrayWrappersCount: 0,
            stringArrayIndexShift: false,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.3,
            deadCodeInjection: false,
            selfDefending: false,
            debugProtection: false,
          }).getObfuscatedCode();
        }
      },
    },
  };
}
