import { Building2, CreditCard, ExternalLink, Landmark, Search, Star, Ticket, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BieuTuongODichVu } from '../../core/api/trungTam';
import type { MauO } from '../../core/components/Tile';

interface KieuO {
  icon: LucideIcon;
  mau: MauO;
}

/**
 * Icon và màu theo khoá `bieuTuong` của dữ liệu (không theo vị trí, để đổi thứ tự hay thêm ô không đổi màu).
 * `Record` buộc tsc báo lỗi khi union ở `core/api/trungTam.ts` thêm khoá. Khoá khai ở 3 nơi: `MauExcel.cs` (F01), union, bảng này.
 */
const KIEU_O: Record<BieuTuongODichVu, KieuO> = {
  'boc-so': { icon: Ticket, mau: 'indigo' },
  'danh-gia': { icon: Star, mau: 'pink' },
  'tra-cuu-ho-so': { icon: Search, mau: 'teal' },
  'thanh-toan': { icon: CreditCard, mau: 'orange' },
  'cong-dvc': { icon: Landmark, mau: 'blue' },
  'cong-thong-tin': { icon: Building2, mau: 'navy' },
  'lien-ket': { icon: ExternalLink, mau: 'blue' },
};

/** Khoá lạ lúc chạy (BE thêm khoá mà FE chưa cập nhật) → dùng kiểu "liên kết", không ném lỗi. */
export function bieuTuongCuaO(khoa: string): { bieuTuong: ReactNode; mau: MauO } {
  const { icon: Icon, mau } = Object.hasOwn(KIEU_O, khoa) ? KIEU_O[khoa as BieuTuongODichVu] : KIEU_O['lien-ket'];
  return { bieuTuong: <Icon size={20} aria-hidden="true" />, mau };
}
