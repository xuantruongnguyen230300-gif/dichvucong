import { LogOut, RotateCcw } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FloatingButton } from '../components/FloatingButton';
import { cx } from '../utils/cx';
import { batDauLai } from './batDauLai';
import { useDieuHuongThayLichSu } from './dieuHuongThayLichSu';
import styles from './giaoDienKiosk.module.css';
import { laLienKetCongDvc } from './laLienKetCongDvc';
import type { NhacDangXuatProps } from './NhacDangXuat';

/**
 * Chunk giao diện kiosk (F09): chỉ nạp ở chế độ kiosk, qua `napGiaoDienKiosk`. Không import tĩnh từ bundle chính.
 * Không có bộ đếm giờ nào ở đây (BR-2): không gì tự gọi `batDauLai`, chỉ `onClick` của nút.
 */

/** Ruột dòng nhắc đăng xuất: không phải liên kết, không có nút (BR-4). */
export function NhacDangXuatNoiDung({ cacLienKet, className }: NhacDangXuatProps) {
  const { t } = useTranslation('kiosk');
  if (cacLienKet && !cacLienKet.some(laLienKetCongDvc)) return null;
  return (
    <p className={cx(styles.nhac, className)}>
      <LogOut size={14} aria-hidden="true" />
      {t('nhac-dang-xuat')}
    </p>
  );
}

/**
 * Nút "Bắt đầu lại" (BR-7). Con trực tiếp của `<body>` kèm `data-ngoai-popup`: `Modal` không đặt `inert` cho nó
 * và đưa nó vào cuối vòng Tab khi popup mở; ngoài popup nó đứng sau cây `#root` nên là phần tử Tab cuối cùng.
 */
function NutBatDauLai() {
  const { t } = useTranslation('kiosk');
  return createPortal(
    <FloatingButton
      viTri="trai"
      trenPopup
      data-ngoai-popup=""
      className={styles.nutBatDauLai}
      bieuTuong={<RotateCcw size={18} />}
      onClick={batDauLai}
    >
      {t('bat-dau-lai')}
    </FloatingButton>,
    document.body,
  );
}

/** Phần giao diện kiosk gắn vào `Layout`: điều hướng thay lịch sử (BR-7) và nút "Bắt đầu lại". */
export function LopKiosk() {
  useDieuHuongThayLichSu();
  return <NutBatDauLai />;
}
