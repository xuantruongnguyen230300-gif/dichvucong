import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../utils/cx';
import { dayTrang } from '../../utils/phanTrang';
import styles from './Pager.module.css';

const DAU_BO_QUA = String.fromCharCode(0x2026); // "…"

export interface PagerProps {
  trang: number; // đã chuẩn hoá
  tongSoTrang: number;
  onDoiTrang: (trang: number) => void;
  nhan?: string; // mặc định common "Phân trang"
}

/** Trước / số trang / Sau. Chỉ có 1 trang thì không render. */
export function Pager({ trang, tongSoTrang, onDoiTrang, nhan }: PagerProps) {
  const { t } = useTranslation('common');
  if (tongSoTrang <= 1) return null;

  return (
    <nav aria-label={nhan ?? t('phan-trang.nhan')} className={styles.pager}>
      <button
        type="button"
        className={cx(styles.nut, styles.nutDi)}
        aria-label={t('phan-trang.trang-truoc')}
        disabled={trang <= 1}
        onClick={() => onDoiTrang(trang - 1)}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        <span className={styles.chu}>{t('phan-trang.truoc')}</span>
      </button>
      {dayTrang(trang, tongSoTrang).map((so, i) =>
        so === 'bo-qua' ? (
          <span key={`bo-qua-${i}`} className={styles.boQua} aria-hidden="true">
            {DAU_BO_QUA}
          </span>
        ) : (
          <button
            key={so}
            type="button"
            className={cx(styles.nut, so === trang && styles.hienTai)}
            aria-label={t('phan-trang.trang-so', { so })}
            aria-current={so === trang ? 'page' : undefined}
            onClick={() => {
              if (so !== trang) onDoiTrang(so);
            }}
          >
            {so}
          </button>
        ),
      )}
      <button
        type="button"
        className={cx(styles.nut, styles.nutDi)}
        aria-label={t('phan-trang.trang-sau')}
        disabled={trang >= tongSoTrang}
        onClick={() => onDoiTrang(trang + 1)}
      >
        <span className={styles.chu}>{t('phan-trang.sau')}</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
