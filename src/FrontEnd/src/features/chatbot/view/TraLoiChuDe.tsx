import { useTranslation } from 'react-i18next';
import type { CauTraLoi } from '../api/troLy';
import { DanhSachThuTuc } from './DanhSachThuTuc';
import { NoiNop } from './NoiNop';
import styles from './view.module.css';

/** Bấm một chủ đề gợi ý (BR-11): tổng số thủ tục của lĩnh vực, tối đa 10 thủ tục, nơi nộp theo BR-3. */
export function TraLoiChuDe({ cau }: { cau: Extract<CauTraLoi, { loai: 'chu-de' }> }) {
  const { t } = useTranslation('chatbot');
  if (cau.tong === 0 || cau.danhSachThuTuc.length === 0) {
    return <p className={styles.doan}>{t('chu-de.rong')}</p>;
  }
  const so = cau.danhSachThuTuc.length;
  return (
    <>
      <p className={styles.doan}>{t('chu-de.tieu-de', { ten: cau.chuDe.linhVuc, tong: cau.tong })}</p>
      <DanhSachThuTuc cacThuTuc={cau.danhSachThuTuc} />
      {cau.tong > so && <p className={styles.phu}>{t('chu-de.hien-thi', { so, tong: cau.tong })}</p>}
      <NoiNop quay={cau.quay} noiTiepNhanChuyen={cau.noiTiepNhanChuyen} trungTam={cau.trungTam} linhVuc={cau.chuDe.linhVuc} />
      <p className={styles.doan}>{t('chu-de.goi-y-ten')}</p>
    </>
  );
}
