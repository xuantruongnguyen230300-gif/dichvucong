import type { UseQueryResult } from '@tanstack/react-query';
import { CircleCheck, Clock } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { ThongTinTrungTam } from '../../core/api/trungTam';
import { Badge } from '../../core/components/Badge';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { cx } from '../../core/utils/cx';
import { dangLamViec, gopNgay, type Khung } from './gioLamViec';
import styles from './KhoiGioLamViec.module.css';
import { useBayGio } from './useBayGio';

type Thu = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Giờ làm việc và trạng thái mở/đóng (F02 BR-2, BR-7, BR-8). Giờ và trạng thái cùng đi qua một bước chuẩn hoá (`gioLamViec.ts`).
 * Đang tải: dải xanh + tiêu đề hiện ngay, bên trong giữ chỗ bằng chiều cao của trường hợp thường gặp (một dòng gộp, hai buổi).
 * Lỗi, không có dòng giờ hợp lệ nào: ẩn cả khối (không có giờ nào để nói "ngoài giờ").
 */
export function KhoiGioLamViec({ truyVan }: { truyVan: UseQueryResult<ThongTinTrungTam> }) {
  const { t } = useTranslation('trang-chu');
  const bayGio = useBayGio();
  const idTieuDe = useId();

  const tieuDe = (
    <h2 id={idTieuDe} className={styles.tieuDe}>
      <Clock size={18} aria-hidden="true" />
      {t('gio-lam-viec.tieu-de')}
    </h2>
  );

  const trungTam = truyVan.data;
  if (!trungTam) {
    const dangTai = truyVan.isPending || (truyVan.isError && truyVan.isFetching);
    if (!dangTai) return null;
    return (
      <section className={styles.dai} data-nen-dam="" aria-labelledby={idTieuDe} aria-busy="true">
        {tieuDe}
        <VisuallyHidden>
          <span role="status">{t('trang-thai.dang-tai', { ns: 'common' })}</span>
        </VisuallyHidden>
        <div className={styles.trangThai} aria-hidden="true">
          <span className={styles.choTrangThai} />
        </div>
        <div className={styles.danhSach} aria-hidden="true">
          <div className={styles.hang}>
            <span className={cx(styles.nhanThu, styles.choNhanThu)} />
            <span className={styles.choBuoi} />
            <span className={styles.choBuoi} />
          </div>
        </div>
      </section>
    );
  }

  const nhom = gopNgay(trungTam.gioLamViec);
  if (nhom.length === 0) return null;

  const dangMo = dangLamViec(trungTam.gioLamViec, bayGio);
  const ghiChu = trungTam.ghiChuNgayNghi?.trim();
  const tenThu = (thu: number) => t(`gio-lam-viec.thu.${thu as Thu}`);

  const buoi = (nhan: string, khung: Khung | null) =>
    khung && (
      <span className={styles.buoi}>
        <span className={styles.nhanBuoi}>{nhan}</span>
        <span className={styles.khoangGio}>{t('gio-lam-viec.khoang', { tu: khung.tu, den: khung.den })}</span>
      </span>
    );

  return (
    <section className={styles.dai} data-nen-dam="" aria-labelledby={idTieuDe}>
      {tieuDe}
      <div className={styles.trangThai}>
        {dangMo ? (
          <Badge loai="success" kichThuoc="vua" bieuTuong={<CircleCheck size={14} />}>
            {t('gio-lam-viec.dang-mo')}
          </Badge>
        ) : (
          <Badge loai="neutral" kichThuoc="vua" bieuTuong={<Clock size={14} />}>
            {t('gio-lam-viec.ngoai-gio')}
          </Badge>
        )}
      </div>
      <ul className={styles.danhSach} role="list">
        {nhom.map((n) => (
          <li key={n.tuThu} className={styles.hang}>
            <span className={styles.nhanThu}>
              {n.tuThu === n.denThu ? tenThu(n.tuThu) : t('gio-lam-viec.khoang', { tu: tenThu(n.tuThu), den: tenThu(n.denThu) })}
            </span>
            {buoi(t('gio-lam-viec.sang'), n.sang)}
            {buoi(t('gio-lam-viec.chieu'), n.chieu)}
          </li>
        ))}
      </ul>
      {ghiChu && <p className={styles.ghiChu}>{ghiChu}</p>}
    </section>
  );
}
