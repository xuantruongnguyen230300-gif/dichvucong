import { House, LayoutGrid, List, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { DUONG_DAN, type KhoaTrang } from '../../core/duongDan';
import styles from './DieuHuongChinh.module.css';

interface MucDieuHuong {
  khoa: Exclude<KhoaTrang, 'khong-tim-thay'>;
  to: string;
  bieuTuong: LucideIcon;
  /** Mục "Trang chủ": chỉ khớp đúng "/", và chỉ có một nhãn. */
  end?: boolean;
}

const MUC: readonly MucDieuHuong[] = [
  { khoa: 'trang-chu', to: DUONG_DAN.trangChu, bieuTuong: House, end: true },
  { khoa: 'danh-muc', to: DUONG_DAN.danhMuc, bieuTuong: List },
  { khoa: 'linh-vuc', to: DUONG_DAN.linhVuc, bieuTuong: LayoutGrid },
];

/**
 * Điều hướng chính, 3 mục (BR-2). Dưới 600px: nhãn ngắn trên màn hình; tên đọc luôn là nhãn đầy đủ
 * (nhãn đầy đủ chuyển thành chữ ẩn, nhãn ngắn `aria-hidden`), nên đạt WCAG 2.5.3.
 * Mục đang xem có `aria-current="page"` (NavLink tự gắn) và gạch dưới — không chỉ dựa vào màu.
 */
export function DieuHuongChinh() {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('dieu-huong.nhan')} className={styles.thanh}>
      <div className={styles.khung}>
        {MUC.map(({ khoa, to, bieuTuong: BieuTuong, end }) => (
          <NavLink key={khoa} to={to} end={end} className={styles.muc}>
            <BieuTuong size={16} aria-hidden="true" className={styles.bieuTuong} />
            {khoa === 'trang-chu' ? (
              <span>{t('trang.trang-chu.ten')}</span>
            ) : (
              <>
                <span className={styles.nhanDay}>{t(`trang.${khoa}.ten`)}</span>
                <span className={styles.nhanNgan} aria-hidden="true">
                  {t(`trang.${khoa}.ten-ngan`)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
