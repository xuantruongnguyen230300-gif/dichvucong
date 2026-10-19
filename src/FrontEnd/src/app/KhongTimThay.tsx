import { useTranslation } from 'react-i18next';
import { Button } from '../core/components/Button';
import { DUONG_DAN } from '../core/duongDan';
import styles from './KhongTimThay.module.css';

/**
 * Trang 404 (BR-10): địa chỉ không tồn tại vẫn mở như mọi trang, có đủ đầu trang, điều hướng, chân trang.
 * Đi tới trang khác nên là liên kết (nút trình bày dạng liên kết), không phải `<button>`.
 * Không nhắc lại, không hiện chữ lấy từ địa chỉ.
 */
export function KhongTimThay() {
  const { t } = useTranslation();
  return (
    <section className={styles.trang}>
      <h1 className={styles.tieuDe}>{t('trang.khong-tim-thay.ten')}</h1>
      <div className={styles.hanhDong}>
        <Button to={DUONG_DAN.trangChu} bienThe="primary">
          {t('nut.ve-trang-chu')}
        </Button>
        <Button to={DUONG_DAN.danhMuc} bienThe="secondary">
          {t('trang.danh-muc.ten')}
        </Button>
      </div>
    </section>
  );
}
