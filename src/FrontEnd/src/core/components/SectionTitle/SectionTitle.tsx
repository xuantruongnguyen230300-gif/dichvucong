import type { ReactNode } from 'react';
import styles from './SectionTitle.module.css';

interface SectionTitleProps {
  cap: 2 | 3;
  id?: string;
  children: ReactNode;
  phu?: ReactNode; // bên phải, vd. số đếm
}

/** Tiêu đề mục: vạch đỏ + tiêu đề đậm. */
export function SectionTitle({ cap, id, children, phu }: SectionTitleProps) {
  const Tag = cap === 2 ? 'h2' : 'h3';
  return (
    <div className={styles.khung}>
      <Tag id={id} className={styles.tieuDe}>
        {children}
      </Tag>
      {phu !== undefined && phu !== null && <span className={styles.phu}>{phu}</span>}
    </div>
  );
}
