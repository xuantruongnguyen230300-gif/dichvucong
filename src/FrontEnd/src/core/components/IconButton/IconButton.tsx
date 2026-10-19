import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../utils/cx';
import styles from './IconButton.module.css';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children' | 'aria-label'> {
  nhan: string; // bắt buộc → aria-label
  bieuTuong: ReactNode;
  dangBat?: boolean; // có prop → nút bật/tắt
  bienThe?: 'secondary' | 'ghost' | 'tren-nen-dam';
  ref?: Ref<HTMLButtonElement>;
}

const LOP = { secondary: '', ghost: styles.ghost, 'tren-nen-dam': styles.trenNenDam } as const;

/** Nút chỉ có icon: tên đọc lấy từ `nhan`; icon là trang trí nên bọc aria-hidden. */
export function IconButton({ nhan, bieuTuong, dangBat, bienThe = 'secondary', className, ref, ...conLai }: IconButtonProps) {
  return (
    <button
      {...conLai}
      ref={ref}
      type="button"
      className={cx(styles.nut, LOP[bienThe], className)}
      aria-label={nhan}
      aria-pressed={dangBat}
    >
      <span className={styles.bieuTuong} aria-hidden="true">
        {bieuTuong}
      </span>
    </button>
  );
}
