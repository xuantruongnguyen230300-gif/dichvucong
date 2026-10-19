import type { UseQueryResult } from '@tanstack/react-query';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { ThongTinTrungTam } from '../../core/api/trungTam';
import { laLienKetCongDvc } from '../../core/kiosk/laLienKetCongDvc';
import { NhacDangXuat } from '../../core/kiosk/NhacDangXuat';
import { useCheDoKiosk } from '../../core/kiosk/useCheDoKiosk';
import { QueryState } from '../../core/components/QueryState';
import { Skeleton } from '../../core/components/Skeleton';
import { Tile, TileGrid } from '../../core/components/Tile';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { bieuTuongCuaO } from './bieuTuongODichVu';
import styles from './KhuODichVu.module.css';

/** Số khối giữ chỗ khi đang tải: số ô của Cần Giuộc (lien-ket.md §1), để trang không giật khi dữ liệu về. */
const SO_O_GIU_CHO = 6;

/**
 * Ô dịch vụ nhanh (F02 BR-1, BR-4). Link, ô không link, "Trang ngoài" do `Tile` lo (C01 BR-12); khối này không tự kiểm link.
 * Đây là nơi duy nhất của trang chủ hiện `ErrorState` cho dữ liệu Trung tâm.
 * Không dùng `<nav>`: đã có thanh điều hướng chính, thêm landmark chỉ làm trình đọc màn hình rối.
 */
export function KhuODichVu({ truyVan }: { truyVan: UseQueryResult<ThongTinTrungTam> }) {
  const { t } = useTranslation('trang-chu');
  const idTieuDe = useId();
  const laKiosk = useCheDoKiosk();

  return (
    <section aria-labelledby={idTieuDe}>
      <h2 id={idTieuDe} className={styles.tieuDe}>
        <VisuallyHidden>{t('o-dich-vu.tieu-de')}</VisuallyHidden>
      </h2>
      <QueryState truyVan={truyVan} khungCho={<Skeleton dang="o" soMuc={SO_O_GIU_CHO} />}>
        {(trungTam) => {
          if (trungTam.oDichVu.length === 0) return null;
          const cacLienKet = trungTam.oDichVu.map((o) => o.url);
          // F09 BR-4: một dòng phía trên lưới, chỉ kiosk và chỉ khi có ô tới Cổng DVC (việc nhận diện do core lo).
          const nhac = <NhacDangXuat className={styles.nhac} cacLienKet={cacLienKet} />;
          return (
            <>
              {/* Dòng nhắc nằm trong chunk kiosk nạp lười, có thể về sau dữ liệu: giữ sẵn chỗ một dòng để lưới không bị đẩy xuống (CLS) */}
              {laKiosk && cacLienKet.some(laLienKetCongDvc) ? <div className={styles.giuChoNhac}>{nhac}</div> : nhac}
              <TileGrid>
                {trungTam.oDichVu.map((o, i) => {
                  const { bieuTuong, mau } = bieuTuongCuaO(o.bieuTuong);
                  return <Tile key={`${i}-${o.ten}`} ten={o.ten} href={o.url} bieuTuong={bieuTuong} mau={mau} />;
                })}
              </TileGrid>
            </>
          );
        }}
      </QueryState>
    </section>
  );
}
