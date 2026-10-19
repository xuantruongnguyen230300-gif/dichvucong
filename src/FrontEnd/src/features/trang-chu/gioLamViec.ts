import type { ThongTinTrungTam } from '../../core/api/trungTam';

type GioNgay = ThongTinTrungTam['gioLamViec'][number];

/** Một buổi: giờ nguyên văn "HH:mm" để hiển thị, phút trong ngày để so sánh. */
export interface Khung {
  tu: string;
  den: string;
  phutTu: number;
  phutDen: number;
}

/** Các ngày liền nhau có cùng giờ gộp thành một dòng (BR-8). */
export interface NhomGio {
  tuThu: number;
  denThu: number;
  sang: Khung | null;
  chieu: Khung | null;
}

interface NgayChuanHoa {
  thu: number;
  sang: Khung | null;
  chieu: Khung | null;
}

/** Việt Nam là UTC+7 quanh năm, không có giờ mùa hè: cộng cố định, không phụ thuộc múi giờ máy khách và không dùng `Intl`. */
const LECH_VIET_NAM_MS = 7 * 3_600_000;
const GIO_PHUT = /^(\d{2}):(\d{2})$/;

/** Thứ (1 = Thứ Hai … 7 = Chủ nhật) và số phút trong ngày theo giờ Việt Nam. */
export function thoiDiemVietNam(luc: Date): { thu: number; phut: number } {
  const vn = new Date(luc.getTime() + LECH_VIET_NAM_MS);
  return { thu: vn.getUTCDay() || 7, phut: vn.getUTCHours() * 60 + vn.getUTCMinutes() };
}

function phutCuaGio(gio: string | null): number | null {
  const m = gio === null ? null : GIO_PHUT.exec(gio);
  if (!m) return null;
  const h = Number(m[1]);
  const p = Number(m[2]);
  return h <= 23 && p <= 59 ? h * 60 + p : null;
}

/** Buổi hợp lệ khi cả hai đầu đúng dạng, giờ 00–23, phút 00–59 và đầu < cuối. Buổi hỏng bị bỏ qua. */
function taoKhung(tu: string | null, den: string | null): Khung | null {
  const phutTu = phutCuaGio(tu);
  const phutDen = phutCuaGio(den);
  if (tu === null || den === null || phutTu === null || phutDen === null || phutTu >= phutDen) return null;
  return { tu, den, phutTu, phutDen };
}

/**
 * Chuẩn hoá chung cho trạng thái và dòng giờ (hai nơi không thể lệch nhau): sắp theo thứ, bỏ thứ ngoài 1–7,
 * bỏ ngày không còn buổi hợp lệ (= ngày nghỉ). Thứ lặp lại: dòng đầu tiên thắng.
 */
function chuanHoa(gio: readonly GioNgay[]): NgayChuanHoa[] {
  const theoThu = new Map<number, NgayChuanHoa>();
  for (const ngay of gio) {
    if (!Number.isInteger(ngay.thu) || ngay.thu < 1 || ngay.thu > 7 || theoThu.has(ngay.thu)) continue;
    const sang = taoKhung(ngay.sangTu, ngay.sangDen);
    const chieu = taoKhung(ngay.chieuTu, ngay.chieuDen);
    if (sang || chieu) theoThu.set(ngay.thu, { thu: ngay.thu, sang, chieu });
  }
  return [...theoThu.values()].sort((a, b) => a.thu - b.thu);
}

const trongKhung = (khung: Khung | null, phut: number) => khung !== null && khung.phutTu <= phut && phut < khung.phutDen;

const cungKhung = (a: Khung | null, b: Khung | null) =>
  a === null || b === null ? a === b : a.phutTu === b.phutTu && a.phutDen === b.phutDen;

/**
 * BR-2, BR-7: đang trong buổi sáng hoặc chiều của đúng ngày hôm đó (giờ Việt Nam)?
 * Đầu buổi tính, cuối buổi không tính (đúng 11:30 là ngoài giờ). Ngày không có dòng giờ = ngày nghỉ. Không xét ngày lễ (BR-3).
 */
export function dangLamViec(gio: readonly GioNgay[], luc: Date): boolean {
  const { thu, phut } = thoiDiemVietNam(luc);
  const ngay = chuanHoa(gio).find((n) => n.thu === thu);
  return ngay !== undefined && (trongKhung(ngay.sang, phut) || trongKhung(ngay.chieu, phut));
}

/**
 * BR-8: sắp theo thứ, bỏ ngày không có buổi hợp lệ, gộp ngày liền nhau cùng giờ.
 * Thứ Hai và Chủ nhật không nối vòng; ngày nghỉ chen giữa cắt nhóm.
 */
export function gopNgay(gio: readonly GioNgay[]): NhomGio[] {
  const nhom: NhomGio[] = [];
  for (const ngay of chuanHoa(gio)) {
    const cuoi = nhom.at(-1);
    if (cuoi && cuoi.denThu + 1 === ngay.thu && cungKhung(cuoi.sang, ngay.sang) && cungKhung(cuoi.chieu, ngay.chieu)) {
      cuoi.denThu = ngay.thu;
    } else {
      nhom.push({ tuThu: ngay.thu, denThu: ngay.thu, sang: ngay.sang, chieu: ngay.chieu });
    }
  }
  return nhom;
}
