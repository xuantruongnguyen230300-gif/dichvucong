import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { cx } from '../../core/utils/cx';
import { CauTraLoiView } from './CauTraLoiView';
import styles from './TinNhan.module.css';
import type { TinNhanState } from './useHoiTroLy';
import { LoiTinNhan } from './view/LoiTinNhan';

interface TinNhanProps {
  tin: TinNhanState;
  /** Gửi lại yêu cầu của tin lỗi có id này. Phải ổn định giữa các lần vẽ (tin có `memo`). */
  onThuLai: (idTinLoi: number) => void;
}

/**
 * Một bóng chat. `memo`: địa chỉ trang đổi (vd. 300 ms mỗi lần gõ ở ô tìm của trang) không vẽ lại cả danh sách.
 * Tên người nói có cho trình đọc màn hình (ẩn bằng `VisuallyHidden`), không dựa vào vị trí và màu bóng.
 */
export const TinNhan = memo(function TinNhan({ tin, onThuLai }: TinNhanProps) {
  const { t } = useTranslation('chatbot');
  const laNguoiDan = tin.vai === 'nguoi-dan';
  return (
    <div data-tin={tin.id} className={cx(styles.tin, laNguoiDan ? styles.nguoiDan : styles.troLy)}>
      <VisuallyHidden>{laNguoiDan ? t('tin.nguoi-dan') : t('tin.tro-ly')} </VisuallyHidden>
      {tin.vai === 'nguoi-dan' && <p className={styles.chuNguoiDan}>{tin.noiDung}</p>}
      {tin.vai === 'tro-ly' && tin.kieu === 'dap-an' && <CauTraLoiView cau={tin.cau} luc={tin.luc} />}
      {tin.vai === 'tro-ly' && tin.kieu === 'loi' && <LoiTinNhan loi={tin.loi} onThuLai={() => onThuLai(tin.id)} />}
    </div>
  );
});

/** Lời chào: tin đầu của trợ lý khi mở; không gọi API, không vào điểm ghép đọc (F07). */
export function LoiChao() {
  const { t } = useTranslation('chatbot');
  return (
    <div className={cx(styles.tin, styles.troLy)}>
      <VisuallyHidden>{t('tin.tro-ly')} </VisuallyHidden>
      <p className={styles.chuNguoiDan}>{t('khung.loi-chao')}</p>
    </div>
  );
}

/** Tin chờ trong lúc máy chủ trả lời: chữ tĩnh, không hoạt ảnh. */
export function TinCho() {
  const { t } = useTranslation('chatbot');
  return (
    <div className={cx(styles.tin, styles.troLy)} aria-busy="true">
      <p className={styles.chuNguoiDan}>{t('khung.dang-tim')}</p>
    </div>
  );
}
