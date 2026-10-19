import { boDau } from './chung';
import { dungLinhVuc, tt, type LinhVucThu, type MucDoThu, type ThuTucRutGonThu } from './thuong-gap';

/** Dữ liệu thử của F04: bộ N (nhỏ, kiểm soát), N60, N1000, N0, NX — tên giả (trừ 1.001193 mà AC nêu đích danh). */

export const TEN_LINH_VUC_N: Record<string, string> = {
  'ho-tich': 'Hộ tịch',
  'dat-dai': 'Đất đai',
  'chung-thuc': 'Chứng thực',
  'linh-vuc-chi-xa': 'Lĩnh vực chỉ cấp xã thử',
};

const mp: MucDoThu = 'mot-phan';
const toan: MucDoThu = 'toan-trinh';

function m(ma: string, ten: string, lv: string, mucDo: MucDoThu, xa: boolean, tinh: boolean, thuTu: number): ThuTucRutGonThu {
  return tt(ma, ten, lv, { mucDo, capXa: xa, capTinh: tinh, thuTuThuongGap: thuTu > 0 ? thuTu : null });
}

/** Bộ N: tab Cấp xã 16, tab Cấp tỉnh 20, 4 lĩnh vực. */
export function boN(): ThuTucRutGonThu[] {
  return [
    m('1.001193', 'Thủ tục đăng ký khai sinh', 'ho-tich', toan, true, true, 1),
    m('9.101', 'Đăng ký khai sinh lưu động thử', 'ho-tich', toan, true, true, 0),
    m('9.102', 'Đăng ký khai sinh có yếu tố nước ngoài thử', 'ho-tich', mp, true, true, 0),
    m('9.103', 'Thủ tục đăng ký kết hôn thử', 'ho-tich', toan, true, true, 0),
    m('9.104', 'Thủ tục thử khai tử', 'ho-tich', toan, true, true, 0),
    m('9.105', 'Đăng ký giám hộ thử', 'ho-tich', mp, true, true, 0),
    m('9.106', 'Cấp trích lục hộ tịch thử', 'ho-tich', toan, true, true, 0),
    m('9.107', 'Thay đổi hộ tịch thử', 'ho-tich', mp, true, true, 0),
    m('9.201', 'Đăng ký thế chấp', 'dat-dai', mp, false, true, 0),
    m('9.202', 'Xoá đăng ký thế chấp thử', 'dat-dai', mp, false, true, 0),
    m('9.203', 'Đăng ký thế chấp tài sản thử', 'dat-dai', toan, false, true, 0),
    m('9.204', 'Tách thửa thử', 'dat-dai', mp, false, true, 0),
    m('9.205', 'Hợp thửa thử', 'dat-dai', mp, false, true, 0),
    m('9.206', 'Cấp đổi giấy chứng nhận thử', 'dat-dai', toan, false, true, 0),
    m('9.207', 'Hoà giải tranh chấp đất đai thử', 'dat-dai', mp, true, true, 0),
    m('9.208', 'Đăng ký đất đai lần đầu thử', 'dat-dai', toan, true, true, 0),
    m('9.301', 'Chứng thực chữ ký thử', 'chung-thuc', toan, true, true, 0),
    m('9.302', 'Chứng thực bản sao thử', 'chung-thuc', toan, true, true, 0),
    m('9.303', 'Chứng thực hợp đồng thử', 'chung-thuc', mp, true, true, 0),
    m('9.304', 'Chứng thực di chúc thử', 'chung-thuc', mp, true, true, 0),
    m('9.401', 'Thủ tục thử chỉ cấp xã một', 'linh-vuc-chi-xa', toan, true, false, 0),
    m('9.402', 'Thủ tục thử chỉ cấp xã hai', 'linh-vuc-chi-xa', mp, true, false, 0),
  ];
}

/** Bộ N60: đúng 60 thủ tục Hộ tịch ở cấp xã. */
export function boN60(): ThuTucRutGonThu[] {
  return Array.from({ length: 60 }, (_, i) => {
    const so = String(i + 1).padStart(2, '0');
    return tt(`9.60${so}`, `Thủ tục hộ tịch thử ${so}`, 'ho-tich', { capXa: true, capTinh: false });
  });
}

/** Bộ N1000: 1.000 thủ tục tên giả, nhiều từ để lọc có việc làm; cấp xã ~40%, cấp tỉnh 100%; 75 lĩnh vực. */
export function boN1000(): { thuTuc: ThuTucRutGonThu[]; linhVuc: LinhVucThu[] } {
  const tenLv: Record<string, string> = {};
  for (let i = 0; i < 75; i++) tenLv[`lv-${String(i).padStart(2, '0')}`] = `Lĩnh vực thử số ${String(i).padStart(2, '0')}`;
  const tu = ['đăng ký', 'khai sinh', 'cấp đổi', 'giấy phép', 'chứng thực', 'thế chấp', 'hộ kinh doanh', 'giải quyết', 'trợ cấp', 'xác nhận'];
  const thuTuc = Array.from({ length: 1000 }, (_, i) => {
    const ten = `${tu[i % 10]} ${tu[(i * 3 + 1) % 10]} ${tu[(i * 7 + 2) % 10]} thử ${i + 1}`;
    return tt(`G${String(i + 1).padStart(6, '0')}`, ten.charAt(0).toUpperCase() + ten.slice(1), `lv-${String(i % 75).padStart(2, '0')}`, {
      capXa: i % 5 < 2,
      capTinh: true,
      mucDo: i % 3 === 0 ? 'mot-phan' : 'toan-trinh',
    });
  });
  return { thuTuc, linhVuc: dungLinhVuc(thuTuc, tenLv) };
}

/** NX: HTML trong tên thủ tục, tên lĩnh vực. */
export function boNX(): { thuTuc: ThuTucRutGonThu[]; linhVuc: LinhVucThu[] } {
  const thuTuc = [tt('9.X01', 'Thử <b>đậm</b> & "trích"', 'lv-x', {})];
  const linhVuc: LinhVucThu[] = [{ ma: 'lv-x', ten: '<img src=x onerror=alert(1)>', tenTimKiem: boDau('<img src=x onerror=alert(1)>'), soThuTucXa: 1, soThuTucTinh: 1 }];
  return { thuTuc, linhVuc };
}

export { dungLinhVuc };
