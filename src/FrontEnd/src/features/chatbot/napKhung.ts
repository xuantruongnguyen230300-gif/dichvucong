import { napNgonNguTroLy } from './i18n';
import type { KhungTroLy } from './KhungTroLy';

/** Thành phần khung chat; chỉ kiểu (import type bị xoá khi build), mã khung không nằm trong bundle chính. */
export type ThanhPhanKhung = typeof KhungTroLy;

/**
 * Bọc một hàm nạp: nhớ promise (nhiều lần bấm chỉ nạp một lần), nạp lỗi thì quên để lần bấm sau thử lại.
 */
export function taoBoNap<T>(nguon: () => Promise<T>): () => Promise<T> {
  let dangNap: Promise<T> | null = null;
  return () => {
    dangNap ??= nguon().catch((loi: unknown) => {
      dangNap = null;
      throw loi;
    });
    return dangNap;
  };
}

/**
 * Chỗ DUY NHẤT nạp chunk khung chat và câu chữ `chatbot` của nó, song song. Cả hai chỉ nạp khi người dân bấm nút
 * "Trợ lý" (hoặc nhấn xuống / nhận con trỏ ở nút), nên trang chưa dùng trợ lý thì không tốn byte nào (F06 plan §5.1).
 */
export const napKhungTroLy: () => Promise<ThanhPhanKhung> = taoBoNap(() =>
  Promise.all([import('./KhungTroLy'), napNgonNguTroLy()]).then(([m]) => m.KhungTroLy),
);
