import { CircleCheck, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../core/components/Badge';
import { dangLamViec, gopNgay, type Khung } from '../../trang-chu/gioLamViec';
import type { ThongTinTrungTamMuc } from '../api/troLy';
import styles from './view.module.css';

type Thu = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface GioLamViecViewProps {
  gioLamViec: NonNullable<ThongTinTrungTamMuc['gioLamViec']>;
  ghiChuNgayNghi: string | null;
  /** Thời điểm đáp án đến (ms). Trạng thái "đang trong/ngoài giờ" tính MỘT lần theo thời điểm này: đáp án là ảnh chụp lúc hỏi (AC-19). */
  luc: number;
}

/**
 * Giờ làm việc của Trung tâm (BR-9): các ngày làm việc gộp như F02 BR-8, ghi chú ngày nghỉ, kèm trạng thái tính như F02 BR-2.
 * Dùng `gopNgay`, `dangLamViec` của F02 (hàm thuần). Không có dòng giờ hợp lệ nào: không vẽ gì (người gọi nói "chưa có thông tin").
 */
export function GioLamViecView({ gioLamViec, ghiChuNgayNghi, luc }: GioLamViecViewProps) {
  const { t } = useTranslation('chatbot');
  const nhom = gopNgay(gioLamViec);
  if (nhom.length === 0) return null;

  const dangMo = dangLamViec(gioLamViec, new Date(luc));
  const tenThu = (thu: number) => t(`trung-tam.thu.${thu as Thu}`);
  const buoi = (nhan: string, khung: Khung | null) =>
    khung && (
      <span className={styles.buoi}>
        {nhan} {t('trung-tam.khoang', { tu: khung.tu, den: khung.den })}
      </span>
    );
  const ghiChu = ghiChuNgayNghi?.trim();

  return (
    <>
      <p className={styles.doan}>{t('trung-tam.gio-lam-viec')}</p>
      <ul className={styles.danhSach} role="list">
        {nhom.map((n) => (
          <li key={n.tuThu}>
            <strong>
              {n.tuThu === n.denThu
                ? tenThu(n.tuThu)
                : t('trung-tam.khoang-ngay', { tu: tenThu(n.tuThu), den: tenThu(n.denThu) })}
            </strong>
            {buoi(t('trung-tam.sang'), n.sang)}
            {buoi(t('trung-tam.chieu'), n.chieu)}
          </li>
        ))}
      </ul>
      {ghiChu && <p className={styles.phu}>{ghiChu}</p>}
      <p className={styles.doan}>
        {dangMo ? (
          <Badge loai="success" kichThuoc="vua" bieuTuong={<CircleCheck size={14} />}>
            {t('trung-tam.dang-mo')}
          </Badge>
        ) : (
          <Badge loai="neutral" kichThuoc="vua" bieuTuong={<Clock size={14} />}>
            {t('trung-tam.ngoai-gio')}
          </Badge>
        )}
      </p>
    </>
  );
}
