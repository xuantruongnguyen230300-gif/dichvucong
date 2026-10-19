/** Lựa chọn bật/tắt đọc của người dân (BR-5): chỉ cờ, không nội dung. Mặc định tắt. */
const KHOA = 'doc-bat';

/** Giữ trong bộ nhớ trang khi storage bị chặn (chế độ riêng tư): vẫn bật/tắt được trong lần mở này. */
let trongBoNho = false;

export function docCoBat(): boolean {
  try {
    return window.localStorage.getItem(KHOA) === '1';
  } catch {
    return trongBoNho;
  }
}

export function ghiCoBat(bat: boolean): void {
  trongBoNho = bat;
  try {
    window.localStorage.setItem(KHOA, bat ? '1' : '0');
  } catch {
    /* storage bị chặn: chỉ còn trong bộ nhớ */
  }
}
