import { chuanHoaTimKiem } from './tiengViet';

/** Độ dài tối đa của từ khoá (ô tìm `maxLength`, địa chỉ, bộ lọc). */
export const TU_KHOA_TOI_DA = 100;
/** Số từ tối đa của từ khoá được dùng để lọc/đưa lên địa chỉ. */
export const SO_TU_TOI_DA = 12;

/**
 * Cắt từ khoá về giới hạn: tối đa `TU_KHOA_TOI_DA` ký tự và `SO_TU_TOI_DA` từ. Giữ nguyên khoảng trắng người dùng
 * đang gõ (không `trim`), chỉ bỏ phần thừa. Dùng khi đọc từ địa chỉ và khi ghi lên địa chỉ.
 */
export function gioiHanTuKhoa(tuKhoa: string): string {
  let cat = tuKhoa.length > TU_KHOA_TOI_DA ? tuKhoa.slice(0, TU_KHOA_TOI_DA) : tuKhoa;
  const cuoi = cat.charCodeAt(cat.length - 1);
  if (cat.length < tuKhoa.length && cuoi >= 0xd800 && cuoi <= 0xdbff) cat = cat.slice(0, -1); // không cắt đôi cặp thay thế
  let dem = 0;
  for (const m of cat.matchAll(/\S+/g)) {
    if (++dem > SO_TU_TOI_DA) return cat.slice(0, m.index).trimEnd();
  }
  return cat;
}

/** Ghép các trường thành một chuỗi tìm kiếm đã chuẩn hoá. Gọi một lần khi nạp dữ liệu. */
export function ghepChuoiTimKiem(...truong: (string | null | undefined)[]): string {
  return chuanHoaTimKiem(truong.filter((t): t is string => !!t).join(' '));
}

/**
 * Bộ lọc theo từ khoá: chuẩn hoá một lần, tách theo dấu cách; mỗi từ phải là chuỗi con
 * của chuỗi tìm kiếm, thứ tự bất kỳ. Từ khoá rỗng → luôn khớp.
 */
export function taoBoLocTuKhoa(tuKhoa: string): (chuoiTimKiem: string) => boolean {
  const chuan = chuanHoaTimKiem(gioiHanTuKhoa(tuKhoa));
  if (chuan === '') return () => true;
  const tu = chuan.split(' ');
  return (chuoiTimKiem) => tu.every((t) => chuoiTimKiem.includes(t));
}
