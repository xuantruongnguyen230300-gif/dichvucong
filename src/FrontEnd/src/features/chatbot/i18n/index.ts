import { dangKyNamespace } from '../../../core/i18n';

let daNap: Promise<void> | null = null;

/**
 * Nạp câu chữ của trợ lý (namespace `chatbot`), cùng lúc với chunk khung chat khi bấm nút "Trợ lý".
 * Nhớ promise: gọi nhiều lần chỉ nạp một lần. Nạp lỗi thì quên đi để lần bấm sau thử lại.
 * Chỉ vỏ nút được nằm trong bundle chính, nên tệp này không import `vi.json` tĩnh.
 */
export function napNgonNguTroLy(): Promise<void> {
  daNap ??= dangKyNamespace('chatbot', { vi: () => import('./vi.json') }).catch((loi: unknown) => {
    daNap = null;
    throw loi;
  });
  return daNap;
}
