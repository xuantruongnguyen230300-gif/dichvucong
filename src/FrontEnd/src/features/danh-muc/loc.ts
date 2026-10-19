import type { MucDo, ThuTucDanhMuc } from '../../core/api/danhMucThuTuc';
import type { LinhVuc } from '../../core/api/linhVuc';

/** Cấp của danh mục: tab trên màn hình, giá trị `cap` trên địa chỉ. */
export type Cap = 'xa' | 'tinh';

export interface BoLoc {
  cap: Cap;
  /** Mã lĩnh vực; '' = tất cả. */
  linhVucMa: string;
  /** '' = tất cả mức độ. */
  mucDo: MucDo | '';
  /** Từ `taoBoLocTuKhoa`; nhận chuỗi `tim` của thủ tục. */
  boLocTuKhoa: (tim: string) => boolean;
}

/** Chỉ `tinh` là cấp tỉnh; thiếu hoặc lạ đều là cấp xã (F04 plan §4.2). */
export const docCap = (tho: string): Cap => (tho === 'tinh' ? 'tinh' : 'xa');

/** Chỉ `toan-trinh`, `mot-phan` hợp lệ; còn lại coi như "tất cả". */
export const docMucDo = (tho: string): MucDo | '' => (tho === 'toan-trinh' || tho === 'mot-phan' ? tho : '');

/** Thủ tục thuộc cấp đó, giữ thứ tự của `ds`. Tách một lần theo dữ liệu rồi lọc trên danh sách đã tách. */
export function thuTucCuaCap(ds: readonly ThuTucDanhMuc[], cap: Cap): ThuTucDanhMuc[] {
  return ds.filter((t) => (cap === 'xa' ? t.capXa : t.capTinh));
}

/** Giao của cấp, lĩnh vực, mức độ và từ khoá. Giữ thứ tự của `ds`. */
export function locThuTuc(ds: readonly ThuTucDanhMuc[], bo: BoLoc): ThuTucDanhMuc[] {
  const { cap, linhVucMa, mucDo, boLocTuKhoa } = bo;
  return ds.filter(
    (t) =>
      (cap === 'xa' ? t.capXa : t.capTinh) &&
      (linhVucMa === '' || t.linhVucMa === linhVucMa) &&
      (mucDo === '' || t.mucDo === mucDo) &&
      boLocTuKhoa(t.tim),
  );
}

/** Số thủ tục của lĩnh vực ở một cấp. */
export const soThuTucCuaCap = (l: LinhVuc, cap: Cap): number => (cap === 'xa' ? l.soThuTucXa : l.soThuTucTinh);

/**
 * Lựa chọn cho ô lĩnh vực: lĩnh vực có thủ tục ở cấp này, giữ thứ tự của API. Lĩnh vực đang chọn
 * (có trong dữ liệu) vẫn được giữ dù cấp này không có thủ tục nào, để ô chọn khớp với địa chỉ.
 */
export function luaChonLinhVuc(linhVuc: readonly LinhVuc[], cap: Cap, dangChon: string): LinhVuc[] {
  return linhVuc.filter((l) => soThuTucCuaCap(l, cap) > 0 || (dangChon !== '' && l.ma === dangChon));
}
