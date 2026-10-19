import { lazy, Suspense } from 'react';
import { napNgonNguThuTuc } from './i18n';
import { useDemLichSuMoThang, useMoThuTuc } from './useMoThuTuc';

// Popup (Modal + nội dung chi tiết) nạp lười: chỉ tải khi địa chỉ có `ma` hoặc khi danh sách nạp trước (F03 plan 5).
// Chunk và câu chữ về song song.
const PopupChiTiet = lazy(async () => {
  const [modul] = await Promise.all([import('./PopupChiTiet'), napNgonNguThuTuc()]);
  return { default: modul.PopupChiTiet };
});

/** Nạp trước chunk popup (không nạp câu chữ): danh sách gọi sau vài giây để popup hiện ngay khi bấm. */
export function napTruocPopupChiTiet(): Promise<unknown> {
  return import('./PopupChiTiet');
}

/**
 * Popup chi tiết thủ tục dùng chung (F03 BR-5). Chỉ gắn MỘT lần, ở `Layout`; không trang nào tự dựng.
 * Không có `ma` trên địa chỉ thì không vẽ gì và không tải gì.
 */
export function ThuTucPopup() {
  const { ma, dong } = useMoThuTuc();
  useDemLichSuMoThang();
  if (ma === null) return null;
  return (
    <Suspense fallback={null}>
      <PopupChiTiet key={ma} ma={ma} onDong={dong} />
    </Suspense>
  );
}
