/**
 * Chuẩn hoá tiếng Việt cho tìm kiếm — cùng thuật toán với BE (`TiengViet.cs`).
 * Hai bên phải cho cùng kết quả với bộ mẫu ở `.specify/specs/F00-khung-he-thong/plan.md` §4.
 */

/** Bỏ dấu: NFD, bỏ dấu kết hợp, `đ/Đ` thành `d/D`, trả về NFC. Giữ nguyên hoa/thường và khoảng trắng. */
export function boDau(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFC');
}

/**
 * Bỏ dấu, chữ thường, bỏ ký tự vô hình, gộp khoảng trắng, cắt hai đầu.
 * Tập ký tự phải khớp với BE: bỏ U+200B–U+200F, U+FEFF; khoảng trắng gồm cả U+0085.
 */
export function chuanHoaTimKiem(text: string): string {
  return boDau(text)
    .toLowerCase()
    .replace(/[\u200B-\u200F\uFEFF]/g, '')
    .replace(/[\s\u0085]+/g, ' ')
    .trim();
}
