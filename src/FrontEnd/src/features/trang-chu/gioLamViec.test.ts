import { describe, expect, it } from 'vitest';
import type { ThongTinTrungTam } from '../../core/api/trungTam';
import { dangLamViec, gopNgay, thoiDiemVietNam } from './gioLamViec';

type GioNgay = ThongTinTrungTam['gioLamViec'][number];

const ngay = (thu: number, sangTu: string | null, sangDen: string | null, chieuTu: string | null, chieuDen: string | null): GioNgay => ({
  thu,
  sangTu,
  sangDen,
  chieuTu,
  chieuDen,
});
const haiDenSau = (thuDau = 1, thuCuoi = 5) =>
  Array.from({ length: thuCuoi - thuDau + 1 }, (_, i) => ngay(thuDau + i, '07:00', '11:30', '13:30', '17:00'));

/** AC-2: Thứ Hai – Thứ Sáu, 07:00–11:30 và 13:30–17:00. */
const AC2 = haiDenSau();
/** AC-7 / AC-9: thêm Thứ Bảy chỉ có buổi sáng. */
const AC7 = [...AC2, ngay(6, '07:00', '11:30', null, null)];

/** Giờ Việt Nam (UTC+7) → mốc thời gian; 2026-10-12 là Thứ Hai. */
const luc = (ngayThang: string, gio: string) => new Date(`${ngayThang}T${gio}:00+07:00`);
const THU_HAI = '2026-10-12';
const THU_BAY = '2026-10-17';
const CHU_NHAT = '2026-10-18';

describe('thoiDiemVietNam', () => {
  it.each([
    ['2026-10-12T03:00:00Z', 1, 600],
    ['2026-10-11T23:30:00Z', 1, 390], // Việt Nam sang ngày mới trước UTC
    ['2026-10-11T17:00:00Z', 1, 0],
    ['2026-10-11T16:59:00Z', 7, 1439], // Chủ nhật 23:59 giờ Việt Nam
    ['2026-10-18T10:00:00Z', 7, 1020],
  ])('%s → thứ %i, %i phút', (utc, thu, phut) => {
    expect(thoiDiemVietNam(new Date(utc))).toEqual({ thu, phut });
  });
});

describe('dangLamViec — AC-2', () => {
  it.each([
    [THU_HAI, '10:00', true],
    [THU_HAI, '12:00', false],
    [THU_BAY, '09:00', false], // AC-2: không có dòng Thứ Bảy
    [THU_HAI, '06:59', false],
    [THU_HAI, '07:00', true], // đầu buổi tính
    [THU_HAI, '11:29', true],
    [THU_HAI, '11:30', false], // cuối buổi không tính
    [THU_HAI, '13:29', false],
    [THU_HAI, '13:30', true],
    [THU_HAI, '16:59', true],
    [THU_HAI, '17:00', false],
    [CHU_NHAT, '10:00', false],
  ])('%s %s → %s', (ngayThang, gio, mong) => {
    expect(dangLamViec(AC2, luc(ngayThang, gio))).toBe(mong);
  });
});

describe('dangLamViec — AC-7, AC-5', () => {
  it.each([
    [THU_BAY, '09:00', true],
    [THU_BAY, '14:00', false], // Thứ Bảy không có buổi chiều
    [CHU_NHAT, '09:00', false],
  ])('%s %s → %s', (ngayThang, gio, mong) => {
    expect(dangLamViec(AC7, luc(ngayThang, gio))).toBe(mong);
  });

  it('ngày lễ chỉ là ghi chú: 02/9/2026 (Thứ Tư) 10:00 vẫn đang làm việc (BR-3)', () => {
    expect(dangLamViec(AC2, luc('2026-09-02', '10:00'))).toBe(true);
  });

  it('dữ liệu không có dòng của thứ → false; rỗng → false', () => {
    expect(dangLamViec(haiDenSau(2, 5), luc(THU_HAI, '10:00'))).toBe(false);
    expect(dangLamViec([], luc(THU_HAI, '10:00'))).toBe(false);
  });

  it('chỉ có buổi chiều: buổi sáng vẫn là ngoài giờ', () => {
    const chiCoChieu = [ngay(1, null, null, '13:30', '17:00')];
    expect(dangLamViec(chiCoChieu, luc(THU_HAI, '09:00'))).toBe(false);
    expect(dangLamViec(chiCoChieu, luc(THU_HAI, '14:00'))).toBe(true);
  });

  it('thứ lặp lại: dòng đầu tiên thắng, trạng thái và dòng giờ cùng một nguồn', () => {
    const lap = [ngay(1, '07:00', '11:30', null, null), ngay(1, null, null, '13:30', '17:00')];
    expect(dangLamViec(lap, luc(THU_HAI, '14:00'))).toBe(false);
    expect(gopNgay(lap)).toHaveLength(1);
  });
});

describe('buổi hỏng bị bỏ qua, không ném lỗi', () => {
  it.each([
    ['giờ 25:00', ngay(1, '25:00', '26:00', null, null)],
    ['phút 60', ngay(1, '07:60', '11:30', null, null)],
    ['đầu bằng cuối', ngay(1, '08:00', '08:00', null, null)],
    ['đầu sau cuối', ngay(1, '11:30', '07:00', null, null)],
    ['thiếu đầu', ngay(1, null, '11:30', null, null)],
    ['thiếu cuối', ngay(1, '07:00', null, null, null)],
    ['sai định dạng', ngay(1, '7:00', '11:30', null, null)],
    ['chữ thay giờ', ngay(1, 'sáng', 'trưa', null, null)],
  ])('%s → ngày coi như nghỉ', (_ten, hong) => {
    expect(dangLamViec([hong], luc(THU_HAI, '10:00'))).toBe(false);
    expect(gopNgay([hong])).toEqual([]);
  });

  it('một buổi hỏng không làm mất buổi còn lại', () => {
    const gio = [ngay(1, '25:00', '26:00', '13:30', '17:00')];
    expect(dangLamViec(gio, luc(THU_HAI, '14:00'))).toBe(true);
    expect(dangLamViec(gio, luc(THU_HAI, '10:00'))).toBe(false);
    expect(gopNgay(gio)).toEqual([
      { tuThu: 1, denThu: 1, sang: null, chieu: { tu: '13:30', den: '17:00', phutTu: 810, phutDen: 1020 } },
    ]);
  });

  it('thứ ngoài 1–7 bị bỏ', () => {
    expect(gopNgay([ngay(0, '07:00', '11:30', null, null), ngay(8, '07:00', '11:30', null, null)])).toEqual([]);
  });
});

describe('gopNgay', () => {
  it('AC-2: Thứ Hai – Thứ Sáu cùng giờ → 1 nhóm, giờ nguyên văn', () => {
    expect(gopNgay(AC2)).toEqual([
      {
        tuThu: 1,
        denThu: 5,
        sang: { tu: '07:00', den: '11:30', phutTu: 420, phutDen: 690 },
        chieu: { tu: '13:30', den: '17:00', phutTu: 810, phutDen: 1020 },
      },
    ]);
  });

  it('AC-9: Hai–Sáu cùng giờ + Bảy chỉ buổi sáng → 2 nhóm, không có Chủ nhật', () => {
    const nhom = gopNgay(AC7);
    expect(nhom.map((n) => [n.tuThu, n.denThu])).toEqual([
      [1, 5],
      [6, 6],
    ]);
    expect(nhom[1]!.chieu).toBeNull();
    expect(nhom.some((n) => n.denThu === 7)).toBe(false);
  });

  it('ngày nghỉ chen giữa (thiếu Thứ Tư) → 2 nhóm', () => {
    const thieuThuTu = AC2.filter((n) => n.thu !== 3);
    expect(gopNgay(thieuThuTu).map((n) => [n.tuThu, n.denThu])).toEqual([
      [1, 2],
      [4, 5],
    ]);
  });

  it('Thứ Hai và Chủ nhật cùng giờ vẫn tách (không nối vòng)', () => {
    const gio = [ngay(1, '07:00', '11:30', null, null), ngay(7, '07:00', '11:30', null, null)];
    expect(gopNgay(gio).map((n) => [n.tuThu, n.denThu])).toEqual([
      [1, 1],
      [7, 7],
    ]);
  });

  it('ngày liền nhau khác giờ → không gộp', () => {
    const gio = [ngay(1, '07:00', '11:30', null, null), ngay(2, '07:30', '11:30', null, null)];
    expect(gopNgay(gio)).toHaveLength(2);
  });

  it('khác ở việc có hay không có buổi chiều → không gộp', () => {
    const gio = [ngay(5, '07:00', '11:30', '13:30', '17:00'), ngay(6, '07:00', '11:30', null, null)];
    expect(gopNgay(gio)).toHaveLength(2);
  });

  it('dữ liệu không sắp thứ tự vẫn gộp đúng', () => {
    const loXon = [AC7[4]!, AC7[0]!, AC7[5]!, AC7[2]!, AC7[1]!, AC7[3]!];
    expect(gopNgay(loXon)).toEqual(gopNgay(AC7));
  });

  it('rỗng → mảng rỗng', () => {
    expect(gopNgay([])).toEqual([]);
  });

  it('không làm đổi dữ liệu đầu vào', () => {
    const goc = structuredClone(AC7);
    gopNgay(AC7);
    dangLamViec(AC7, luc(THU_HAI, '10:00'));
    expect(AC7).toEqual(goc);
  });
});

describe('không phụ thuộc múi giờ máy khách', () => {
  it('kết quả không đổi theo TZ (chạy lại với TZ=Asia/Ho_Chi_Minh, America/Los_Angeles, Pacific/Auckland)', () => {
    // Mốc UTC cố định: 2026-10-12T03:00Z = Thứ Hai 10:00 giờ Việt Nam, ở Los Angeles vẫn là Chủ nhật 20:00
    expect(dangLamViec(AC2, new Date('2026-10-12T03:00:00Z'))).toBe(true);
    // 2026-10-11T23:30Z = Thứ Hai 06:30 Việt Nam (chưa mở), ở Auckland đã là Thứ Hai 12:30
    expect(dangLamViec(AC2, new Date('2026-10-11T23:30:00Z'))).toBe(false);
    // 2026-10-17T02:00Z = Thứ Bảy 09:00 Việt Nam
    expect(dangLamViec(AC7, new Date('2026-10-17T02:00:00Z'))).toBe(true);
    expect(thoiDiemVietNam(new Date('2026-10-11T23:30:00Z'))).toEqual({ thu: 1, phut: 390 });
  });
});
