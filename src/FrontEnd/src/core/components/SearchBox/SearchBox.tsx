import { Search, X } from 'lucide-react';
import { useEffect, useId, useImperativeHandle, useRef, useState, type ChangeEvent, type KeyboardEvent, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { TU_KHOA_TOI_DA } from '../../utils/timKiem';
import { IconButton } from '../IconButton';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './SearchBox.module.css';

const TRE_BAO_KET_QUA_MS = 500;

export interface SearchBoxProps {
  nhan: string; // nhãn (bắt buộc), mặc định ẩn bằng VisuallyHidden
  hienNhan?: boolean;
  goiY?: string; // placeholder — không thay cho nhãn
  giaTri: string;
  onDoi: (giaTri: string) => void;
  soKetQua?: number; // có → báo số kết quả cho trình đọc màn hình
  maxLength?: number; // mặc định TU_KHOA_TOI_DA (100)
  ref?: Ref<HTMLInputElement>;
}

/** Ô tìm kiếm có nhãn, nút xoá, và vùng báo số kết quả cho trình đọc màn hình (WCAG 4.1.3). Không có micro. */
export function SearchBox({ nhan, hienNhan = false, goiY, giaTri, onDoi, soKetQua, maxLength = TU_KHOA_TOI_DA, ref }: SearchBoxProps) {
  const { t } = useTranslation('common');
  const id = useId();
  const oNhap = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => oNhap.current as HTMLInputElement, []);

  // Chỉ báo sau khi người dùng đã gõ, khi số kết quả đứng yên 500 ms; không báo lúc mới mở trang.
  const [daGo, setDaGo] = useState(false);
  const [thongBao, setThongBao] = useState('');
  useEffect(() => {
    if (!daGo || soKetQua === undefined) return;
    const dongHo = setTimeout(
      () => setThongBao(soKetQua > 0 ? t('tim-kiem.so-ket-qua', { so: soKetQua }) : t('tim-kiem.khong-co-ket-qua')),
      TRE_BAO_KET_QUA_MS,
    );
    return () => clearTimeout(dongHo);
  }, [daGo, soKetQua, giaTri, t]);

  const khiDoi = (e: ChangeEvent<HTMLInputElement>) => {
    setDaGo(true);
    onDoi(e.target.value);
  };

  const khiNhanPhim = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.preventDefault(); // không gửi form
  };

  const xoa = () => {
    setDaGo(true);
    onDoi('');
    oNhap.current?.focus();
  };

  return (
    <div className={styles.khung}>
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
        <Search size={16} aria-hidden="true" className={styles.bieuTuong} />
        <input
          ref={oNhap}
          id={id}
          type="search"
          className={styles.nhap}
          value={giaTri}
          placeholder={goiY}
          maxLength={maxLength}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          onChange={khiDoi}
          onKeyDown={khiNhanPhim}
        />
        {giaTri !== '' && (
          <IconButton
            nhan={t('tim-kiem.xoa')}
            bieuTuong={<X size={16} aria-hidden="true" />}
            bienThe="ghost"
            className={styles.xoa}
            onClick={xoa}
          />
        )}
      </div>
      <VisuallyHidden>
        <span role="status">{thongBao}</span>
      </VisuallyHidden>
    </div>
  );
}
