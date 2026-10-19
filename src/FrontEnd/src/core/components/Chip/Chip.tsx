import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../utils/cx';
import { IconButton } from '../IconButton';
import styles from './Chip.module.css';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Có prop → chip lọc (aria-pressed). Không truyền → chip lẻ, vd. câu gợi ý của trợ lý. */
  daChon?: boolean;
  children: ReactNode;
}

export function Chip({ daChon, children, className, type = 'button', ...conLai }: ChipProps) {
  return (
    <button
      {...conLai}
      type={type}
      className={cx(styles.chip, daChon && styles.daChon, className)}
      aria-pressed={daChon}
    >
      {daChon && <Check size={14} aria-hidden="true" />}
      {children}
    </button>
  );
}

export interface ChipGroupProps<T extends string> {
  nhan: string; // aria-label của nhóm
  luaChon: readonly { giaTri: T; nhan: string }[];
  giaTri: T;
  onDoi: (giaTri: T) => void;
}

const BUOC_CUON = 0.8;

/**
 * Hàng chip lọc, chọn một. Cuộn ngang được; trên máy có chuột có nút cuộn trái/phải khi còn phần bị khuất.
 * Nút cuộn chỉ hỗ trợ chuột (tabIndex -1, aria-hidden): bàn phím tới mọi chip bằng Tab.
 */
export function ChipGroup<T extends string>({ nhan, luaChon, giaTri, onDoi }: ChipGroupProps<T>) {
  const { t } = useTranslation('common');
  const hang = useRef<HTMLDivElement>(null);
  const [khuat, setKhuat] = useState({ trai: false, phai: false });

  useEffect(() => {
    const phanTu = hang.current;
    if (!phanTu) return;
    const capNhat = () => {
      const trai = phanTu.scrollLeft > 1;
      const phai = phanTu.scrollLeft + phanTu.clientWidth < phanTu.scrollWidth - 1;
      setKhuat((cu) => (cu.trai === trai && cu.phai === phai ? cu : { trai, phai }));
    };
    const quanSat = new ResizeObserver(capNhat);
    quanSat.observe(phanTu);
    for (const chip of phanTu.children) quanSat.observe(chip);
    phanTu.addEventListener('scroll', capNhat, { passive: true });
    return () => {
      quanSat.disconnect();
      phanTu.removeEventListener('scroll', capNhat);
    };
  }, [luaChon]);

  const cuon = (huong: -1 | 1) => hang.current?.scrollBy?.({ left: huong * hang.current.clientWidth * BUOC_CUON });

  return (
    <div className={styles.khung}>
      {khuat.trai && (
        <IconButton
          nhan={t('chip.cuon-trai')}
          bieuTuong={<ChevronLeft size={16} aria-hidden="true" />}
          bienThe="secondary"
          className={cx(styles.cuon, styles.cuonTrai)}
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => cuon(-1)}
        />
      )}
      <div ref={hang} role="group" aria-label={nhan} className={styles.hang}>
        {luaChon.map((l) => (
          <Chip key={l.giaTri} daChon={l.giaTri === giaTri} onClick={() => onDoi(l.giaTri)}>
            {l.nhan}
          </Chip>
        ))}
      </div>
      {khuat.phai && (
        <IconButton
          nhan={t('chip.cuon-phai')}
          bieuTuong={<ChevronRight size={16} aria-hidden="true" />}
          bienThe="secondary"
          className={cx(styles.cuon, styles.cuonPhai)}
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => cuon(1)}
        />
      )}
    </div>
  );
}
