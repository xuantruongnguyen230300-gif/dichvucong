import { MessageSquare } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FloatingButton } from '../../core/components/FloatingButton';
import { ID_KHUNG_TRO_LY } from './idKhung';
import { napKhungTroLy, type ThanhPhanKhung } from './napKhung';

/**
 * Vỏ nút "Trợ lý" (F06 plan §5.1): nằm trong bundle chính nên chỉ gồm nút, hàm nạp và điều khiển mở/đóng.
 * Khung chat, `api/troLy`, câu chữ `chatbot` nạp lười ở lần bấm đầu. Khung giữ nguyên khi đóng (hội thoại còn, BR-13).
 * Không có hàm "bắt đầu lại" từ ngoài: F09 làm "Bắt đầu lại" bằng tải lại trang nên hội thoại mất theo.
 * Nút nằm ngoài khung nên không bị `inert` khi popup mở; khung nằm cùng cây (không portal) ngay sau nút.
 */
export function NutTroLy() {
  const { t } = useTranslation();
  const nut = useRef<HTMLButtonElement>(null);
  const [mo, datMo] = useState(false);
  const [Khung, datKhung] = useState<ThanhPhanKhung | null>(null);

  // Chỉ nạp mã, không gọi API. Lỗi mạng: lần bấm sau thử lại.
  const napTruoc = () => {
    void napKhungTroLy().catch(() => undefined);
  };

  const dong = () => {
    datMo(false);
    nut.current?.focus();
  };

  const bam = () => {
    if (mo) {
      dong();
      return;
    }
    datMo(true);
    if (Khung) return;
    napKhungTroLy().then(
      (K) => datKhung(() => K),
      () => datMo(false), // nạp lỗi: nút còn nguyên, bấm lần nữa thử lại
    );
  };

  return (
    <>
      <FloatingButton
        ref={nut}
        viTri="phai"
        bieuTuong={<MessageSquare size={20} />}
        dangMo={mo}
        dieuKhien={ID_KHUNG_TRO_LY}
        onClick={bam}
        onPointerDown={napTruoc}
        onFocus={napTruoc}
      >
        {t('tro-ly.nut')}
      </FloatingButton>
      {Khung && <Khung mo={mo} onDong={dong} />}
    </>
  );
}
