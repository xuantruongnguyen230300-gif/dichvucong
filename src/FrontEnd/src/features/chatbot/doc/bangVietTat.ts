import { http } from '../../../core/api/http';
import type { VietTatDoc } from './chuanBiVanBan';

export const API_VIET_TAT = '/api/tro-ly/viet-tat';

let dangTai: Promise<readonly VietTatDoc[]> | null = null;

/** Giữ phần tử đúng hình dạng (hai chuỗi); dữ liệu sai bị bỏ, không ném lỗi. */
function loc(du: unknown): VietTatDoc[] {
  if (!Array.isArray(du)) return [];
  const kq: VietTatDoc[] = [];
  for (const dong of du as unknown[]) {
    const { chuVietTat, dayDu } = (dong ?? {}) as Partial<Record<keyof VietTatDoc, unknown>>;
    if (typeof chuVietTat === 'string' && typeof dayDu === 'string') kq.push({ chuVietTat, dayDu });
  }
  return kq;
}

/**
 * Bảng viết tắt cho máy đọc: tải một lần mỗi lần tải trang (promise nhớ ở mức module). Thất bại thì quên promise
 * (câu trả lời sau thử lại) và trả bảng rỗng cho lần này: đọc nguyên văn, không báo người dân.
 */
export function taiBangVietTat(): Promise<readonly VietTatDoc[]> {
  dangTai ??= http<unknown>(API_VIET_TAT).then(loc, () => {
    dangTai = null;
    return [];
  });
  return dangTai;
}
