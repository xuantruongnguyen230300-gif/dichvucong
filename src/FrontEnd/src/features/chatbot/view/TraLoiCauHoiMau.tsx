import { useTranslation } from 'react-i18next';
import type { CauTraLoi } from '../api/troLy';
import { DanhSachThuTuc } from './DanhSachThuTuc';
import styles from './view.module.css';

/** Câu trả lời mẫu (BR-1 bước 2): chữ thuần, giữ xuống dòng bằng CSS (không HTML). */
export function TraLoiCauHoiMau({ cau }: { cau: Extract<CauTraLoi, { loai: 'cau-hoi-mau' }> }) {
  const { t } = useTranslation('chatbot');
  return (
    <>
      <p className={styles.chuDai}>{cau.traLoi}</p>
      {cau.danhSachThuTuc.length > 0 && (
        <>
          <p className={styles.doan}>{t('thu-tuc.lien-quan')}</p>
          <DanhSachThuTuc cacThuTuc={cau.danhSachThuTuc} />
        </>
      )}
    </>
  );
}
