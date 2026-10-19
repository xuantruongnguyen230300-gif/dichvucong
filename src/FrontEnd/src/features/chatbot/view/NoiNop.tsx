import { useTranslation } from 'react-i18next';
import type { TrungTamNgan } from '../api/troLy';
import styles from './view.module.css';

interface NoiNopProps {
  quay: number | null;
  noiTiepNhanChuyen: string | null;
  trungTam: TrungTamNgan | null;
  /** Tên lĩnh vực nếu câu hỏi nêu được lĩnh vực. */
  linhVuc?: string | null;
}

/**
 * Nơi nộp hồ sơ theo BR-3: chỉ khi `quay` có giá trị (dữ liệu thật) mới nêu "quầy N"; không thì "nộp tại <Trung tâm>, địa chỉ …"
 * hoặc "nộp tại Trung tâm". Không đoán quầy, không đoán cán bộ.
 */
export function NoiNop({ quay, noiTiepNhanChuyen, trungTam, linhVuc = null }: NoiNopProps) {
  const { t } = useTranslation('chatbot');
  const lv = linhVuc !== null && linhVuc.trim() !== '' ? linhVuc : null;

  if (quay !== null) {
    return (
      <>
        <p className={styles.doan}>
          {lv ? t('quay.nop-tai-quay-linh-vuc', { linhVuc: lv, quay }) : t('quay.nop-tai-quay', { quay })}
        </p>
        {noiTiepNhanChuyen && <p className={styles.doan}>{t('quay.noi-tiep-nhan-chuyen', { noi: noiTiepNhanChuyen })}</p>}
      </>
    );
  }
  if (trungTam) {
    return (
      <p className={styles.doan}>
        {lv
          ? t('quay.nop-tai-trung-tam-linh-vuc', { linhVuc: lv, ten: trungTam.ten, diaChi: trungTam.diaChi })
          : t('quay.nop-tai-trung-tam', { ten: trungTam.ten, diaChi: trungTam.diaChi })}
      </p>
    );
  }
  return (
    <p className={styles.doan}>
      {lv ? t('quay.nop-tai-trung-tam-chung-linh-vuc', { linhVuc: lv }) : t('quay.nop-tai-trung-tam-chung')}
    </p>
  );
}
