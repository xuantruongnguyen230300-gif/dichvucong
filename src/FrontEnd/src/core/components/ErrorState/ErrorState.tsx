import { CircleAlert, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../api/http';
import { khoaLoi } from '../../api/loi';
import { taoLinkDienThoai } from '../../utils/lienKet';
import { Button } from '../Button';
import { useLienHe } from '../LienHe';
import styles from './ErrorState.module.css';

export interface ErrorStateProps {
  loi: unknown;
  onThuLai: () => void;
}

/**
 * Lỗi tải dữ liệu (BR-11, F00 BR-6/BR-7): câu theo loại lỗi, nút "Thử lại", số điện thoại Trung tâm bấm được.
 * Không bao giờ hiện mã HTTP, title, detail. Mã tra cứu chỉ hiện với lỗi hệ thống.
 */
export function ErrorState({ loi, onThuLai }: ErrorStateProps) {
  const { t } = useTranslation('common');
  const { soDienThoai } = useLienHe();
  const linkGoi = soDienThoai ? taoLinkDienThoai(soDienThoai) : null;
  const maTraCuu = loi instanceof ApiError && loi.code === 'loi-he-thong' ? loi.maTraCuu : null;

  return (
    <div role="alert" className={styles.khung}>
      <CircleAlert size={28} aria-hidden="true" className={styles.bieuTuong} />
      <p className={styles.tieuDe}>{t('loi-tai.tieu-de')}</p>
      <p className={styles.noiDung}>{t(khoaLoi(loi))}</p>
      {maTraCuu && <p className={styles.ma}>{t('loi-tai.ma-tra-cuu', { ma: maTraCuu })}</p>}
      <Button bieuTuong={<RefreshCw size={16} aria-hidden="true" />} onClick={onThuLai}>
        {t('nut.thu-lai')}
      </Button>
      {linkGoi && (
        <p className={styles.noiDung}>
          {t('loi-tai.goi')} <a href={linkGoi}>{soDienThoai}</a>
        </p>
      )}
    </div>
  );
}
