/**
 * `IntersectionObserver` giả cho test (jsdom không có). Mặc định test không cài bộ này: code coi môi trường
 * thiếu `IntersectionObserver` là "hiện ngay". Gọi `caiGiaoCat()` khi cần điều khiển lúc phần tử hiện ra, và `go()` khi xong.
 */

export interface BoDieuKhienGiaoCat {
  /** Báo `isIntersecting: true` cho phần tử, tới mọi observer đang quan sát nó. Không làm gì nếu không ai quan sát. */
  hienRa(phanTu: Element): void;
  /** `hienRa` cho mọi phần tử đang được quan sát. */
  hienRaHet(): void;
  /** Báo `isIntersecting: false` cho phần tử, tới mọi observer đang quan sát nó. */
  an(phanTu: Element): void;
  /** Các phần tử đang được quan sát (đã `observe`, chưa `unobserve`/`disconnect`), không trùng. */
  dangQuanSat(): Element[];
  /** Tuỳ chọn của từng lần `new IntersectionObserver(callback, options)`, theo thứ tự tạo (`{}` nếu không truyền). */
  options: IntersectionObserverInit[];
  /** Số lần gọi từ lúc cài. */
  soLan: { observe: number; unobserve: number; disconnect: number };
  /** Trả lại `IntersectionObserver` trước khi cài (hoặc gỡ hẳn nếu trước đó không có). */
  go(): void;
}

class GiaoCatGia implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin: string;
  readonly scrollMargin = '0px';
  readonly thresholds: readonly number[];
  readonly phanTu = new Set<Element>();

  constructor(
    readonly callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
    readonly ghi: { observers: GiaoCatGia[]; options: IntersectionObserverInit[]; soLan: BoDieuKhienGiaoCat['soLan'] },
  ) {
    this.rootMargin = options.rootMargin ?? '0px';
    this.thresholds = [options.threshold ?? 0].flat();
    ghi.observers.push(this);
    ghi.options.push(options);
  }

  observe(phanTu: Element): void {
    this.ghi.soLan.observe++;
    this.phanTu.add(phanTu);
  }
  unobserve(phanTu: Element): void {
    this.ghi.soLan.unobserve++;
    this.phanTu.delete(phanTu);
  }
  disconnect(): void {
    this.ghi.soLan.disconnect++;
    this.phanTu.clear();
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  baoCao(phanTu: Element, giaoCat: boolean): void {
    if (!this.phanTu.has(phanTu)) return;
    const muc = {
      target: phanTu,
      isIntersecting: giaoCat,
      intersectionRatio: giaoCat ? 1 : 0,
      time: 0,
      boundingClientRect: phanTu.getBoundingClientRect(),
      intersectionRect: phanTu.getBoundingClientRect(),
      rootBounds: null,
    } satisfies IntersectionObserverEntry;
    this.callback([muc], this);
  }
}

export function caiGiaoCat(): BoDieuKhienGiaoCat {
  const truoc = Object.getOwnPropertyDescriptor(globalThis, 'IntersectionObserver');
  const ghi = {
    observers: [] as GiaoCatGia[],
    options: [] as IntersectionObserverInit[],
    soLan: { observe: 0, unobserve: 0, disconnect: 0 },
  };

  class GiaoCatDaCai extends GiaoCatGia {
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      super(callback, options, ghi);
    }
  }
  Object.defineProperty(globalThis, 'IntersectionObserver', { value: GiaoCatDaCai, writable: true, configurable: true });

  /** Duyệt bản sao: callback có thể `unobserve` ngay trong lúc báo. */
  const baoTatCa = (phanTu: Element, giaoCat: boolean) => {
    for (const o of [...ghi.observers]) o.baoCao(phanTu, giaoCat);
  };

  return {
    hienRa: (phanTu) => baoTatCa(phanTu, true),
    hienRaHet() {
      for (const phanTu of this.dangQuanSat()) baoTatCa(phanTu, true);
    },
    an: (phanTu) => baoTatCa(phanTu, false),
    dangQuanSat: () => [...new Set(ghi.observers.flatMap((o) => [...o.phanTu]))],
    options: ghi.options,
    soLan: ghi.soLan,
    go() {
      if (truoc) Object.defineProperty(globalThis, 'IntersectionObserver', truoc);
      else Reflect.deleteProperty(globalThis, 'IntersectionObserver');
    },
  };
}
