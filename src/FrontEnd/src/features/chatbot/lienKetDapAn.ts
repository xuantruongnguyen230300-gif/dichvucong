import { laLienKetCongDvc } from '../../core/kiosk/laLienKetCongDvc';
import { linkDvc } from '../thu-tuc/linkDvc';
import type { CauTraLoi } from './api/troLy';

/** Các liên kết ngoài mà một đáp án có thể chứa (để biết hội thoại đã có liên kết tới Cổng DVC chưa — F09 BR-4). */
export function cacLienKetCuaDapAn(cau: CauTraLoi): string[] {
  switch (cau.loai) {
    case 'thu-tuc':
      return [cau.thuTuc, ...cau.thuTucKhac].map((t) => linkDvc(t.ma));
    case 'thu-tuc-danh-sach':
    case 'chu-de':
    case 'cau-hoi-mau':
      return cau.danhSachThuTuc.map((t) => linkDvc(t.ma));
    case 'trung-tam':
      return cau.thongTin.lienKet ? [cau.thongTin.lienKet.url] : [];
    case 'quay':
    case 'khong-hieu':
      return [];
  }
}

/** Liên kết đầu tiên của đáp án thuộc Cổng DVC quốc gia; không có thì `null`. */
export function lienKetCongDvcDauTien(cau: CauTraLoi): string | null {
  return cacLienKetCuaDapAn(cau).find(laLienKetCongDvc) ?? null;
}
