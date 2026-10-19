import { createContext, useContext } from 'react';

/**
 * Điểm ghép với F07 (đọc câu trả lời; F06 plan §6). F06 chỉ cung cấp dữ liệu, F07 quyết định đọc hay không.
 * - `cauTraLoiMoi`: đáp án mới nhất từ máy chủ (không phải lời chào, không phải tin lỗi). `id` đổi mỗi đáp án mới.
 * - `khungDangMo`: `false` thì F07 dừng đọc; mở lại không tự đọc tiếp.
 */
export interface DiemGhepDoc {
  cauTraLoiMoi: { id: number; vanBan: string } | null;
  khungDangMo: boolean;
}

export const DiemGhepDocContext = createContext<DiemGhepDoc>({ cauTraLoiMoi: null, khungDangMo: false });

export function useDiemGhepDoc(): DiemGhepDoc {
  return useContext(DiemGhepDocContext);
}
