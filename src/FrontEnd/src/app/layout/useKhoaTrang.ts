import { useMatches } from 'react-router';
import type { KhoaTrang } from '../../core/duongDan';

/** `handle` của mọi route trong app: khoá trang để lấy tên, mô tả, tiêu đề tab. */
export interface HandleTrang {
  trang: KhoaTrang;
}

/** Tạo `handle` cho route; gõ sai khoá là lỗi build. */
export const handleTrang = (trang: KhoaTrang): HandleTrang => ({ trang });

function laHandleTrang(handle: unknown): handle is HandleTrang {
  return typeof handle === 'object' && handle !== null && 'trang' in handle && typeof handle.trang === 'string';
}

/** Khoá trang của route khớp sâu nhất có `handle.trang`; `null` nếu không có. */
export function useKhoaTrang(): KhoaTrang | null {
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i]?.handle;
    if (laHandleTrang(handle)) return handle.trang;
  }
  return null;
}
