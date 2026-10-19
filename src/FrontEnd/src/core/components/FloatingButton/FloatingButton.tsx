import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../utils/cx';
import styles from './FloatingButton.module.css';

export interface FloatingButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  viTri: 'phai' | 'trai'; // phải: trợ lý (F06); trái: "Bắt đầu lại" (F09)
  trenPopup?: boolean; // true → --z-kiosk-reset (55); mặc định --z-fab (40)
  bieuTuong: ReactNode;
  children: ReactNode; // chữ hiện ra, feature truyền ("Trợ lý")
  dangMo?: boolean; // → aria-expanded
  dieuKhien?: string; // id khung → aria-controls
  ref?: Ref<HTMLButtonElement>;
}

/** Nút nổi ở góc dưới; luôn có cả icon và chữ (BR-13). Chỗ chừa cuối trang là việc của layout (`--fab-clearance`). */
export function FloatingButton({
  viTri,
  trenPopup = false,
  bieuTuong,
  children,
  dangMo,
  dieuKhien,
  className,
  ref,
  ...conLai
}: FloatingButtonProps) {
  return (
    <button
      {...conLai}
      ref={ref}
      type="button"
      className={cx(styles.nut, viTri === 'phai' ? styles.phai : styles.trai, trenPopup && styles.trenPopup, className)}
      aria-expanded={dangMo}
      aria-controls={dieuKhien}
    >
      <span className={styles.bieuTuong} aria-hidden="true">
        {bieuTuong}
      </span>
      {children}
    </button>
  );
}
