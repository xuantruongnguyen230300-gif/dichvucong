import { useSyncExternalStore } from 'react';
import { MQ_DIEN_THOAI, MQ_MAY_TINH } from '../styles/diemGay';
import { useCheDoKiosk } from '../kiosk/useCheDoKiosk';
import { useMediaQuery } from './useMediaQuery';

export type CachXem = 'the' | 'bang';

const KHOA_LUU = 'cach-xem';

// Một store chung để khối thường gặp và danh mục cùng theo một lựa chọn.
let daChon: CachXem | null = docDaLuu();
const nguoiNghe = new Set<() => void>();

function laCachXem(v: unknown): v is CachXem {
  return v === 'the' || v === 'bang';
}

function docDaLuu(): CachXem | null {
  try {
    const v = window.localStorage.getItem(KHOA_LUU);
    return laCachXem(v) ? v : null;
  } catch {
    return null; // localStorage bị chặn
  }
}

function dangKy(nghe: () => void): () => void {
  nguoiNghe.add(nghe);
  const khiStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== KHOA_LUU) return;
    const moi = docDaLuu();
    if (moi !== daChon) {
      daChon = moi;
      nguoiNghe.forEach((f) => f());
    }
  };
  window.addEventListener('storage', khiStorage);
  return () => {
    nguoiNghe.delete(nghe);
    window.removeEventListener('storage', khiStorage);
  };
}

function datDaChon(v: CachXem): void {
  daChon = v;
  try {
    window.localStorage.setItem(KHOA_LUU, v);
  } catch {
    // giữ trong bộ nhớ
  }
  nguoiNghe.forEach((f) => f());
}

/** Chỉ dùng cho test: đặt lại store về trạng thái ban đầu. */
export function datLaiCachXemChoTest(): void {
  daChon = docDaLuu();
  nguoiNghe.forEach((f) => f());
}

/**
 * Dạng xem danh sách (thẻ / bảng). Dưới 600 px luôn là thẻ; từ 600 px dùng lựa chọn đã lưu,
 * chưa chọn thì thẻ ở kiosk và 600–1023 px, bảng từ 1024 px.
 */
export function useCachXem(): {
  cachXem: CachXem;
  daChon: CachXem | null;
  datCachXem: (v: CachXem) => void;
  laDienThoai: boolean;
} {
  const luaChon = useSyncExternalStore(
    dangKy,
    () => daChon,
    () => null,
  );
  const laDienThoai = useMediaQuery(MQ_DIEN_THOAI);
  const laMayTinh = useMediaQuery(MQ_MAY_TINH);
  const kiosk = useCheDoKiosk();

  let cachXem: CachXem;
  if (laDienThoai) cachXem = 'the';
  else if (luaChon) cachXem = luaChon;
  else cachXem = laMayTinh && !kiosk ? 'bang' : 'the';

  return { cachXem, daChon: luaChon, datCachXem: datDaChon, laDienThoai };
}
