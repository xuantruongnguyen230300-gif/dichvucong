import { ExternalLink as BieuTuongMoNgoai } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../utils/cx';
import { phanLoaiLienKet } from '../../utils/lienKet';
import { lopNut } from '../Button/Button';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './ExternalLink.module.css';

export type BienTheLienKet = 'mac-dinh' | 'dam' | 'nut-accent' | 'nut-secondary';

export interface ExternalLinkProps {
  href: string | null | undefined; // thô, lấy từ dữ liệu
  children: ReactNode; // chữ ghi rõ đích đến
  bienThe?: BienTheLienKet; // 'dam': link gọn trong bảng; 'nut-accent': "Xem và nộp trên Cổng DVC"
  ref?: Ref<HTMLAnchorElement>;
}

function lopTheoBienThe(bienThe: BienTheLienKet): string {
  switch (bienThe) {
    case 'nut-accent':
      return lopNut('accent');
    case 'nut-secondary':
      return lopNut('secondary');
    case 'dam':
      return cx(styles.lienKet, styles.dam);
    default:
      return styles.lienKet ?? '';
  }
}

/**
 * Liên kết từ dữ liệu (BR-3). Địa chỉ được kiểm theo danh sách cho phép:
 * web mở tab mới (`noopener noreferrer`, báo cho trình đọc màn hình), `tel:` và `mailto:` mở ngay,
 * địa chỉ lạ (vd. `javascript:`) chỉ còn là chữ thường.
 */
export function ExternalLink({ href, children, bienThe = 'mac-dinh', ref }: ExternalLinkProps) {
  const { t } = useTranslation('common');
  const lienKet = phanLoaiLienKet(href);

  if (lienKet === null) return <span>{children}</span>;

  if (lienKet.loai !== 'web') {
    return (
      <a ref={ref} href={lienKet.href} className={lopTheoBienThe(bienThe)}>
        {children}
      </a>
    );
  }

  return (
    <a ref={ref} href={lienKet.href} target="_blank" rel="noopener noreferrer" className={lopTheoBienThe(bienThe)}>
      {children}{' '}
      <BieuTuongMoNgoai size={bienThe === 'mac-dinh' ? 12 : 14} aria-hidden="true" className={styles.bieuTuong} />
      <VisuallyHidden>{t('lien-ket-ngoai.mo-trang-moi')}</VisuallyHidden>
    </a>
  );
}
