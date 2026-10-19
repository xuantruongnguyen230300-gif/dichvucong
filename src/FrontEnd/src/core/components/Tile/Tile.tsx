import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../utils/cx';
import { phanLoaiLienKet } from '../../utils/lienKet';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './Tile.module.css';

export type MauO = 'indigo' | 'pink' | 'teal' | 'orange' | 'blue' | 'navy';

export interface TileProps {
  ten: string;
  href: string | null;
  bieuTuong: ReactNode;
  mau: MauO;
}

const LOP_MAU: Record<MauO, string | undefined> = {
  indigo: styles.indigo,
  pink: styles.pink,
  teal: styles.teal,
  orange: styles.orange,
  blue: styles.blue,
  navy: styles.navy,
};

/**
 * Ô dịch vụ (BR-12). Có địa chỉ http/https hợp lệ: cả ô là một `<a>` mở tab mới.
 * Không có hoặc sai định dạng: khối thường cùng khung, không focus, không bấm được; chừa chỗ của dòng "Trang ngoài"
 * để cao bằng ô có liên kết.
 */
export function Tile({ ten, href, bieuTuong, mau }: TileProps) {
  const { t } = useTranslation('common');
  const lienKet = phanLoaiLienKet(href);
  const web = lienKet?.loai === 'web' ? lienKet.href : null;

  const noiDung = (
    <>
      <span className={cx(styles.bieuTuong, LOP_MAU[mau])} aria-hidden="true">
        {bieuTuong}
      </span>
      <span className={styles.ten}>{ten}</span>
    </>
  );

  return (
    <li className={styles.muc}>
      {web === null ? (
        <div className={styles.o}>
          {noiDung}
          <span className={styles.cho} aria-hidden="true" />
        </div>
      ) : (
        <a className={cx(styles.o, styles.coLienKet)} href={web} target="_blank" rel="noopener noreferrer">
          {noiDung}
          <span className={styles.ngoai} aria-hidden="true">
            {t('lien-ket-ngoai.trang-ngoai')}
            <ExternalLink size={12} aria-hidden="true" />
          </span>{' '}
          <VisuallyHidden>{t('lien-ket-ngoai.mo-trang-moi')}</VisuallyHidden>
        </a>
      )}
    </li>
  );
}

export function TileGrid({ children }: { children: ReactNode }) {
  return (
    <ul className={styles.luoi} role="list">
      {children}
    </ul>
  );
}
