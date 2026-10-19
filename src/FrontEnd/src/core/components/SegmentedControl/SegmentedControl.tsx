import { Check, LayoutGrid, List } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../utils/cx';
import type { CachXem } from '../../hooks/useCachXem';
import styles from './SegmentedControl.module.css';

export interface SegmentedControlProps<T extends string> {
  nhan: string;
  luaChon: readonly { giaTri: T; nhan: string; bieuTuong?: ReactNode }[];
  giaTri: T;
  onDoi: (giaTri: T) => void;
  className?: string;
}

/** Chọn một trong vài mục liền nhau. Mục đang dùng: nền xanh + dấu ✓ thay icon thường. */
export function SegmentedControl<T extends string>({ nhan, luaChon, giaTri, onDoi, className }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={nhan} className={cx(styles.nhom, className)}>
      {luaChon.map((l) => {
        const dangDung = l.giaTri === giaTri;
        return (
          <button key={l.giaTri} type="button" className={styles.nut} aria-pressed={dangDung} onClick={() => onDoi(l.giaTri)}>
            {dangDung ? <Check size={16} aria-hidden="true" /> : l.bieuTuong}
            {l.nhan}
          </button>
        );
      })}
    </div>
  );
}

export interface ViewToggleProps {
  giaTri: CachXem;
  onDoi: (v: CachXem) => void;
}

/** "Dạng thẻ / Dạng bảng". Ẩn dưới 600 px, vì ở khổ đó danh sách luôn là thẻ. */
export function ViewToggle({ giaTri, onDoi }: ViewToggleProps) {
  const { t } = useTranslation('common');
  const luaChon = [
    { giaTri: 'the', nhan: t('cach-xem.the'), bieuTuong: <LayoutGrid size={16} aria-hidden="true" /> },
    { giaTri: 'bang', nhan: t('cach-xem.bang'), bieuTuong: <List size={16} aria-hidden="true" /> },
  ] as const;
  return (
    <SegmentedControl
      nhan={t('cach-xem.nhan')}
      luaChon={luaChon}
      giaTri={giaTri}
      onDoi={onDoi}
      className={styles.anTrenDienThoai}
    />
  );
}
