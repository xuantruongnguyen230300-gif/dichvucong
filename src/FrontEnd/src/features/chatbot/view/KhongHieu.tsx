import { useTranslation } from 'react-i18next';
import type { LienHeTroLy } from '../api/troLy';
import { NutLienHe } from './NutLienHe';
import styles from './view.module.css';

/** Không trả lời được (BR-1 bước 5): câu xin lỗi + nút gọi Trung tâm, nút Zalo khi có (BR-10). */
export function KhongHieu({ lienHe }: { lienHe: LienHeTroLy | null }) {
  const { t } = useTranslation('chatbot');
  return (
    <>
      <p className={styles.doan}>{t('khong-hieu.xin-loi')}</p>
      <NutLienHe lienHe={lienHe} />
    </>
  );
}
