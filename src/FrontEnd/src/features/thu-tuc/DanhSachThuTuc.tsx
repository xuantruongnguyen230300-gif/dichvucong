import { useCallback } from 'react';
import { DataTable } from '../../core/components/DataTable';
import type { CachXem } from '../../core/hooks/useCachXem';
import { NhacDangXuat } from '../../core/kiosk/NhacDangXuat';
import { useCotThuTuc } from './cotThuTuc';
import { KhungNhacKiosk } from './KhungNhacKiosk';
import { ThuTucCard } from './ThuTucCard';
import type { MucThuTuc } from './types';

export interface DanhSachThuTucProps<T extends MucThuTuc> {
  /** Đã lọc, đúng thứ tự. */
  duLieu: readonly T[];
  cachXem: CachXem;
  /** Đã qua `t()`. */
  tieuDeBang: string;
  /** F03: 12, F04: 25. */
  soMucMoiTrang: number;
  /** Dạng thẻ; F03 = 4. */
  soCotToiDa?: number;
  /** Số trang thô trên địa chỉ (`useDanhSachUrl().trang`). */
  trang: string | null;
  onDoiTrang: (so: number) => void;
  /** Cấp tiêu đề tên thủ tục trên thẻ; mặc định 3. */
  capTieuDeThe?: 2 | 3;
}

const khoaThuTuc = (d: MucThuTuc) => d.ma;

/**
 * Danh sách thủ tục dạng thẻ hoặc bảng (F03 BR-4, BR-6, BR-7); F02/F03 (thường gặp) và F04 (danh mục) dùng chung.
 * Ở kiosk có đúng MỘT dòng nhắc đăng xuất (F09 BR-4) ngay trên danh sách, không lặp từng thẻ/hàng. Gốc là fragment:
 * khoảng cách với danh sách do lưới cha lo (`.khoi` của F03, `.bang` của F04 đều `gap` bằng token).
 */
export function DanhSachThuTuc<T extends MucThuTuc>({
  duLieu,
  cachXem,
  tieuDeBang,
  soMucMoiTrang,
  soCotToiDa,
  trang,
  onDoiTrang,
  capTieuDeThe = 3,
}: DanhSachThuTucProps<T>) {
  const cot = useCotThuTuc();

  const renderCard = useCallback((d: T) => <ThuTucCard thuTuc={d} capTieuDe={capTieuDeThe} />, [capTieuDeThe]);

  return (
    <>
      <KhungNhacKiosk>
        <NhacDangXuat />
      </KhungNhacKiosk>
      <DataTable
        duLieu={duLieu}
        khoaDong={khoaThuTuc}
        cachXem={cachXem}
        cot={cot}
        renderCard={renderCard}
        tieuDeBang={tieuDeBang}
        soMucMoiTrang={soMucMoiTrang}
        trang={trang}
        onDoiTrang={onDoiTrang}
        {...(soCotToiDa === undefined ? {} : { soCotToiDa })}
      />
    </>
  );
}
