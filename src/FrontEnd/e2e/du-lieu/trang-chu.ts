import type { Page } from '@playwright/test';

/** Dữ liệu thử của F02: Trung tâm TT-A…TT-D, giờ làm việc G1…G10, ô dịch vụ O6, O6g, O7, OE, OD. Tên giả. */

export interface OThu {
  ten: string;
  moTa: string | null;
  bieuTuong: string;
  url: string | null;
}

export interface GioThu {
  thu: number;
  sangTu: string | null;
  sangDen: string | null;
  chieuTu: string | null;
  chieuDen: string | null;
}

export interface TrungTamThu {
  ten: string;
  xa: string | null;
  tinh: string | null;
  coQuanChuQuan: string | null;
  nguoiChiuTrachNhiem: string;
  chucVuNguoiChiuTrachNhiem: string | null;
  diaChi: string;
  dienThoai: string;
  email: string;
  banDo: string | null;
  mangXaHoi: { zaloOa: string | null; facebook: string | null; youTube: string | null; tikTok: string | null };
  lienKet: { ten: string; url: string }[];
  oDichVu: OThu[];
  gioLamViec: GioThu[];
  ghiChuNgayNghi: string | null;
  ngayCapNhatThuTuc: string | null;
}

export const o = (ten: string, bieuTuong: string, url: string | null, moTa: string | null = null): OThu => ({ ten, moTa, bieuTuong, url });

/** O6g: đúng tên và thứ tự của lien-ket.md §1, nhưng địa chỉ ô có link trỏ tới *.example.test (không gọi ra ngoài thật). */
export const O6G: OThu[] = [
  o('Bốc số thứ tự / Đặt lịch hẹn', 'boc-so', null),
  o('Đánh giá hài lòng', 'danh-gia', null),
  o('Tra cứu hồ sơ', 'tra-cuu-ho-so', 'https://tracuu.example.test/ho-so'),
  o('Thanh toán trực tuyến', 'thanh-toan', 'https://thanhtoan.example.test/'),
  o('Cổng Dịch vụ công Quốc gia', 'cong-dvc', 'https://dvc.example.test/thu-tuc'),
  o('Cổng thông tin điện tử xã Cần Giuộc', 'cong-thong-tin', 'https://cangiuoc.example.test'),
];

export const O7: OThu[] = [...O6G, o('Ô mới thử', 'lien-ket', 'https://moi.example.test')];

/** OE: địa chỉ độc hại hoặc sai định dạng; tên có HTML. */
export const OE: OThu[] = [
  o('<b>đậm</b> & "x"', 'lien-ket', 'javascript:alert(1)'),
  o('Ô data', 'lien-ket', 'data:text/html,x'),
  o('Ô cùng giao thức', 'lien-ket', '//evil.example'),
  o('Ô rỗng', 'lien-ket', ''),
  o('Ô khoảng trắng', 'lien-ket', '   '),
  o('Ô ftp', 'lien-ket', 'ftp://x.example'),
  o('Ô thiếu host', 'lien-ket', 'https://'),
  o('Ô http viết hoa', 'lien-ket', 'HTTP://UPPER.example.test'),
];

export const tg = (thu: number, sT = '07:00', sD = '11:30', cT: string | null = '13:30', cD: string | null = '17:00'): GioThu => ({ thu, sangTu: sT, sangDen: sD, chieuTu: cT, chieuDen: cD });

/** G1: Thứ Hai – Thứ Sáu 07:00–11:30 và 13:30–17:00. */
export const G1: GioThu[] = [1, 2, 3, 4, 5].map((t) => tg(t));
/** G2: G1 + Thứ Bảy chỉ sáng. */
export const G2: GioThu[] = [...G1, tg(6, '07:00', '11:30', null, null)];
/** G3: thiếu Thứ Tư. */
export const G3: GioThu[] = [1, 2, 4, 5].map((t) => tg(t));
/** G4: Thứ Hai và Chủ nhật. */
export const G4: GioThu[] = [tg(1), tg(7)];
/** G5: buổi hỏng. */
export const G5: GioThu[] = [
  { thu: 1, sangTu: '25:00', sangDen: '11:30', chieuTu: '13:30', chieuDen: '17:00' },
  { thu: 2, sangTu: '11:30', sangDen: '07:00', chieuTu: null, chieuDen: null },
  { thu: 3, sangTu: null, sangDen: null, chieuTu: '13:30', chieuDen: null },
  { thu: 4, sangTu: '7:00', sangDen: '11:30', chieuTu: null, chieuDen: null },
  { thu: 5, sangTu: '07:00', sangDen: '12:60', chieuTu: null, chieuDen: null },
  tg(6, '07:00', '11:30', null, null),
  tg(7, '07:00', '11:30', null, null),
];
/** G7: mỗi ngày một giờ khác nhau. */
export const G7: GioThu[] = [1, 2, 3, 4, 5, 6, 7].map((t) => tg(t, `0${6 + (t % 3)}:00`, `11:${10 + t}`, `13:${10 + t}`, `1${6 + (t % 2)}:00`));
/** G8: chỉ chiều. */
export const G8: GioThu[] = [1, 2, 3, 4, 5].map((t) => ({ thu: t, sangTu: null, sangDen: null, chieuTu: '13:30', chieuDen: '17:00' }));
/** G9: không theo thứ tự thu. */
export const G9: GioThu[] = [5, 1, 3, 2, 4].map((t) => tg(t));

export function trungTam(ghiDe: Partial<TrungTamThu> = {}): TrungTamThu {
  return {
    ten: 'Trung tâm thử A',
    xa: 'phường thử B',
    tinh: 'tỉnh thử C',
    coQuanChuQuan: 'UBND phường thử B',
    nguoiChiuTrachNhiem: 'Người thử',
    chucVuNguoiChiuTrachNhiem: 'Giám đốc (dữ liệu thử)',
    diaChi: 'Địa chỉ thử, phường thử B',
    dienThoai: '0000.000.000',
    email: 'thu@example.gov.vn',
    banDo: 'https://maps.example.test/thu',
    mangXaHoi: { zaloOa: 'https://zalo.example.test/thu', facebook: null, youTube: null, tikTok: null },
    lienKet: [
      { ten: 'Cổng Dịch vụ công Quốc gia', url: 'https://dvc.example.test' },
      { ten: 'Cổng thông tin điện tử phường thử B', url: 'https://xa.example.test' },
    ],
    oDichVu: O6G,
    gioLamViec: G2,
    ghiChuNgayNghi: null,
    ngayCapNhatThuTuc: '2026-10-08',
    ...ghiDe,
  };
}

export async function traTrungTam(page: Page, du: TrungTamThu | ((count: number) => TrungTamThu), tre = 0, dem?: string[]) {
  let lan = 0;
  await page.route('**/api/trung-tam', async (route) => {
    lan++;
    dem?.push('trung-tam');
    if (tre) await new Promise((r) => setTimeout(r, tre));
    await route.fulfill({ json: typeof du === 'function' ? du(lan) : du });
  });
}

/** Mốc thời gian I1…I16 (xem testcases.md): giờ Việt Nam → mốc UTC. */
export const MOC: Record<string, string> = {
  I1: '2026-10-12T03:00:00Z',
  I2: '2026-10-12T05:00:00Z',
  I3: '2026-10-10T02:00:00Z',
  I4: '2026-10-10T07:00:00Z',
  I5: '2026-10-11T02:00:00Z',
  I6: '2026-10-11T23:59:00Z',
  I7: '2026-10-12T00:00:00Z',
  I8: '2026-10-12T04:29:00Z',
  I9: '2026-10-12T04:30:00Z',
  I10: '2026-10-12T06:29:00Z',
  I11: '2026-10-12T06:30:00Z',
  I12: '2026-10-12T09:59:00Z',
  I13: '2026-10-12T10:00:00Z',
  I14: '2026-09-02T03:00:00Z',
  I15: '2026-09-28T03:00:00Z',
  I16: '2026-11-02T03:00:00Z',
};

export const DANG_MO = 'Đang trong giờ làm việc';
export const NGOAI_GIO = 'Ngoài giờ làm việc';

/** 8 múi giờ máy khách của ca MG-01. */
export const MUI_GIO = ['Asia/Ho_Chi_Minh', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Pacific/Auckland', 'Pacific/Kiritimati', 'Asia/Kolkata', 'Pacific/Pago_Pago'];
