import type { ThuTucRutGon } from '../../core/api/danhMucThuTuc';
import { type DuLieuDanhMuc, taoLinhVucTuThuTuc, taoThuTuc } from '../../test-utils/danhMucMau';
import type { MucThuTuc } from './types';

/** Dữ liệu thử cho khối thường gặp và danh sách (không phải dữ liệu thật của Cần Giuộc). */

const TEN_LINH_VUC: Record<string, string> = {
  'ho-tich': 'Hộ tịch',
  'dat-dai': 'Đất đai',
  'thuy-loi': 'Thuỷ lợi',
  'tu-phap': 'Tư pháp',
};

function dungDuLieu(thuTuc: ThuTucRutGon[]): DuLieuDanhMuc {
  return { thuTuc, linhVuc: taoLinhVucTuThuTuc(thuTuc, TEN_LINH_VUC) };
}

/**
 * 43 thủ tục thường gặp (thứ tự 1…43) cộng hai thủ tục KHÔNG thường gặp (phải bị loại):
 * - 1 kết hôn (1.000894), 2 khai sinh (1.001193), 3–4 Đất đai có "thế chấp", 5 Thuỷ lợi có "thế chấp"
 * - 6…43 là "Thủ tục thường gặp số N", lĩnh vực xoay vòng Hộ tịch / Đất đai / Thuỷ lợi
 * - thêm: "khai sinh lại" (Hộ tịch) và một thủ tục Tư pháp, đều không thường gặp
 * Dữ liệu cố ý xếp lộn thứ tự để kiểm việc sắp theo `thuTuThuongGap`.
 */
export function taoBo43(): DuLieuDanhMuc {
  const thuongGap = [
    taoThuTuc({ ma: '1.000894', ten: 'Thủ tục đăng ký kết hôn', linhVucMa: 'ho-tich', thuTuThuongGap: 1 }),
    taoThuTuc({ ma: '1.001193', ten: 'Thủ tục đăng ký khai sinh', linhVucMa: 'ho-tich', thuTuThuongGap: 2 }),
    taoThuTuc({ ma: '1.005132', ten: 'Thủ tục đăng ký thế chấp quyền sử dụng đất', linhVucMa: 'dat-dai', thuTuThuongGap: 3 }),
    taoThuTuc({ ma: '1.005133', ten: 'Thủ tục xoá đăng ký thế chấp quyền sử dụng đất', linhVucMa: 'dat-dai', thuTuThuongGap: 4 }),
    taoThuTuc({ ma: '1.009001', ten: 'Thủ tục thế chấp tài sản của hộ gia đình', linhVucMa: 'thuy-loi', thuTuThuongGap: 5 }),
    ...Array.from({ length: 38 }, (_, i) => {
      const n = i + 6;
      const linhVucMa = n % 3 === 0 ? 'thuy-loi' : n % 3 === 1 ? 'ho-tich' : 'dat-dai';
      return taoThuTuc({
        ma: `1.01${String(n).padStart(4, '0')}`,
        ten: `Thủ tục thường gặp số ${n}`,
        linhVucMa,
        thuTuThuongGap: n,
      });
    }),
  ];
  const khac = [
    taoThuTuc({ ma: '1.020001', ten: 'Thủ tục đăng ký khai sinh lại', linhVucMa: 'ho-tich', thuTuThuongGap: null }),
    taoThuTuc({ ma: '1.020002', ten: 'Thủ tục chứng thực bản sao', linhVucMa: 'tu-phap', thuTuThuongGap: null }),
  ];
  // Xếp lộn: phần "không thường gặp" lẫn vào đầu, phần thường gặp đảo ngược
  return dungDuLieu([khac[0]!, ...[...thuongGap].reverse(), khac[1]!]);
}

/** Bản đầu: 16 mục thường gặp thuộc ba lĩnh vực (Hộ tịch 6, Đất đai 6, Thuỷ lợi 4). */
export function taoBo16(): DuLieuDanhMuc {
  const thuTuc = Array.from({ length: 16 }, (_, i) => {
    const n = i + 1;
    const linhVucMa = n <= 6 ? 'ho-tich' : n <= 12 ? 'dat-dai' : 'thuy-loi';
    return taoThuTuc({ ma: `1.03${String(n).padStart(4, '0')}`, ten: `Thủ tục bản đầu số ${n}`, linhVucMa, thuTuThuongGap: n });
  });
  return dungDuLieu(thuTuc);
}

/** Danh mục có thủ tục nhưng chưa thủ tục nào thuộc nhóm thường gặp. */
export function taoBoKhongThuongGap(): DuLieuDanhMuc {
  return dungDuLieu([
    taoThuTuc({ ma: '1.020001', ten: 'Thủ tục đăng ký khai sinh lại', linhVucMa: 'ho-tich', thuTuThuongGap: null }),
    taoThuTuc({ ma: '1.020002', ten: 'Thủ tục chứng thực bản sao', linhVucMa: 'tu-phap', thuTuThuongGap: null }),
  ]);
}

/** Một mục cho thẻ/bảng (kiểu `MucThuTuc`). */
export function taoMuc(tuyChon: Partial<MucThuTuc> = {}): MucThuTuc {
  return {
    ma: '1.001193',
    ten: 'Thủ tục đăng ký khai sinh',
    linhVucMa: 'ho-tich',
    linhVuc: 'Hộ tịch',
    mucDo: 'toan-trinh',
    coQuanThucHien: 'Ủy ban nhân dân cấp xã',
    thoiHan: '5 ngày làm việc',
    thuTuThuongGap: 1,
    ...tuyChon,
  };
}
