import { useTranslation } from 'react-i18next';
import { Button } from '../../../core/components/Button';
import { ExternalLink } from '../../../core/components/ExternalLink';
import { VisuallyHidden } from '../../../core/components/VisuallyHidden';
import { useNapTruocChiTiet } from '../../thu-tuc/api/chiTietThuTuc';
import { linkDvc } from '../../thu-tuc/linkDvc';
import { napTruocPopupChiTiet } from '../../thu-tuc/ThuTucPopup';
import { useMoThuTucTuKhung } from './moThuTucContext';
import styles from './view.module.css';

interface CapNutThuTucProps {
  ma: string;
  ten: string;
}

/**
 * Mỗi thủ tục nhắc tới trong câu trả lời có một cặp nút (BR-6): "Xem chi tiết" mở popup F03 (địa chỉ có `?ma=`,
 * khung và hội thoại giữ nguyên) và "Xem và nộp trên Cổng DVC" mở tab mới (`linkDvc`).
 * Nhấn xuống hoặc nhận con trỏ thì nạp trước chunk popup và chi tiết thủ tục, như nút của F03.
 */
export function CapNutThuTuc({ ma, ten }: CapNutThuTucProps) {
  const { t } = useTranslation('chatbot');
  const mo = useMoThuTucTuKhung();
  const napTruoc = useNapTruocChiTiet();
  const napTruocTatCa = () => {
    void napTruocPopupChiTiet().catch(() => undefined); // lỗi mạng: popup tự nạp lại khi mở
    napTruoc(ma);
  };
  return (
    <div className={styles.capNut}>
      <Button
        bienThe="secondary"
        aria-label={t('thu-tuc.xem-chi-tiet-ten', { ten })}
        onClick={() => mo(ma)}
        onPointerDown={napTruocTatCa}
        onFocus={napTruocTatCa}
      >
        {t('thu-tuc.xem-chi-tiet')}
      </Button>
      <ExternalLink href={linkDvc(ma)} bienThe="nut-accent">
        {t('thu-tuc.cong-dvc')}
        <VisuallyHidden>{t('thu-tuc.cong-dvc-ten-an', { ten })}</VisuallyHidden>
      </ExternalLink>
    </div>
  );
}
