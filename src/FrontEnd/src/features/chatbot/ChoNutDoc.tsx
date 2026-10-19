import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../core/components/IconButton';
import { useDoCauTraLoi } from './useDoCauTraLoi';

/**
 * Nút bật/tắt đọc câu trả lời (F07), nằm trong đầu khung giữa tên và nút đóng. Tên nút cố định, trạng thái ở `aria-pressed`
 * (WCAG 4.1.2); hai icon khác hình để trạng thái không chỉ dựa vào màu (1.4.1). Trình duyệt không hỗ trợ hoặc máy không có
 * giọng tiếng Việt chạy trên máy → không hiện nút (BR-2).
 */
export function ChoNutDoc() {
  const { t } = useTranslation('chatbot');
  const { coNut, dangBat, chuyen } = useDoCauTraLoi();
  if (!coNut) return null;

  return (
    <IconButton
      nhan={t('doc.nhan')}
      bieuTuong={dangBat ? <Volume2 size={18} /> : <VolumeX size={18} />}
      bienThe="tren-nen-dam"
      dangBat={dangBat}
      onClick={chuyen}
    />
  );
}
