import { useTranslation } from 'react-i18next';
import { Button } from '../../core/components/Button';
import { LienHeProvider } from '../../core/components/LienHe';
import { SectionTitle } from '../../core/components/SectionTitle';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import { NhacDangXuat } from '../../core/kiosk/NhacDangXuat';
import { useCheDoKiosk } from '../../core/kiosk/useCheDoKiosk';
import { SO_DIEN_THOAI_MAU } from './duLieuMau';
import { KhoiLienKet, KhoiNhan, KhoiNut, KhoiODichVu, KhoiToken } from './KhoiCoBan';
import { KhoiChonTab } from './KhoiChonTab';
import { KhoiDanhSach, KhoiPhanTrang } from './KhoiDanhSach';
import { KhoiPopup } from './KhoiPopup';
import { KhoiTim1000 } from './KhoiTim1000';
import { KhoiNutNoi, KhoiTrangThai } from './KhoiTrangThai';
import styles from './XemTruoc.module.css';

/**
 * Trang xem trước thành phần lõi (design-system §10), chỉ có ở bản dev: route `/dev/design-system`
 * khai trong router sau `import.meta.env.DEV`.
 */
export function XemTruocThanhPhan() {
  const { t } = useTranslation('xem-truoc');
  const kiosk = useCheDoKiosk();
  return (
    <LienHeProvider soDienThoai={SO_DIEN_THOAI_MAU}>
      <main className={styles.trang}>
        <h1 className={styles.tieuDeTrang}>{t('tieu-de')}</h1>
        <p className={styles.moTa}>{t('mo-ta')}</p>

        <section aria-labelledby="xt-kiosk">
          <SectionTitle cap={2} id="xt-kiosk">
            {t('kiosk.tieu-de')}
          </SectionTitle>
          <div className={styles.hang}>
            <Button dangBat={kiosk} onClick={() => datCheDoKiosk(!kiosk)}>
              {t('kiosk.nut')}
            </Button>
          </div>
          <p className={styles.ghiChu}>{t('kiosk.mo-ta')}</p>
          <NhacDangXuat />
          <p className={styles.ghiChu}>{t('kiosk.nhac-ghi-chu')}</p>
        </section>

        <KhoiToken />
        <KhoiNut />
        <KhoiLienKet />
        <KhoiODichVu />
        <KhoiNhan />
        <KhoiChonTab />
        <KhoiDanhSach />
        <KhoiTim1000 />
        <KhoiPhanTrang />
        <KhoiPopup />
        <KhoiTrangThai />
        <KhoiNutNoi />
        <p className={styles.ghiChu}>{t('lien-he.mo-ta')}</p>
      </main>
    </LienHeProvider>
  );
}
