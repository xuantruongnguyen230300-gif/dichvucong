import type { LinhVuc } from '../../core/api/linhVuc';
import { taoBoLocTuKhoa } from '../../core/utils/timKiem';

/** Lọc lĩnh vực theo tên (BR-3): không dấu, nhiều từ, thứ tự bất kỳ (C01 BR-4). Giữ thứ tự đầu vào. */
export function locLinhVuc(danhSach: readonly LinhVuc[], tuKhoa: string): readonly LinhVuc[] {
  const khop = taoBoLocTuKhoa(tuKhoa);
  return danhSach.filter((l) => khop(l.tenTimKiem));
}
