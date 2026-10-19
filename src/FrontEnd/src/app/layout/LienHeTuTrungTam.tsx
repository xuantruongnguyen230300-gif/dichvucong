import type { ReactNode } from 'react';
import { useThongTinTrungTam } from '../../core/api/trungTam';
import { LienHeProvider } from '../../core/components/LienHe';

/**
 * Cấp số điện thoại Trung tâm cho thông báo lỗi, không có kết quả (C01). Đã tải một lần thì mất mạng vẫn còn số
 * (TanStack Query giữ dữ liệu cũ); chưa từng tải được thì ẩn dòng số (F00 BR-14).
 */
export function LienHeTuTrungTam({ children }: { children: ReactNode }) {
  const { data } = useThongTinTrungTam();
  return <LienHeProvider soDienThoai={data?.dienThoai ?? null}>{children}</LienHeProvider>;
}
