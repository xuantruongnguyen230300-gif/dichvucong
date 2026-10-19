import type { ReactNode } from 'react';
import { useCheDoKiosk } from '../../core/kiosk/useCheDoKiosk';
import styles from './KhungNhacKiosk.module.css';

/**
 * Chỗ một dòng cho dòng nhắc đăng xuất ở kiosk (F09 BR-4), ngay trên danh sách thủ tục. Dòng nhắc nằm trong chunk kiosk
 * nạp lười nên có thể về sau danh sách: giữ sẵn chỗ để danh sách không bị đẩy xuống (CLS). Khung chờ của danh sách dùng
 * khung này không có `children` để vị trí khớp với danh sách thật. Ngoài kiosk không vẽ gì.
 */
export function KhungNhacKiosk({ children }: { children?: ReactNode }) {
  const laKiosk = useCheDoKiosk();
  return laKiosk ? <div className={styles.giuCho}>{children}</div> : null;
}
