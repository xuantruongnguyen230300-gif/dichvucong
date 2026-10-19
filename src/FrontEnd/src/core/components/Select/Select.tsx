import { ChevronDown } from 'lucide-react';
import { useId, type Ref } from 'react';
import { cx } from '../../utils/cx';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './Select.module.css';

export interface SelectLuaChon {
  giaTri: string;
  nhan: string;
}

export interface SelectProps {
  nhan: string; // nhãn (bắt buộc), mặc định ẩn bằng VisuallyHidden
  hienNhan?: boolean;
  giaTri: string;
  onDoi: (giaTri: string) => void;
  luaChon: readonly SelectLuaChon[]; // mục đầu thường là "tất cả" (giaTri '')
  className?: string; // chỉ để nơi dùng đặt vị trí trong bố cục
  ref?: Ref<HTMLSelectElement>;
}

/**
 * Ô chọn một giá trị: `<select>` gốc (bàn phím, trình đọc màn hình và danh sách cuộn trên điện thoại có sẵn),
 * chỉ thay mũi tên bằng icon. Nhãn dài bị cắt bằng dấu "…", không làm trang cuộn ngang.
 */
export function Select({ nhan, hienNhan = false, giaTri, onDoi, luaChon, className, ref }: SelectProps) {
  const id = useId();
  return (
    <div className={cx(styles.khung, className)}>
      {hienNhan ? (
        <label htmlFor={id} className={styles.nhan}>
          {nhan}
        </label>
      ) : (
        <label htmlFor={id}>
          <VisuallyHidden>{nhan}</VisuallyHidden>
        </label>
      )}
      <div className={styles.o}>
        <select ref={ref} id={id} className={styles.chon} value={giaTri} onChange={(e) => onDoi(e.target.value)}>
          {luaChon.map((l) => (
            <option key={l.giaTri} value={l.giaTri}>
              {l.nhan}
            </option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden="true" className={styles.muiTen} />
      </div>
    </div>
  );
}
