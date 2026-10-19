import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Badge.module.css';

export interface BadgeProps {
  loai: 'info' | 'success' | 'warning' | 'neutral';
  children: ReactNode; // luôn có chữ (BR-10)
  bieuTuong?: ReactNode;
  rutGon?: boolean; // một dòng + "…", chỉ dùng khi nội dung đầy đủ có ở chỗ khác
  kichThuoc?: 'nho' | 'vua'; // 'vua' = nhãn giờ làm việc của F02
}

const LOP_LOAI = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  neutral: styles.neutral,
} as const;

function rong(noiDung: ReactNode): boolean {
  return noiDung === null || noiDung === undefined || noiDung === false || (typeof noiDung === 'string' && noiDung.trim() === '');
}

/** Nhãn trạng thái: không focus được, không vai trò; luôn có chữ nên không chỉ dựa vào màu. Nhãn rỗng không render. */
export function Badge({ loai, children, bieuTuong, rutGon = false, kichThuoc = 'nho' }: BadgeProps) {
  if (rong(children)) return null;
  return (
    <span className={cx(styles.nhan, LOP_LOAI[loai], rutGon && styles.rutGon, kichThuoc === 'vua' && styles.vua)}>
      {bieuTuong !== undefined && (
        <span className={styles.bieuTuong} aria-hidden="true">
          {bieuTuong}
        </span>
      )}
      <span className={cx(rutGon && styles.chuRutGon)}>{children}</span>
    </span>
  );
}
