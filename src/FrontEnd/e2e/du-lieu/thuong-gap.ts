import type { Page } from '@playwright/test';
import { boDau } from './chung';

/** Dữ liệu thử của F03 (bộ T43, P-A…P-G) và F04 (bộ N, N60, N1000, N0, NX): tên giả, dựng bằng mã, không dựa vào dữ liệu thật. */

export type MucDoThu = 'toan-trinh' | 'mot-phan';

export interface ThuTucRutGonThu {
  ma: string;
  ten: string;
  tenTimKiem: string;
  linhVucMa: string;
  mucDo: MucDoThu;
  capXa: boolean;
  capTinh: boolean;
  thuTuThuongGap: number | null;
  thoiHan: string | null;
  coQuanThucHien: string | null;
}

export interface LinhVucThu {
  ma: string;
  ten: string;
  tenTimKiem: string;
  soThuTucXa: number;
  soThuTucTinh: number;
}

export const LINH_VUC_THU: Record<string, string> = {
  'ho-tich': 'Hộ tịch',
  'chung-thuc': 'Chứng thực',
  'dat-dai': 'Đất đai',
  'giao-dich-bao-dam': 'Giao dịch bảo đảm thử',
  'bao-tro-xa-hoi': 'Bảo trợ xã hội thử',
  'lao-dong': 'Lao động thử',
  'cu-tru': 'Cư trú thử',
  'chi-o-danh-muc': 'Lĩnh vực chỉ ở danh mục thử',
};

export function tt(
  ma: string,
  ten: string,
  linhVucMa: string,
  extra: Partial<ThuTucRutGonThu> = {},
): ThuTucRutGonThu {
  return {
    ma,
    ten,
    tenTimKiem: boDau(ten),
    linhVucMa,
    mucDo: 'toan-trinh',
    capXa: true,
    capTinh: true,
    thuTuThuongGap: null,
    thoiHan: '5 ngày làm việc',
    coQuanThucHien: 'Ủy ban nhân dân cấp xã',
    ...extra,
  };
}

export function dungLinhVuc(thuTuc: readonly ThuTucRutGonThu[], ten: Record<string, string> = LINH_VUC_THU): LinhVucThu[] {
  const ds = new Map<string, LinhVucThu>();
  for (const t of thuTuc) {
    const l = ds.get(t.linhVucMa) ?? {
      ma: t.linhVucMa,
      ten: ten[t.linhVucMa] ?? t.linhVucMa,
      tenTimKiem: boDau(ten[t.linhVucMa] ?? t.linhVucMa),
      soThuTucXa: 0,
      soThuTucTinh: 0,
    };
    if (t.capXa) l.soThuTucXa++;
    if (t.capTinh) l.soThuTucTinh++;
    ds.set(t.linhVucMa, l);
  }
  return [...ds.values()].sort((a, b) => (a.tenTimKiem < b.tenTimKiem ? -1 : a.tenTimKiem > b.tenTimKiem ? 1 : 0));
}

const hai = (n: number) => String(n).padStart(2, '0');

/** Bộ T43: 43 thủ tục thường gặp (thuTuThuongGap 1…43) + 3 thủ tục không thường gặp. API xáo thứ tự cố ý. */
export function boT43(): ThuTucRutGonThu[] {
  const ds: ThuTucRutGonThu[] = [];
  const them = (ma: string, ten: string, lv: string, mucDo: MucDoThu = 'toan-trinh') =>
    ds.push(tt(ma, ten, lv, { mucDo, thuTuThuongGap: ds.length + 1 }));
  them('1.000894', 'Thủ tục đăng ký kết hôn', 'ho-tich');
  them('1.001193', 'Thủ tục đăng ký khai sinh', 'ho-tich');
  for (let i = 1; i <= 12; i++) {
    them(`9.1000${hai(i)}`, `Đăng ký khai sinh lưu động thử ${hai(i)}`, 'ho-tich', i % 3 === 0 ? 'mot-phan' : 'toan-trinh');
  }
  them('9.100013', 'Thủ tục thử khai tử 1', 'ho-tich');
  them('9.100014', 'Thủ tục thử khai tử 2', 'ho-tich');
  them('9.200001', 'Chứng thực bản dịch giấy khai sinh thử', 'chung-thuc');
  for (let i = 1; i <= 4; i++) them(`9.20000${i + 1}`, `Chứng thực thử ${i}`, 'chung-thuc');
  them('9.300001', 'Đăng ký thế chấp', 'dat-dai', 'mot-phan');
  them('9.300002', 'Xoá đăng ký thế chấp quyền sử dụng đất thử', 'dat-dai', 'mot-phan');
  them('9.300003', 'Đăng ký thế chấp tài sản gắn liền với đất', 'dat-dai', 'mot-phan');
  for (let i = 1; i <= 3; i++) them(`9.30000${i + 3}`, `Tách thửa thử ${i}`, 'dat-dai', 'mot-phan');
  them('9.400001', 'Thủ tục thử thế chấp tài sản lưu động', 'giao-dich-bao-dam');
  for (let i = 1; i <= 5; i++) them(`9.60000${i}`, `Bảo trợ xã hội thử ${i}`, 'bao-tro-xa-hoi');
  for (let i = 1; i <= 5; i++) them(`9.70000${i}`, `Lao động thử ${i}`, 'lao-dong');
  for (let i = 1; i <= 5; i++) them(`9.80000${i}`, `Cư trú thử ${i}`, 'cu-tru');
  if (ds.length !== 43) throw new Error(`T43 phải có 43 mục, có ${ds.length}`);
  const khong = [
    tt('9.900001', 'Thủ tục thử không thường gặp 1', 'ho-tich'),
    tt('9.900002', 'Thủ tục thử không thường gặp 2', 'chi-o-danh-muc'),
    tt('9.900003', 'Thủ tục thử không thường gặp 3', 'chi-o-danh-muc'),
  ];
  // Xáo thứ tự: đảo từng khúc 7 phần tử, để API không trả theo thứ tự thường gặp.
  const tron = [...ds, ...khong];
  const ketQua: ThuTucRutGonThu[] = [];
  for (let i = 0; i < tron.length; i += 7) ketQua.push(...tron.slice(i, i + 7).reverse());
  return ketQua;
}

export const maThuongGapTheoThuTu = (ds: readonly ThuTucRutGonThu[]) =>
  ds
    .filter((t) => t.thuTuThuongGap !== null)
    .sort((a, b) => a.thuTuThuongGap! - b.thuTuThuongGap!)
    .map((t) => t.ma);

/** Chặn `/api/thu-tuc` và `/api/linh-vuc` và trả bộ thử. `tre` (ms) làm chậm. */
export async function traDanhMuc(
  page: Page,
  thuTuc: readonly ThuTucRutGonThu[],
  opt: { linhVuc?: readonly LinhVucThu[]; tre?: number; ten?: Record<string, string>; dem?: string[] } = {},
) {
  const linhVuc = opt.linhVuc ?? dungLinhVuc(thuTuc, opt.ten);
  const cho = () => (opt.tre ? new Promise((r) => setTimeout(r, opt.tre)) : Promise.resolve());
  await page.route('**/api/thu-tuc', async (route) => {
    opt.dem?.push('thu-tuc');
    await cho();
    await route.fulfill({ json: thuTuc });
  });
  await page.route('**/api/linh-vuc', async (route) => {
    opt.dem?.push('linh-vuc');
    await cho();
    await route.fulfill({ json: linhVuc });
  });
}

export async function traLoiApi(page: Page, glob: string, status: number, code: string, tre = 0) {
  await page.route(glob, async (route) => {
    if (tre) await new Promise((r) => setTimeout(r, tre));
    await route.fulfill({
      status,
      contentType: 'application/problem+json',
      json: { type: 'about:blank', title: code, status, code, maTraCuu: 'ABCD1234' },
    });
  });
}

// ───────────── Chi tiết (P-A…P-G) ─────────────

export interface ChiTietThu {
  ma: string;
  ten: string;
  linhVuc: string;
  mucDo: MucDoThu | string;
  coQuanThucHien: string | null;
  thoiHan: string | null;
  phi: string | null;
  hinhThucNop: string[];
  yeuCauDieuKien: string | null;
  trinhTu: { truongHop: string | null; noiDung: string }[];
  cachThuc: { hinhThuc: string; thoiHan: string | null; phi: string | null; moTa: string | null }[];
  thanhPhanHoSo: { ten: string; banChinh: number | null; banSao: number | null }[];
  ketQua: string[];
  canCu: { soKyHieu: string | null; trichYeu: string | null }[];
}

/** P-B: chỉ ma, ten, linhVuc, mucDo; mọi trường khác null / []. */
export function chiTietToiThieu(ma: string, ten: string, linhVuc = 'Hộ tịch'): ChiTietThu {
  return {
    ma,
    ten,
    linhVuc,
    mucDo: 'toan-trinh',
    coQuanThucHien: null,
    thoiHan: null,
    phi: null,
    hinhThucNop: [],
    yeuCauDieuKien: null,
    trinhTu: [],
    cachThuc: [],
    thanhPhanHoSo: [],
    ketQua: [],
    canCu: [],
  };
}

/** P-A: đầy đủ. */
export function chiTietDayDu(ma = '9.500001', ten = 'Thủ tục thử đầy đủ'): ChiTietThu {
  return {
    ma,
    ten,
    linhVuc: 'Hộ tịch',
    mucDo: 'toan-trinh',
    coQuanThucHien: 'Ủy ban nhân dân cấp xã thử',
    thoiHan: '5 ngày làm việc',
    phi: 'Lệ phí: 0 đồng',
    hinhThucNop: ['Trực tuyến', 'Bưu chính', 'Trực tiếp'],
    yeuCauDieuKien: 'Điều kiện thử một.\nĐiều kiện thử hai.',
    trinhTu: [
      { truongHop: 'Trường hợp thử B', noiDung: 'Bước một.\nXuống dòng ở đây.' },
      { truongHop: null, noiDung: 'Bước hai.' },
      { truongHop: null, noiDung: 'Bước ba.' },
    ],
    cachThuc: [
      { hinhThuc: 'Trực tuyến', thoiHan: '3 ngày làm việc', phi: '0 đồng', moTa: 'Qua Cổng DVC (mô tả thử)' },
      { hinhThuc: 'Trực tiếp', thoiHan: null, phi: null, moTa: null },
      { hinhThuc: 'Bưu chính', thoiHan: '7 ngày', phi: '20.000 đồng', moTa: null },
    ],
    thanhPhanHoSo: [
      { ten: 'Giấy tờ A', banChinh: 1, banSao: 0 },
      { ten: 'Giấy tờ B', banChinh: 0, banSao: 1 },
      { ten: 'Giấy tờ C', banChinh: 2, banSao: 3 },
      { ten: 'Giấy tờ D', banChinh: null, banSao: null },
    ],
    ketQua: ['Kết quả thử một', 'Kết quả thử hai'],
    canCu: [
      { soKyHieu: '85/2019/TT-BTC', trichYeu: 'Thông tư thử' },
      { soKyHieu: '04/2020/NĐ-CP', trichYeu: null },
      { soKyHieu: null, trichYeu: 'Chỉ có trích yếu' },
    ],
  };
}

/** P-D: HTML và liên kết độc hại ngay trong dữ liệu. */
export function chiTietDocHai(ma = '9.500004'): ChiTietThu {
  const b = '<b>đậm</b> <a href="javascript:alert(1)">x</a>';
  return {
    ma,
    ten: 'Thử <b>đậm</b> & "trích"',
    linhVuc: 'Hộ tịch',
    mucDo: 'toan-trinh',
    coQuanThucHien: '<script>alert(1)</script>',
    thoiHan: '5 ngày',
    phi: '<img src=x onerror=alert(1)>',
    hinhThucNop: ['<i>Trực tuyến</i>'],
    yeuCauDieuKien: b,
    trinhTu: [{ truongHop: '<u>TH</u>', noiDung: b }],
    cachThuc: [{ hinhThuc: '<b>HT</b>', thoiHan: null, phi: null, moTa: '<img src=x onerror=alert(2)>' }],
    thanhPhanHoSo: [{ ten: b, banChinh: 1, banSao: 1 }],
    ketQua: [b],
    canCu: [
      { soKyHieu: '<b>SO</b>', trichYeu: 'javascript:alert(1)' },
      { soKyHieu: null, trichYeu: 'https://example.test/vb' },
    ],
  };
}

/** P-E: rất dài (tên 300 ký tự, phí 1.700 ký tự, một bước 9,3 KB có xuống dòng, 100 giấy tờ). */
export function chiTietRatDai(ma = '9.500005'): ChiTietThu {
  const dong = 'Dòng chữ dài của bước thực hiện số một, nhiều từ tiếng Việt có dấu để xuống dòng.\n';
  return {
    ...chiTietDayDu(ma, 'Tên rất dài '.repeat(25).slice(0, 300)),
    phi: 'Phí rất dài '.repeat(142).slice(0, 1700),
    trinhTu: [{ truongHop: null, noiDung: dong.repeat(110).slice(0, 9300) }],
    thanhPhanHoSo: Array.from({ length: 100 }, (_, i) => ({ ten: `Giấy tờ số ${i + 1}`, banChinh: 1, banSao: 1 })),
  };
}

/** Trả chi tiết theo mã. Mã không có trong `bo` → 404 `khong-tim-thay`. `tre` làm chậm; `dem` ghi mã đã gọi. */
export async function traChiTiet(
  page: Page,
  bo: Record<string, ChiTietThu | ((ma: string) => ChiTietThu)>,
  opt: { tre?: number; dem?: string[]; treTheoMa?: Record<string, number> } = {},
) {
  await page.route('**/api/thu-tuc/*', async (route) => {
    const ma = decodeURIComponent(new URL(route.request().url()).pathname.split('/').pop() ?? '');
    opt.dem?.push(ma);
    const tre = opt.treTheoMa?.[ma] ?? opt.tre ?? 0;
    if (tre) await new Promise((r) => setTimeout(r, tre));
    const mau = bo[ma];
    if (mau === undefined) {
      await route.fulfill({
        status: 404,
        contentType: 'application/problem+json',
        json: { type: 'about:blank', title: 'khong-tim-thay', status: 404, code: 'khong-tim-thay', maTraCuu: 'ABCD1234' },
      });
      return;
    }
    await route.fulfill({ json: typeof mau === 'function' ? mau(ma) : mau, headers: { etag: `"${ma}"` } });
  });
}
