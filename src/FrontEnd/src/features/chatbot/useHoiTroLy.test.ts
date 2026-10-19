import { describe, expect, it } from 'vitest';
import type { CauTraLoi } from './api/troLy';
import { DAP_AN_HO_SO, DAP_AN_KHONG_HIEU } from '../../test-utils/troLyMau';
import { reducerHoiTroLy, SO_TIN_TOI_DA, TRANG_THAI_DAU, type TrangThaiHoiTroLy } from './useHoiTroLy';

const gui = (tt: TrangThaiHoiTroLy, noiDung: string) => reducerHoiTroLy(tt, { loai: 'gui', noiDung });
const dapAn = (tt: TrangThaiHoiTroLy, cau: CauTraLoi) => reducerHoiTroLy(tt, { loai: 'co-dap-an', cau, luc: 1 });

describe('reducerHoiTroLy', () => {
  it('gửi rồi có đáp án: đang chờ bật rồi tắt; thuTucDangNoi gán lại bằng giá trị máy chủ', () => {
    const a = gui(TRANG_THAI_DAU, 'khai sinh');
    expect(a.dangCho).toBe(true);
    const b = dapAn(a, DAP_AN_HO_SO);
    expect(b.dangCho).toBe(false);
    expect(b.thuTucDangNoi).toBe('1.001193');
    expect(b.tinNhan.map((t) => t.vai)).toEqual(['nguoi-dan', 'tro-ly']);
    const c = dapAn(gui(b, 'giá vàng'), DAP_AN_KHONG_HIEU);
    expect(c.thuTucDangNoi).toBeNull();
  });

  it('lỗi: tin lỗi giữ yêu cầu, ngữ cảnh không đổi, không đặt dapAnMoiNhat; thử lại bỏ tin lỗi', () => {
    const a = dapAn(gui(TRANG_THAI_DAU, 'khai sinh'), DAP_AN_HO_SO);
    const b = reducerHoiTroLy(gui(a, 'mấy ngày'), {
      loai: 'co-loi',
      loi: new Error('x'),
      yeuCau: { loai: 'hoi', cauHoi: 'mấy ngày' },
    });
    expect(b.thuTucDangNoi).toBe('1.001193');
    expect(b.dapAnMoiNhat).toBe(a.dapAnMoiNhat);
    const loi = b.tinNhan.at(-1)!;
    expect(loi).toMatchObject({ vai: 'tro-ly', kieu: 'loi' });
    const c = reducerHoiTroLy(b, { loai: 'thu-lai', id: loi.id });
    expect(c.dangCho).toBe(true);
    expect(c.tinNhan.some((t) => t.id === loi.id)).toBe(false);
    expect(c.tinNhan.filter((t) => t.vai === 'nguoi-dan')).toHaveLength(2);
  });

  it('giữ tối đa 60 tin, bỏ tin cũ nhất; id không trùng', () => {
    let tt = TRANG_THAI_DAU;
    for (let i = 0; i < 50; i++) tt = dapAn(gui(tt, `câu ${i}`), DAP_AN_KHONG_HIEU);
    expect(tt.tinNhan).toHaveLength(SO_TIN_TOI_DA);
    expect(tt.tinNhan.at(-1)).toMatchObject({ vai: 'tro-ly' });
    expect(tt.tinNhan[0]).toMatchObject({ vai: 'nguoi-dan', noiDung: 'câu 20' });
    expect(new Set(tt.tinNhan.map((t) => t.id)).size).toBe(SO_TIN_TOI_DA);
  });

  it('nhớ liên kết Cổng DVC đầu tiên (một dòng nhắc đăng xuất cho cả khung)', () => {
    const a = dapAn(gui(TRANG_THAI_DAU, 'giá vàng'), DAP_AN_KHONG_HIEU);
    expect(a.lienKetCongDvc).toBeNull();
    const b = dapAn(gui(a, 'khai sinh'), DAP_AN_HO_SO);
    expect(b.lienKetCongDvc).toContain('dichvucong.gov.vn');
    const c = dapAn(gui(b, 'giá vàng'), DAP_AN_KHONG_HIEU);
    expect(c.lienKetCongDvc).toBe(b.lienKetCongDvc);
  });
});
