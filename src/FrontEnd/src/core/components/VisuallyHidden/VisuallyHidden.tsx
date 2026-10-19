import type { ReactNode } from 'react';
import styles from './VisuallyHidden.module.css';

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: 'span' | 'div';
}

/** Chữ chỉ dành cho trình đọc màn hình. */
export function VisuallyHidden({ children, as: Tag = 'span' }: VisuallyHiddenProps) {
  return <Tag className={styles.an}>{children}</Tag>;
}
