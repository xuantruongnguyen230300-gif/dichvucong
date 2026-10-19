// Đọc biến môi trường cho Vite dev server (do .NET Aspire AppHost đặt; đặt tay cũng được).
// Giá trị sai thì ném lỗi ngay, không rơi về mặc định. Thông báo không chép nội dung biến (có thể chứa bí mật).

export const API_URL_MAC_DINH = 'https://localhost:7157';
export const PORT_MAC_DINH = 5173;

/** `API_URL`: URL http(s) của Api. Không đặt (hoặc rỗng) thì dùng mặc định. */
export function docApiUrl(gia: string | undefined): string {
  if (gia === undefined || gia.trim() === '') return API_URL_MAC_DINH;
  let url: URL;
  try {
    url = new URL(gia.trim());
  } catch {
    throw new Error('Biến môi trường API_URL không phải URL hợp lệ (cần dạng http://host:cổng hoặc https://host:cổng).');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Biến môi trường API_URL chỉ nhận giao thức http hoặc https.');
  }
  return url.origin;
}

/** `PORT`: số nguyên 1–65535. Không đặt (hoặc rỗng) thì dùng 5173. */
export function docPort(gia: string | undefined): number {
  if (gia === undefined || gia.trim() === '') return PORT_MAC_DINH;
  const chuoi = gia.trim();
  const so = Number(chuoi);
  if (!/^\d+$/.test(chuoi) || !Number.isInteger(so) || so < 1 || so > 65535) {
    throw new Error('Biến môi trường PORT phải là số nguyên từ 1 đến 65535.');
  }
  return so;
}
