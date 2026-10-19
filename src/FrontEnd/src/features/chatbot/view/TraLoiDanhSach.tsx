import { useTranslation } from 'react-i18next';
import type { CauTraLoi } from '../api/troLy';
import { DanhSachThuTuc } from './DanhSachThuTuc';
import styles from './view.module.css';

/** Chỉ tìm được thủ tục (BR-1 bước 4): tối đa 5 thủ tục, sát nhất ở trên cùng. */
export function TraLoiDanhSach({ cau }: { cau: Extract<CauTraLoi, { loai: 'thu-tuc-danh-sach' }> }) {
  const { t } = useTranslation('chatbot');
  return (
    <>
      <p className={styles.doan}>{t('thu-tuc.danh-sach', { so: cau.danhSachThuTuc.length })}</p>
      <DanhSachThuTuc cacThuTuc={cau.danhSachThuTuc} />
    </>
  );
}
