import { afterEach, describe, expect, it, vi } from 'vitest';
import { layDanhMucThuTuc, type ThuTucDanhMuc } from '../../core/api/danhMucThuTuc';
import { taoBoLocTuKhoa } from '../../core/utils/timKiem';
import {
  DANH_MUC_MAU,
  giaFetchDanhMuc,
  taoDanhMucLon,
  taoLinhVucTuThuTuc,
  taoThuTuc,
  type DuLieuDanhMuc,
} from '../../test-utils/danhMucMau';
import { docCap, docMucDo, locThuTuc, luaChonLinhVuc, soThuTucCuaCap, thuTucCuaCap, type BoLoc } from './loc';

afterEach(() => vi.unstubAllGlobals());

/** Nạp qua hook dữ liệu thật (fetch giả) để có `linhVuc` và `tim` đúng như màn hình. */
async function nap(duLieu: DuLieuDanhMuc) {
  giaFetchDanhMuc(duLieu);
  return layDanhMucThuTuc();
}

const boLoc = (rieng: Partial<Omit<BoLoc, 'boLocTuKhoa'>> & { tuKhoa?: string } = {}): BoLoc => {
  const { tuKhoa = '', ...con } = rieng;
  return { cap: 'xa', linhVucMa: '', mucDo: '', boLocTuKhoa: taoBoLocTuKhoa(tuKhoa), ...con };
};
const ten = (ds: readonly ThuTucDanhMuc[]) => ds.map((t) => t.ten);

describe('docCap, docMucDo', () => {
  it('chỉ "tinh" là cấp tỉnh; thiếu hoặc lạ là cấp xã', () => {
    expect(docCap('tinh')).toBe('tinh');
    expect(docCap('xa')).toBe('xa');
    expect(docCap('')).toBe('xa');
    expect(docCap('abc')).toBe('xa');
    expect(docCap('TINH')).toBe('xa');
  });

  it('chỉ "toan-trinh", "mot-phan" hợp lệ; còn lại là rỗng', () => {
    expect(docMucDo('toan-trinh')).toBe('toan-trinh');
    expect(docMucDo('mot-phan')).toBe('mot-phan');
    expect(docMucDo('abc')).toBe('');
    expect(docMucDo('')).toBe('');
    expect(docMucDo('Toan-Trinh')).toBe('');
  });
});

describe('locThuTuc', () => {
  it('AC-1: "ho tich" ra mọi thủ tục lĩnh vực Hộ tịch của cấp đang chọn', async () => {
    const { thuTuc } = await nap(DANH_MUC_MAU);
    expect(ten(locThuTuc(thuTuc, boLoc({ tuKhoa: 'ho tich' })))).toEqual([
      'Thủ tục đăng ký khai sinh',
      'Thủ tục đăng ký kết hôn',
      'Thủ tục đăng ký khai tử',
    ]);
    // Cấp tỉnh chỉ còn thủ tục cấp tỉnh của lĩnh vực đó
    expect(ten(locThuTuc(thuTuc, boLoc({ cap: 'tinh', tuKhoa: 'ho tich' })))).toEqual(['Thủ tục đăng ký khai tử']);
  });

  it('AC-12: gõ "1.001193" chỉ ra "Thủ tục đăng ký khai sinh"', async () => {
    const { thuTuc } = await nap(DANH_MUC_MAU);
    expect(ten(locThuTuc(thuTuc, boLoc({ tuKhoa: '1.001193' })))).toEqual(['Thủ tục đăng ký khai sinh']);
  });

  it('từ khoá nhiều từ không phụ thuộc thứ tự', async () => {
    const { thuTuc } = await nap(DANH_MUC_MAU);
    const a = locThuTuc(thuTuc, boLoc({ tuKhoa: 'khai sinh' }));
    const b = locThuTuc(thuTuc, boLoc({ tuKhoa: 'sinh khai' }));
    expect(ten(a)).toEqual(['Thủ tục đăng ký khai sinh']);
    expect(ten(b)).toEqual(ten(a));
  });

  it('"thuy" khớp cả "Thủy" lẫn "Thuỷ"', async () => {
    const thuTuc = [
      taoThuTuc({ ma: '1.000001', ten: 'Cấp phép thủy sản', linhVucMa: 'thuy-san', cap: 'xa' }),
      taoThuTuc({ ma: '1.000002', ten: 'Kiểm tra công trình thuỷ lợi', linhVucMa: 'thuy-loi', cap: 'xa' }),
      taoThuTuc({ ma: '1.000003', ten: 'Cấp giấy phép xây dựng', linhVucMa: 'xay-dung', cap: 'xa' }),
    ];
    const du = await nap({ thuTuc, linhVuc: taoLinhVucTuThuTuc(thuTuc) });
    expect(ten(locThuTuc(du.thuTuc, boLoc({ tuKhoa: 'thuy' })))).toEqual(['Cấp phép thủy sản', 'Kiểm tra công trình thuỷ lợi']);
    expect(ten(locThuTuc(du.thuTuc, boLoc({ tuKhoa: 'THỦY' })))).toHaveLength(2);
  });

  it('AC-2: từ khoá + lĩnh vực + mức độ lấy giao', async () => {
    const { thuTuc } = await nap(DANH_MUC_MAU);
    // Hộ tịch + Toàn trình, cấp xã: khai sinh và kết hôn (khai tử là "một phần")
    expect(ten(locThuTuc(thuTuc, boLoc({ linhVucMa: 'ho-tich', mucDo: 'toan-trinh' })))).toEqual([
      'Thủ tục đăng ký khai sinh',
      'Thủ tục đăng ký kết hôn',
    ]);
    expect(ten(locThuTuc(thuTuc, boLoc({ linhVucMa: 'ho-tich', mucDo: 'toan-trinh', tuKhoa: 'ket hon' })))).toEqual([
      'Thủ tục đăng ký kết hôn',
    ]);
    expect(locThuTuc(thuTuc, boLoc({ linhVucMa: 'dat-dai', mucDo: 'toan-trinh', tuKhoa: 'ket hon' }))).toEqual([]);
    expect(ten(locThuTuc(thuTuc, boLoc({ cap: 'tinh', linhVucMa: 'dat-dai', mucDo: 'mot-phan', tuKhoa: 'cap lai' })))).toEqual([
      'Thủ tục cấp lại giấy chứng nhận quyền sử dụng đất',
    ]);
  });

  it('chỉ giữ thủ tục thuộc cấp đang chọn; thủ tục cả hai cấp có ở cả hai', async () => {
    const { thuTuc } = await nap(DANH_MUC_MAU);
    const xa = locThuTuc(thuTuc, boLoc({ cap: 'xa' }));
    const tinh = locThuTuc(thuTuc, boLoc({ cap: 'tinh' }));
    expect(xa.every((t) => t.capXa)).toBe(true);
    expect(tinh.every((t) => t.capTinh)).toBe(true);
    expect(xa).toHaveLength(4);
    expect(tinh).toHaveLength(4);
    const khaiTu = 'Thủ tục đăng ký khai tử';
    expect(ten(xa)).toContain(khaiTu);
    expect(ten(tinh)).toContain(khaiTu);
    expect(ten(xa)).not.toContain('Thủ tục thẩm định kế hoạch tu bổ công trình thuỷ lợi');
  });

  it('giữ thứ tự của đầu vào, không chạm đầu vào', async () => {
    const { thuTuc } = await nap(DANH_MUC_MAU);
    const dao = [...thuTuc].reverse();
    const ban = [...dao];
    const kq = locThuTuc(dao, boLoc());
    expect(kq.map((t) => t.ma)).toEqual(dao.filter((t) => t.capXa).map((t) => t.ma));
    expect(dao).toEqual(ban);
  });

  it('không khớp gì → mảng rỗng', async () => {
    const { thuTuc } = await nap(DANH_MUC_MAU);
    expect(locThuTuc(thuTuc, boLoc({ tuKhoa: 'xyzxyz' }))).toEqual([]);
  });

  it('thuTucCuaCap tách theo cấp, giữ thứ tự', async () => {
    const { thuTuc } = await nap(DANH_MUC_MAU);
    expect(thuTucCuaCap(thuTuc, 'xa').map((t) => t.ma)).toEqual(thuTuc.filter((t) => t.capXa).map((t) => t.ma));
    expect(thuTucCuaCap(thuTuc, 'tinh').every((t) => t.capTinh)).toBe(true);
  });

  it('đo: lọc 1.000 mục với từ khoá 3 từ dưới 50 ms', async () => {
    const du = await nap(taoDanhMucLon(1000));
    const bo = boLoc({ cap: 'tinh', tuKhoa: 'thu tuc giai quyet' });
    locThuTuc(du.thuTuc, bo); // khởi động
    const dau = performance.now();
    const kq = locThuTuc(du.thuTuc, bo);
    const msec = performance.now() - dau;
    expect(kq.length).toBeGreaterThan(0);
    expect(msec).toBeLessThan(50);
  });
});

describe('luaChonLinhVuc', () => {
  it('chỉ lĩnh vực có thủ tục ở cấp đó, giữ thứ tự của API', () => {
    const lv = DANH_MUC_MAU.linhVuc;
    // Mẫu: Hộ tịch (xã 3, tỉnh 1), Đất đai (xã 1, tỉnh 2), Thuỷ lợi (xã 0, tỉnh 1)
    expect(luaChonLinhVuc(lv, 'xa', '').map((l) => l.ma)).toEqual(['dat-dai', 'ho-tich']);
    expect(luaChonLinhVuc(lv, 'tinh', '').map((l) => l.ma)).toEqual(['dat-dai', 'ho-tich', 'thuy-loi']);
    expect(soThuTucCuaCap(lv.find((l) => l.ma === 'ho-tich')!, 'xa')).toBe(3);
  });

  it('thêm lĩnh vực đang chọn nếu có trong dữ liệu mà cấp này 0 thủ tục', () => {
    const lv = DANH_MUC_MAU.linhVuc;
    expect(luaChonLinhVuc(lv, 'xa', 'thuy-loi').map((l) => l.ma)).toEqual(['dat-dai', 'ho-tich', 'thuy-loi']);
  });

  it('mã đang chọn không có trong dữ liệu thì không thêm gì', () => {
    const lv = DANH_MUC_MAU.linhVuc;
    expect(luaChonLinhVuc(lv, 'xa', 'khong-co').map((l) => l.ma)).toEqual(['dat-dai', 'ho-tich']);
  });
});
