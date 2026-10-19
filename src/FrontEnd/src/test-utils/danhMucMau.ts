import { vi } from 'vitest';
import type { MucDo, ThuTucRutGon } from '../core/api/danhMucThuTuc';
import type { LinhVuc } from '../core/api/linhVuc';
import type { ThongTinTrungTam } from '../core/api/trungTam';
import { chuanHoaTimKiem } from '../core/utils/tiengViet';

/**
 * Dữ liệu thử cho `/api/thu-tuc` và `/api/linh-vuc` (không phải dữ liệu thật của Cần Giuộc).
 * Dùng chung cho test của core, F02, F03, F04.
 */

export type CapThuTuc = 'xa' | 'tinh' | 'ca-hai';

export interface TuyChonThuTuc {
  ma?: string;
  ten?: string;
  linhVucMa?: string;
  mucDo?: MucDo;
  cap?: CapThuTuc;
  thuTuThuongGap?: number | null;
  thoiHan?: string | null;
  coQuanThucHien?: string | null;
}

/** Một thủ tục rút gọn; `tenTimKiem` tự tính từ `ten` như BE. */
export function taoThuTuc(tuyChon: TuyChonThuTuc = {}): ThuTucRutGon {
  const { cap = 'ca-hai' } = tuyChon;
  const ten = tuyChon.ten ?? 'Thủ tục thử';
  return {
    ma: tuyChon.ma ?? '1.000001',
    ten,
    tenTimKiem: chuanHoaTimKiem(ten),
    linhVucMa: tuyChon.linhVucMa ?? 'ho-tich',
    mucDo: tuyChon.mucDo ?? 'toan-trinh',
    capXa: cap !== 'tinh',
    capTinh: cap !== 'xa',
    thuTuThuongGap: tuyChon.thuTuThuongGap ?? null,
    thoiHan: tuyChon.thoiHan === undefined ? '3 ngày làm việc' : tuyChon.thoiHan,
    coQuanThucHien: tuyChon.coQuanThucHien === undefined ? 'Uỷ ban nhân dân xã' : tuyChon.coQuanThucHien,
  };
}

/**
 * `so` thủ tục cùng cấp, mức độ, lĩnh vực; mã "1.NNNNNN" tăng dần từ `batDau`,
 * tên "Thủ tục thử số N". Ghi đè từng trường bằng `tuyChon` (trừ mã và tên).
 */
export function taoDanhSachThuTuc(so: number, tuyChon: Omit<TuyChonThuTuc, 'ma' | 'ten'> & { batDau?: number } = {}): ThuTucRutGon[] {
  const { batDau = 1, ...conLai } = tuyChon;
  return Array.from({ length: so }, (_, i) => {
    const n = batDau + i;
    return taoThuTuc({ ...conLai, ma: `1.${String(n).padStart(6, '0')}`, ten: `Thủ tục thử số ${n}` });
  });
}

export function taoLinhVuc(ma: string, ten: string, soThuTucXa = 0, soThuTucTinh = 0): LinhVuc {
  return { ma, ten, tenTimKiem: chuanHoaTimKiem(ten), soThuTucXa, soThuTucTinh };
}

const soSanhOrdinal = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Dựng danh sách lĩnh vực từ thủ tục: đếm theo cấp, bỏ lĩnh vực không có thủ tục,
 * sắp theo `tenTimKiem` rồi `ma` (Ordinal) như BE. `tenTheoMa` đặt tên; thiếu thì dùng chính mã.
 */
export function taoLinhVucTuThuTuc(thuTuc: readonly ThuTucRutGon[], tenTheoMa: Readonly<Record<string, string>> = {}): LinhVuc[] {
  const dem = new Map<string, { xa: number; tinh: number }>();
  for (const t of thuTuc) {
    const d = dem.get(t.linhVucMa) ?? { xa: 0, tinh: 0 };
    if (t.capXa) d.xa += 1;
    if (t.capTinh) d.tinh += 1;
    dem.set(t.linhVucMa, d);
  }
  return [...dem.entries()]
    .filter(([, d]) => d.xa + d.tinh > 0)
    .map(([ma, d]) => taoLinhVuc(ma, tenTheoMa[ma] ?? ma, d.xa, d.tinh))
    .sort((a, b) => soSanhOrdinal(a.tenTimKiem, b.tenTimKiem) || soSanhOrdinal(a.ma, b.ma));
}

export interface DuLieuDanhMuc {
  thuTuc: ThuTucRutGon[];
  linhVuc: LinhVuc[];
}

const TEN_LINH_VUC_MAU: Record<string, string> = {
  'ho-tich': 'Hộ tịch',
  'dat-dai': 'Đất đai',
  'thuy-loi': 'Thuỷ lợi',
};

/**
 * Bộ mẫu nhỏ, đủ để thử tìm kiếm và lọc: 3 lĩnh vực; thủ tục đủ ba tổ hợp cấp, hai mức độ,
 * 2 thủ tục thường gặp. "Thủ tục đăng ký khai sinh" có mã "1.001193" (AC-12).
 */
export const DANH_MUC_MAU: DuLieuDanhMuc = (() => {
  const thuTuc = [
    taoThuTuc({ ma: '1.001193', ten: 'Thủ tục đăng ký khai sinh', linhVucMa: 'ho-tich', cap: 'xa', thuTuThuongGap: 1 }),
    taoThuTuc({ ma: '1.000656', ten: 'Thủ tục đăng ký kết hôn', linhVucMa: 'ho-tich', cap: 'xa', thuTuThuongGap: 2 }),
    taoThuTuc({ ma: '1.001022', ten: 'Thủ tục đăng ký khai tử', linhVucMa: 'ho-tich', cap: 'ca-hai', mucDo: 'mot-phan' }),
    taoThuTuc({ ma: '1.004227', ten: 'Thủ tục cấp lại giấy chứng nhận quyền sử dụng đất', linhVucMa: 'dat-dai', cap: 'tinh', mucDo: 'mot-phan', thoiHan: null }),
    taoThuTuc({ ma: '1.005132', ten: 'Thủ tục thế chấp quyền sử dụng đất', linhVucMa: 'dat-dai', cap: 'ca-hai', coQuanThucHien: null }),
    taoThuTuc({ ma: '1.003440', ten: 'Thủ tục thẩm định kế hoạch tu bổ công trình thuỷ lợi', linhVucMa: 'thuy-loi', cap: 'tinh' }),
  ];
  return { thuTuc, linhVuc: taoLinhVucTuThuTuc(thuTuc, TEN_LINH_VUC_MAU) };
})();

/** Bộ lớn cho thử hiệu năng lọc: `so` thủ tục chia đều qua `soLinhVuc` lĩnh vực, ba cấp xoay vòng, hai mức độ xen kẽ. */
export function taoDanhMucLon(so: number, soLinhVuc = 20): DuLieuDanhMuc {
  const caps: CapThuTuc[] = ['xa', 'tinh', 'ca-hai'];
  const thuTuc = Array.from({ length: so }, (_, i) =>
    taoThuTuc({
      ma: `1.${String(i + 1).padStart(6, '0')}`,
      ten: `Thủ tục thử số ${i + 1} về giải quyết hồ sơ của công dân`,
      linhVucMa: `linh-vuc-${i % soLinhVuc}`,
      cap: caps[i % caps.length]!,
      mucDo: i % 2 === 0 ? 'toan-trinh' : 'mot-phan',
    }),
  );
  const ten = Object.fromEntries(Array.from({ length: soLinhVuc }, (_, i) => [`linh-vuc-${i}`, `Lĩnh vực thử ${i}`]));
  return { thuTuc, linhVuc: taoLinhVucTuThuTuc(thuTuc, ten) };
}

/** Cách hai API trả lời trong test. `treo` = chưa trả lời; `traLoi(duLieu)` trả lời các yêu cầu đang treo. */
export type PhanHoiDanhMuc = DuLieuDanhMuc | 'loi-mang' | 'khong-co-du-lieu' | 'loi-he-thong' | 'treo';

function phanHoiLoi(status: number, code: string): Response {
  return new Response(JSON.stringify({ code, maTraCuu: 'AB12CD34' }), {
    status,
    headers: { 'content-type': 'application/problem+json' },
  });
}

/**
 * Giả `fetch` cho `/api/thu-tuc` và `/api/linh-vuc` (và `/api/trung-tam` nếu có `trungTam`; không có thì 404).
 * Gắn vào toàn cục; gỡ bằng `vi.unstubAllGlobals()`.
 */
export function giaFetchDanhMuc(phanHoi: PhanHoiDanhMuc, tuyChon: { trungTam?: ThongTinTrungTam } = {}) {
  const dangTreo: { duongDan: string; giai: (r: Response) => void }[] = [];
  const traLoiDuLieu = (duongDan: string, duLieu: DuLieuDanhMuc): Response =>
    duongDan === '/api/thu-tuc' ? Response.json(duLieu.thuTuc) : Response.json(duLieu.linhVuc);

  const fn = vi.fn<typeof fetch>().mockImplementation((dau) => {
    const duongDan = String(dau).split('?')[0] ?? '';
    if (duongDan === '/api/trung-tam') {
      return Promise.resolve(tuyChon.trungTam ? Response.json(tuyChon.trungTam) : phanHoiLoi(404, 'khong-tim-thay'));
    }
    if (duongDan !== '/api/thu-tuc' && duongDan !== '/api/linh-vuc') return Promise.resolve(phanHoiLoi(404, 'khong-tim-thay'));
    if (phanHoi === 'treo') return new Promise<Response>((giai) => dangTreo.push({ duongDan, giai }));
    if (phanHoi === 'loi-mang') return Promise.reject(new TypeError('Failed to fetch'));
    if (phanHoi === 'khong-co-du-lieu') return Promise.resolve(phanHoiLoi(404, 'khong-tim-thay'));
    if (phanHoi === 'loi-he-thong') return Promise.resolve(phanHoiLoi(500, 'loi-he-thong'));
    return Promise.resolve(traLoiDuLieu(duongDan, phanHoi));
  });
  vi.stubGlobal('fetch', fn);
  const traLoi = (duLieu: DuLieuDanhMuc) => dangTreo.splice(0).forEach((y) => y.giai(traLoiDuLieu(y.duongDan, duLieu)));
  return Object.assign(fn, { traLoi });
}
