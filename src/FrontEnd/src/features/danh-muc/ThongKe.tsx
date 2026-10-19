import { useTranslation } from 'react-i18next';
import { dinhDangSo } from '../../core/utils/dinhDang';
import { cx } from '../../core/utils/cx';
import styles from './ThongKe.module.css';

export interface ThongKeProps {
  soXa: number;
  soTinh: number;
  soLinhVuc: number;
}

type MauO = 'primary' | 'success' | 'warning';

const LOP_MAU: Record<MauO, string | undefined> = {
  primary: styles.primary,
  success: styles.success,
  warning: styles.warning,
};

/** Một ô số liệu: số lớn trên, nhãn dưới, vạch màu bên trái. Chỉ dùng ở danh mục. */
function StatCard({ so, nhan, mau }: { so: number; nhan: string; mau: MauO }) {
  return (
    <li className={cx(styles.o, LOP_MAU[mau])}>
      <strong className={styles.so}>{dinhDangSo(so)}</strong>
      <span className={styles.nhan}>{nhan}</span>
    </li>
  );
}

/** Ba con số đếm từ dữ liệu: thủ tục cấp xã, cấp tỉnh, lĩnh vực (BR-4). Không có ô "Ưu tiên" (BR-6). */
export function ThongKe({ soXa, soTinh, soLinhVuc }: ThongKeProps) {
  const { t } = useTranslation('danh-muc');
  return (
    <ul className={styles.luoi} role="list" aria-label={t('thong-ke.nhan')}>
      <StatCard so={soXa} nhan={t('thong-ke.xa')} mau="primary" />
      <StatCard so={soTinh} nhan={t('thong-ke.tinh')} mau="success" />
      <StatCard so={soLinhVuc} nhan={t('thong-ke.linh-vuc')} mau="warning" />
    </ul>
  );
}
