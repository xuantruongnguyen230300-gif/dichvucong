/**
 * Giả lập `matchMedia` cho jsdom: hiểu `min-width` / `max-width` theo `khoMan.rong` (px).
 * Các điều kiện khác (hover, pointer, prefers-*) luôn là không khớp.
 */
type Nghe = (e: MediaQueryListEvent) => void;

const trangThai = { rong: 1280 };
const dangNghe = new Set<{ query: string; nghe: Nghe; truoc: boolean }>();

function khop(query: string): boolean {
  const dieuKien = query.match(/\(([^)]+)\)/g);
  if (!dieuKien) return false;
  return dieuKien.every((d) => {
    const m = /^\(\s*(min|max)-width:\s*([\d.]+)px\s*\)$/.exec(d);
    if (!m) return false;
    const gioiHan = Number(m[2]);
    return m[1] === 'min' ? trangThai.rong >= gioiHan : trangThai.rong <= gioiHan;
  });
}

/** Đặt bề rộng cửa sổ giả và báo cho mọi bên đang nghe. */
export function datKhoMan(rong: number): void {
  trangThai.rong = rong;
  for (const n of dangNghe) {
    const nay = khop(n.query);
    if (nay !== n.truoc) {
      n.truoc = nay;
      n.nghe({ matches: nay, media: n.query } as MediaQueryListEvent);
    }
  }
}

export function layKhoMan(): number {
  return trangThai.rong;
}

export function caiMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => {
      const muc = new Map<Nghe, { query: string; nghe: Nghe; truoc: boolean }>();
      return {
        get matches() {
          return khop(query);
        },
        media: query,
        onchange: null,
        addEventListener: (_loai: string, nghe: Nghe) => {
          const m = { query, nghe, truoc: khop(query) };
          muc.set(nghe, m);
          dangNghe.add(m);
        },
        removeEventListener: (_loai: string, nghe: Nghe) => {
          const m = muc.get(nghe);
          if (m) dangNghe.delete(m);
          muc.delete(nghe);
        },
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      } as unknown as MediaQueryList;
    },
  });
}
