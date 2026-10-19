import { useTranslation } from 'react-i18next';
import { Badge } from '../../../core/components/Badge';
import { nhanMucDo } from '../../thu-tuc/mucDo';
import type { ThuTucNgan } from '../api/troLy';
import { CapNutThuTuc } from './CapNutThuTuc';
import styles from './view.module.css';

/** Danh sách thủ tục ngắn (đáp án danh sách, chủ đề, thủ tục khác, thủ tục liên quan): mỗi dòng một thủ tục kèm cặp nút (BR-6). */
export function DanhSachThuTuc({ cacThuTuc }: { cacThuTuc: readonly ThuTucNgan[] }) {
  const { t } = useTranslation('chatbot');
  const { t: tc } = useTranslation('common');
  return (
    <ul className={styles.danhSach} role="list">
      {cacThuTuc.map((tt) => {
        const cap = [tt.capXa && t('thu-tuc.cap.xa'), tt.capTinh && t('thu-tuc.cap.tinh')].filter(Boolean).join(', ');
        const mucDo = nhanMucDo(tc, tt.mucDo);
        return (
          <li key={tt.ma} className={styles.thuTuc}>
            <strong className={styles.tenThuTuc}>{tt.ten}</strong>
            <span className={styles.phu}>{t('thu-tuc.meta', { ma: tt.ma, cap, linhVuc: tt.linhVuc })}</span>
            {mucDo && (
              <span>
                <Badge loai={tt.mucDo === 'toan-trinh' ? 'success' : 'info'}>{mucDo}</Badge>
              </span>
            )}
            <CapNutThuTuc ma={tt.ma} ten={tt.ten} />
          </li>
        );
      })}
    </ul>
  );
}
