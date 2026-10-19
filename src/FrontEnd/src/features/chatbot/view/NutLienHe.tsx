import { MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from '../../../core/components/ExternalLink';
import type { LienHeTroLy } from '../api/troLy';
import styles from './view.module.css';

/**
 * Nút gọi Trung tâm (`tel:`) luôn có khi có số; nút mở Zalo chỉ khi dữ liệu có Zalo OA (BR-10). Không có `lienHe` thì không vẽ gì.
 */
export function NutLienHe({ lienHe }: { lienHe: LienHeTroLy | null }) {
  const { t } = useTranslation('chatbot');
  if (!lienHe) return null;
  const coZalo = typeof lienHe.zaloOa === 'string' && lienHe.zaloOa.trim() !== '';
  return (
    <div className={styles.capNut}>
      <ExternalLink href={`tel:${lienHe.dienThoai}`} bienThe="nut-accent">
        <Phone size={14} aria-hidden="true" />
        {t('khong-hieu.goi')}
      </ExternalLink>
      {coZalo && (
        <ExternalLink href={lienHe.zaloOa} bienThe="nut-secondary">
          <MessageCircle size={14} aria-hidden="true" />
          {t('khong-hieu.zalo')}
        </ExternalLink>
      )}
    </div>
  );
}
