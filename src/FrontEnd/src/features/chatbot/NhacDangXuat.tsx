import { NhacDangXuat as NhacDangXuatKiosk } from '../../core/kiosk/NhacDangXuat';
import styles from './KhungTroLy.module.css';

interface NhacDangXuatProps {
  /** Liên kết ngoài của hội thoại đáp ứng điều kiện (rỗng = chưa có liên kết nào tới Cổng DVC). */
  cacLienKet: readonly string[];
}

/**
 * Dòng nhắc "Nhớ đăng xuất khi dùng xong" của khung trợ lý (F09 BR-4): MỘT dòng cho cả khung, đặt giữa đầu khung và danh sách tin.
 * Lõi (`core/kiosk`) quyết định: chỉ ở kiosk, và chỉ khi có ít nhất một đích thuộc Cổng DVC.
 */
export function NhacDangXuat({ cacLienKet }: NhacDangXuatProps) {
  return <NhacDangXuatKiosk cacLienKet={cacLienKet} className={styles.nhacDangXuat} />;
}
