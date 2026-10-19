import { useRouteError } from 'react-router';
import { ErrorState } from '../../core/components/ErrorState';
import { LienHeTuTrungTam } from './LienHeTuTrungTam';
import styles from './LoiTrang.module.css';

/**
 * Thay trang lỗi mặc định của React Router (nó in thông điệp lỗi, trái F00 BR-3). Đặt ở route gốc và từng route con:
 * lỗi của một trang chỉ thay vùng nội dung, khung trang vẫn còn. "Thử lại" = tải lại trang, vì lỗi nạp chunk
 * sau khi triển khai bản mới chỉ hết khi tải lại.
 */
export function LoiTrang() {
  const loi = useRouteError();
  return (
    <LienHeTuTrungTam>
      <div className={styles.khung}>
        <ErrorState loi={loi} onThuLai={() => window.location.reload()} />
      </div>
    </LienHeTuTrungTam>
  );
}
