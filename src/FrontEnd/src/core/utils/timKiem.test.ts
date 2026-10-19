import { describe, expect, it } from 'vitest';
import { SO_TU_TOI_DA, TU_KHOA_TOI_DA, ghepChuoiTimKiem, gioiHanTuKhoa, taoBoLocTuKhoa } from './timKiem';

const ZWSP = String.fromCodePoint(0x200b);
const LRM = String.fromCodePoint(0x200e);

const muc = [
  'Đăng ký khai sinh',
  'Đăng ký kết hôn',
  'Cấp bản sao trích lục hộ tịch',
  'Chứng thực Thủy lợi',
  'Chứng thực Thuỷ sản',
].map((ten) => ({ ten, chuoi: ghepChuoiTimKiem(ten) }));

const loc = (tuKhoa: string) => muc.filter((m) => taoBoLocTuKhoa(tuKhoa)(m.chuoi)).map((m) => m.ten);

describe('taoBoLocTuKhoa', () => {
  it('AC-7: hoa thường, dấu, khoảng trắng cho cùng kết quả', () => {
    const mong = ['Đăng ký khai sinh'];
    expect(loc('dang ky khai sinh')).toEqual(mong);
    expect(loc('ĐĂNG KÝ KHAI SINH')).toEqual(mong);
    expect(loc('  khai   sinh  đăng ký ')).toEqual(mong);
  });

  it('AC-8: thuy khớp cả Thủy lẫn Thuỷ', () => {
    expect(loc('thuy')).toEqual(['Chứng thực Thủy lợi', 'Chứng thực Thuỷ sản']);
  });

  it('AC-8: NFD cho cùng kết quả như NFC', () => {
    expect(loc('đăng ký'.normalize('NFD'))).toEqual(loc('đăng ký'.normalize('NFC')));
    expect(loc('đăng ký'.normalize('NFD'))).toHaveLength(2);
  });

  it('AC-8: ký tự vô hình bị bỏ', () => {
    expect(loc(`k${ZWSP}hai sinh`)).toEqual(loc('khai sinh'));
    expect(loc(`${ZWSP}khai sinh`)).toEqual(loc('khai sinh'));
    expect(loc(`đăng k${LRM}ý`)).toEqual(loc('đăng ký'));
  });

  it('chuỗi tìm có ký tự vô hình vẫn khớp', () => {
    expect(taoBoLocTuKhoa('dang ky')(ghepChuoiTimKiem(`Đăng k${LRM}ý`))).toBe(true);
  });

  it('từ khoá rỗng hoặc chỉ khoảng trắng khớp mọi mục', () => {
    expect(loc('')).toHaveLength(muc.length);
    expect(loc('   ')).toHaveLength(muc.length);
  });
});

describe('ghepChuoiTimKiem', () => {
  it('bỏ trường rỗng, chuẩn hoá và nối', () => {
    expect(ghepChuoiTimKiem('Đăng Ký', null, undefined, 'KHAI sinh')).toBe('dang ky khai sinh');
  });
});

describe('gioiHanTuKhoa', () => {
  it('cắt về 100 ký tự', () => {
    expect(gioiHanTuKhoa('a'.repeat(5000))).toHaveLength(TU_KHOA_TOI_DA);
    expect(gioiHanTuKhoa('khai sinh')).toBe('khai sinh');
  });

  it('chỉ giữ 12 từ đầu, giữ khoảng trắng cuối khi đang gõ', () => {
    const tu = Array.from({ length: 30 }, (_, i) => `t${i}`);
    expect(gioiHanTuKhoa(tu.join(' ')).split(' ')).toHaveLength(SO_TU_TOI_DA);
    expect(gioiHanTuKhoa('a b ')).toBe('a b ');
    expect(gioiHanTuKhoa(`${tu.slice(0, SO_TU_TOI_DA).join(' ')} `)).toBe(`${tu.slice(0, SO_TU_TOI_DA).join(' ')} `);
  });

  it('không cắt đôi cặp thay thế', () => {
    const vui = String.fromCodePoint(0x1f600);
    const kq = gioiHanTuKhoa('a'.repeat(TU_KHOA_TOI_DA - 1) + vui);
    expect(kq).toBe('a'.repeat(TU_KHOA_TOI_DA - 1));
  });

  it('bộ lọc chỉ dùng 12 từ đầu', () => {
    const chuoi = Array.from({ length: SO_TU_TOI_DA }, (_, i) => `t${i}`).join(' ');
    expect(taoBoLocTuKhoa(`${chuoi} khongco`)(chuoi)).toBe(true);
  });
});
