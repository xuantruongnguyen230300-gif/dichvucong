import { useTranslation } from 'react-i18next';
import type { CanBo, CauTraLoi } from '../api/troLy';
import { coChu } from './chu';
import { NoiNop } from './NoiNop';
import styles from './view.module.css';

type DapAnQuay = Extract<CauTraLoi, { loai: 'quay' }>;

/**
 * Hỏi quầy hoặc cán bộ phụ trách (BR-1 bước 1, BR-3). Không đoán: `quay` null thì chỉ "nộp hồ sơ tại Trung tâm", không số quầy,
 * không tên cán bộ nào (kể cả khi máy chủ gửi nhầm danh sách cán bộ). Chưa gắn lĩnh vực: nhắc nêu lĩnh vực hoặc tên thủ tục.
 */
export function TraLoiQuay({ cau }: { cau: DapAnQuay }) {
  const { t } = useTranslation('chatbot');
  const linhVuc = coChu(cau.linhVuc) ? cau.linhVuc : null;

  if (cau.quay === null) {
    return (
      <>
        <NoiNop quay={null} noiTiepNhanChuyen={null} trungTam={cau.trungTam} linhVuc={linhVuc} />
        {linhVuc === null && <p className={styles.doan}>{t('quay.nhac-neu-linh-vuc')}</p>}
      </>
    );
  }
  return (
    <>
      <NoiNop quay={cau.quay} noiTiepNhanChuyen={cau.noiTiepNhanChuyen} trungTam={cau.trungTam} linhVuc={linhVuc} />
      {cau.muc === 'can-bo' &&
        (cau.canBo.length === 0 ? (
          <p className={styles.doan}>{t('quay.chua-co-can-bo')}</p>
        ) : (
          <>
            <p className={styles.doan}>{t('quay.can-bo-tieu-de')}</p>
            <ul className={styles.danhSach} role="list">
              {cau.canBo.map((cb, i) => (
                <li key={i}>
                  <CanBoView canBo={cb} />
                </li>
              ))}
            </ul>
            {cau.tong > cau.canBo.length && (
              <p className={styles.phu}>{t('quay.con-can-bo', { so: cau.tong - cau.canBo.length })}</p>
            )}
          </>
        ))}
    </>
  );
}

function CanBoView({ canBo }: { canBo: CanBo }) {
  const { t } = useTranslation('chatbot');
  const ten = coChu(canBo.xungHo) ? t('quay.can-bo-ten', { xungHo: canBo.xungHo, hoTen: canBo.hoTen }) : canBo.hoTen;
  return (
    <>
      <strong>{ten}</strong>
      {coChu(canBo.chucVu) && <span> {t('quay.can-bo-chuc-vu', { chucVu: canBo.chucVu })}</span>}
      {canBo.quay !== null && <span> – {t('quay.can-bo-quay', { quay: canBo.quay })}</span>}
      {coChu(canBo.moTa) && <span className={styles.chuDai}>{canBo.moTa}</span>}
    </>
  );
}
