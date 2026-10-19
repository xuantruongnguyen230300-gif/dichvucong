/**
 * Biểu thức chọn thư viện cho các nhóm chunk riêng (`build.rolldownOptions.output.codeSplitting.groups` ở vite.config.ts).
 * Tách ra đây để có test (`nhom-chunk.test.ts`): nhóm sai thì thư viện lẫn vào chunk của dự án và bị obfuscate theo.
 */

/**
 * TanStack Table (kèm store của nó): chunk riêng, chỉ nạp khi hiện dạng bảng; không vào `vendor`.
 * Tách khỏi chunk BangDuLieu để obfuscate chỉ chạy trên mã của dự án (CLAUDE.md, mục Bảo mật).
 */
export const lopBangGrid = /[/\\]node_modules[/\\]@tanstack[/\\](react-table|table-core|react-store|store)[/\\]/;

/**
 * Chỉ phần lõi luôn cần lúc khởi động (react, router, query, i18n, kèm phụ thuộc trực tiếp) vào `vendor`.
 * Thư viện khác đi theo chunk nạp lười của nơi import động tới nó.
 */
export const lopLoiVendor =
  /[/\\]node_modules[/\\](react|react-dom|scheduler|react-router|cookie|set-cookie-parser|i18next|react-i18next|html-parse-stringify|void-elements|use-sync-external-store|@tanstack[/\\]react-query|@tanstack[/\\]query-core)[/\\]/;

/**
 * `uqr` (mã QR, F05): chunk `qr` riêng, chỉ nạp khi vẽ mã QR. KHÔNG vào `vendor` (luôn tải) và không lẫn với mã `src/`:
 * plugin obfuscate chạy theo chunk, chunk nào có mã `src/` bị obfuscate toàn bộ, kể cả thư viện lẫn vào (phình, có thể hỏng).
 */
export const lopQr = /[/\\]node_modules[/\\]uqr[/\\]/;
