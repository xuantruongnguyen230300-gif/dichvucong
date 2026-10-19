import { useThongTinTrungTam } from '../../core/api/trungTam';
import { KhoiThuongGap } from '../thu-tuc/KhoiThuongGap';
import { BannerTrangChu } from './BannerTrangChu';
import { KhoiGioLamViec } from './KhoiGioLamViec';
import { KhuODichVu } from './KhuODichVu';
import styles from './TrangChu.module.css';

/**
 * Trang chủ `/` (F02): banner → ô dịch vụ nhanh → thủ tục thường gặp (F03) → giờ làm việc, theo thứ tự của design-system.
 * Gọi `useThongTinTrungTam()` một lần; cùng khoá với đầu và chân trang nên không thêm yêu cầu mạng.
 * Đầu, chân trang, tiêu đề tab, popup (`?ma=`) do `Layout` (F08, F03) lo.
 */
export function TrangChu() {
  const truyVan = useThongTinTrungTam();

  return (
    <div className={styles.trang}>
      <BannerTrangChu truyVan={truyVan} />
      <KhuODichVu truyVan={truyVan} />
      <KhoiThuongGap />
      <KhoiGioLamViec truyVan={truyVan} />
    </div>
  );
}
