import { useContext, useEffect } from 'react';
import { UNSAFE_DataRouterContext as NguCanhRouter, type NavigateOptions, type To } from 'react-router';

type HamDieuHuong = (to: To | number | null, tuyChon?: NavigateOptions) => Promise<void>;
type Router = NonNullable<React.ContextType<typeof NguCanhRouter>>['router'];

/** Gán `router.navigate` thành bản luôn `replace`; trả hàm hoàn nguyên về bản gốc. Nằm ngoài hook vì đây là sửa đối tượng router có chủ đích. */
function thayDieuHuong(router: Router): () => void {
  const goc = router.navigate as HamDieuHuong;
  const moi: HamDieuHuong = (to, tuyChon) =>
    typeof to === 'number' ? goc.call(router, to) : goc.call(router, to, { ...tuyChon, replace: true });
  router.navigate = moi as typeof router.navigate;
  return () => {
    router.navigate = goc as typeof router.navigate;
  };
}

/**
 * Ở kiosk, mọi điều hướng thay mục lịch sử hiện tại thay vì thêm mục mới (F09 BR-7, AC-7): "Quay lại" không khôi phục
 * trạng thái của người trước. `Link`, `NavLink`, `setSearchParams`, `navigate()` đều đi qua `router.navigate` lúc bấm
 * nên gán lại một chỗ là đủ. `navigate(-1)` (số) giữ nguyên. Gỡ (trả hàm gốc) khi unmount.
 */
export function useDieuHuongThayLichSu(): void {
  const router = useContext(NguCanhRouter)?.router;
  useEffect(() => (router ? thayDieuHuong(router) : undefined), [router]);
}
