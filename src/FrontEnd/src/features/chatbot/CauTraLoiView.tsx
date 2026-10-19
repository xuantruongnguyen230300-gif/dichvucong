import type { CauTraLoi } from './api/troLy';
import { KhongHieu } from './view/KhongHieu';
import { TraLoiCauHoiMau } from './view/TraLoiCauHoiMau';
import { TraLoiChuDe } from './view/TraLoiChuDe';
import { TraLoiDanhSach } from './view/TraLoiDanhSach';
import { TraLoiQuay } from './view/TraLoiQuay';
import { TraLoiThuTuc } from './view/TraLoiThuTuc';
import { TraLoiTrungTam } from './view/TraLoiTrungTam';

interface CauTraLoiViewProps {
  cau: CauTraLoi;
  /** Thời điểm đáp án đến (ms): giờ làm việc là ảnh chụp lúc hỏi. */
  luc: number;
}

/**
 * Một đáp án của máy chủ thành giao diện (7 loại). Mọi chữ lấy từ câu chữ `chatbot` hoặc từ dữ liệu, dựng bằng phần tử React —
 * không HTML từ máy chủ, không `dangerouslySetInnerHTML`.
 */
export function CauTraLoiView({ cau, luc }: CauTraLoiViewProps) {
  switch (cau.loai) {
    case 'thu-tuc':
      return <TraLoiThuTuc cau={cau} />;
    case 'thu-tuc-danh-sach':
      return <TraLoiDanhSach cau={cau} />;
    case 'chu-de':
      return <TraLoiChuDe cau={cau} />;
    case 'cau-hoi-mau':
      return <TraLoiCauHoiMau cau={cau} />;
    case 'trung-tam':
      return <TraLoiTrungTam cau={cau} luc={luc} />;
    case 'quay':
      return <TraLoiQuay cau={cau} />;
    case 'khong-hieu':
      return <KhongHieu lienHe={cau.lienHe} />;
  }
}
