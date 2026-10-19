import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { useDanhSachUrl } from '../../core/hooks/useDanhSachUrl';
import { docCap, docMucDo, type Cap } from './loc';

/** Khoá bộ lọc trên địa chỉ. `cap` không phải bộ lọc: "Xoá bộ lọc" giữ tab (F04 plan §4.2). */
const KHOA_BO_LOC = ['lv', 'md'] as const;

/**
 * Trạng thái của danh mục trên địa chỉ: `cap`, `lv`, `md`, `q`, `trang` (BR-3).
 * - Mọi giá trị đọc ra đã chuẩn hoá, giá trị lạ về mặc định, không bao giờ báo lỗi.
 * - Địa chỉ luôn có `cap`: thiếu hoặc sai thì ghi `cap=xa` bằng `replace`, giữ nguyên các khoá khác (kể cả `trang`, `ma`).
 * - Đổi tab: về trang 1, bỏ lĩnh vực, giữ từ khoá và mức độ (BR-5).
 * - Mọi lần ghi là `replace`; việc mở popup (thêm mục lịch sử) thuộc F03.
 */
export function useDanhMucUrl() {
  const url = useDanhSachUrl({ boLoc: KHOA_BO_LOC });
  const [, setParams] = useSearchParams();

  const capTho = url.giaTri('cap');
  const cap: Cap = docCap(capTho);

  useEffect(() => {
    if (capTho === cap) return;
    setParams(
      (truoc) => {
        const moi = new URLSearchParams(truoc);
        moi.set('cap', cap);
        return moi;
      },
      { replace: true },
    );
  }, [capTho, cap, setParams]);

  const { dat, giaTri } = url;
  const linhVucMa = giaTri('lv');
  const mucDo = docMucDo(giaTri('md'));

  return useMemo(
    () => ({
      cap,
      linhVucMa,
      mucDo,
      tuKhoa: url.tuKhoa,
      /** Từ khoá đã `useDeferredValue`: dùng để lọc, còn `tuKhoa` cho ô nhập. */
      tuKhoaLoc: url.tuKhoaLoc,
      datTuKhoa: url.datTuKhoa,
      /** Số trang thô trên địa chỉ (chuỗi hoặc null) — đưa thẳng cho danh sách, nơi chuẩn hoá. */
      trang: url.trang,
      datTrang: url.datTrang,
      /** Từ khoá hoặc lĩnh vực/mức độ đang lọc (tab không tính). */
      coDieuKien: url.coDieuKien,
      doiTab: (moi: Cap) => {
        if (moi !== cap) dat({ cap: moi, lv: null });
      },
      datLinhVuc: (ma: string) => dat({ lv: ma }),
      datMucDo: (md: string) => dat({ md }),
      xoaBoLoc: url.xoaBoLoc,
    }),
    [cap, linhVucMa, mucDo, url, dat],
  );
}
