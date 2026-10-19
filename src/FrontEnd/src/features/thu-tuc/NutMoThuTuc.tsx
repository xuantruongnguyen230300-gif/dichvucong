import { useTranslation } from 'react-i18next';
import { Button } from '../../core/components/Button';
import { useNapTruocChiTiet } from './api/chiTietThuTuc';
import { napTruocPopupChiTiet } from './ThuTucPopup';
import { useMoThuTuc } from './useMoThuTuc';

interface NutMoThuTucProps {
  ma: string;
  ten: string;
  /** 'the': nút "Xem chi tiết"; 'bang': tên thủ tục trông như liên kết. */
  dang: 'the' | 'bang';
}

/**
 * Nút mở popup chi tiết (thẻ và dòng bảng). Nhấn xuống hoặc nhận focus thì nạp trước chunk popup và chi tiết,
 * nên khi popup mở dữ liệu đã đang về (F03 plan 5). Rê chuột vào chỉ nạp trước chunk popup, chưa gọi API chi tiết.
 */
export function NutMoThuTuc({ ma, ten, dang }: NutMoThuTucProps) {
  const { t } = useTranslation('thu-tuc');
  const { mo } = useMoThuTuc();
  const napTruoc = useNapTruocChiTiet();
  const laThe = dang === 'the';
  // Chunk popup (nhẹ, dùng chung cho mọi nút) nạp từ lúc con trỏ vào; chi tiết thủ tục chỉ nạp khi nhấn/nhận focus
  const napTruocPopup = () => {
    void napTruocPopupChiTiet().catch(() => undefined); // lỗi mạng: popup sẽ tự nạp lại khi mở
  };
  const napTruocTatCa = () => {
    napTruocPopup();
    napTruoc(ma);
  };
  return (
    <Button
      bienThe={laThe ? 'secondary' : 'lien-ket'}
      // Tên đọc bắt đầu bằng chữ nhìn thấy (WCAG 2.5.3) và nói rõ thủ tục nào
      aria-label={laThe ? t('the.xem-chi-tiet-ten', { ten }) : undefined}
      onClick={() => mo(ma)}
      onPointerDown={napTruocTatCa}
      onFocus={napTruocTatCa}
      onPointerEnter={napTruocPopup}
    >
      {laThe ? t('the.xem-chi-tiet') : ten}
    </Button>
  );
}
