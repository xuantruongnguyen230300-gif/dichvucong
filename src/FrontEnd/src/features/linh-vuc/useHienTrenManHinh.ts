import { useCallback, useRef, useState, type RefCallback } from 'react';

/*
 * Một IntersectionObserver dùng chung cho cả trang, tạo ở lần quan sát đầu và bỏ khi không còn ai được quan sát.
 * `rootMargin` 0: chỉ phần tử có ít nhất một phần trong màn hình mới tính là "hiện" (BR-2, AC-5), không đệm trước.
 */
const dangCho = new Map<Element, () => void>();
let boQuanSat: IntersectionObserver | null = null;
let loaiBo: typeof IntersectionObserver | null = null;

function xuLy(cacMuc: IntersectionObserverEntry[]) {
  for (const muc of cacMuc) {
    if (!muc.isIntersecting) continue;
    const khiHien = dangCho.get(muc.target);
    if (!khiHien) continue;
    boQuanSat?.unobserve(muc.target);
    huyDangKy(muc.target);
    khiHien();
  }
}

/** Gỡ phần tử khỏi danh sách chờ; hết phần tử thì ngắt luôn bộ quan sát. */
function huyDangKy(phanTu: Element) {
  dangCho.delete(phanTu);
  if (dangCho.size === 0 && boQuanSat) {
    boQuanSat.disconnect();
    boQuanSat = null;
  }
}

function quanSat(phanTu: Element, khiHien: () => void): () => void {
  if (boQuanSat === null || loaiBo !== IntersectionObserver) {
    dangCho.clear(); // bộ cũ (môi trường thử đã đổi IntersectionObserver) không còn báo nữa
    loaiBo = IntersectionObserver;
    boQuanSat = new IntersectionObserver(xuLy, { rootMargin: '0px', threshold: 0 });
  }
  dangCho.set(phanTu, khiHien);
  boQuanSat.observe(phanTu);
  return () => {
    if (!dangCho.has(phanTu)) return;
    boQuanSat?.unobserve(phanTu);
    huyDangKy(phanTu);
  };
}

/**
 * `[ref, daHien]`: `daHien` chuyển sang `true` khi phần tử gắn `ref` lần đầu có ít nhất một phần trong màn hình,
 * rồi giữ nguyên (cuộn ra khỏi màn hình không đổi lại `false`; phần tử đã hiện thì thôi quan sát).
 * Môi trường không có `IntersectionObserver`: `true` ngay.
 */
export function useHienTrenManHinh<T extends Element>(): [RefCallback<T>, boolean] {
  const [daHien, datDaHien] = useState(() => typeof IntersectionObserver === 'undefined');
  const daThay = useRef(daHien);

  const ref = useCallback<RefCallback<T>>((phanTu) => {
    if (phanTu === null || daThay.current) return;
    return quanSat(phanTu, () => {
      daThay.current = true;
      datDaHien(true);
    });
  }, []);

  return [ref, daHien];
}
