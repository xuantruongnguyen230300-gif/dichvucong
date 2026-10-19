/** Cắt tên dài để dòng đầu không chiếm cả bóng chat; nguyên tên vẫn có ở popup. Cắt theo ký tự, không cắt giữa cặp surrogate. */
export function catChu(chu: string, toiDa: number): string {
  const kyTu = Array.from(chu);
  return kyTu.length > toiDa ? `${kyTu.slice(0, toiDa).join('').trimEnd()}…` : chu;
}

/** Có chữ nhìn thấy (không chỉ khoảng trắng). */
export const coChu = (s: string | null | undefined): s is string => typeof s === 'string' && s.trim() !== '';
