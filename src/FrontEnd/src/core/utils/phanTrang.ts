/**
 * Dãy nút phân trang: trang đầu, trang cuối, trang hiện tại và một trang mỗi bên;
 * chỗ hở thay bằng 'bo-qua' (hiện "…").
 */
export function dayTrang(hienTai: number, tongSo: number): (number | 'bo-qua')[] {
  if (tongSo < 1) return [];
  const giu = new Set<number>([1, tongSo, hienTai - 1, hienTai, hienTai + 1]);
  const trang = [...giu].filter((n) => n >= 1 && n <= tongSo).sort((a, b) => a - b);
  const day: (number | 'bo-qua')[] = [];
  let truoc = 0;
  for (const n of trang) {
    if (n - truoc > 1) day.push('bo-qua');
    day.push(n);
    truoc = n;
  }
  return day;
}

/**
 * Số trang từ địa chỉ: chỉ nhận chuỗi toàn chữ số > 0; sai hoặc bằng 0 → 1; lớn hơn `tongSo` → `tongSo`,
 * dù dài bao nhiêu chữ số (BR-8, AC-14). Giá trị lạ không bao giờ hiện ra trang.
 */
export function chuanHoaSoTrang(tho: string | null, tongSo: number): number {
  if (tho === null || !/^\d+$/.test(tho)) return 1;
  const chuSo = tho.replace(/^0+/, ''); // "03" → "3"; "000" → "" (không phải số dương)
  if (chuSo === '' || tongSo < 1) return 1;
  if (chuSo.length > 9) return tongSo; // vượt xa mọi số trang có thể có; tránh mất chính xác khi đổi sang số
  return Math.min(Number(chuSo), tongSo);
}

/** Các mục của trang `trang` (bắt đầu từ 1). */
export function catTrang<T>(ds: readonly T[], trang: number, moiTrang: number): T[] {
  const dau = moiTrang * (trang - 1);
  return ds.slice(dau, dau + moiTrang);
}
