import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Card.module.css';

export interface CardProps {
  as?: 'div' | 'article' | 'section' | 'li';
  children: ReactNode;
  className?: string;
}

/** Thẻ: các thẻ cùng hàng cao bằng nhau (cao 100% ô lưới). */
export function Card({ as: Tag = 'div', children, className }: CardProps) {
  return <Tag className={cx(styles.the, className)}>{children}</Tag>;
}

/** Hàng nút cuối thẻ: thẳng hàng giữa các thẻ; thẻ hẹp thì nút xếp dọc. */
export function CardActions({ children }: { children: ReactNode }) {
  return <div className={styles.hanhDong}>{children}</div>;
}
