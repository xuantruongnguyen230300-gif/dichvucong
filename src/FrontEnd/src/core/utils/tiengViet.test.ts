import { describe, expect, it } from 'vitest';
import { boDau, chuanHoaTimKiem } from './tiengViet';

// Tránh gõ ký tự vô hình trực tiếp trong nguồn.
const c = (code: number) => String.fromCharCode(code);

// Bộ mẫu §4 của plan F00 — giữ đồng bộ với DichVuCong.Tests/Data/TiengVietTests.cs
const boMau: ReadonlyArray<readonly [string, string, string]> = [
  ['Đăng ký khai sinh', 'Dang ky khai sinh', 'dang ky khai sinh'],
  ['  HỘ   TỊCH ', '  HO   TICH ', 'ho tich'],
  ['Chứng thực bản sao', 'Chung thuc ban sao', 'chung thuc ban sao'],
  ['Thủy lợi – Thuỷ sản', 'Thuy loi – Thuy san', 'thuy loi – thuy san'],
  ['Đất đai'.normalize('NFD'), 'Dat dai', 'dat dai'],
  ['ĐƯỜNG Ở', 'DUONG O', 'duong o'],
  ['', '', ''],
  ['a\u00A0b\tc\u0085d\uFEFFe\u200Bf', 'a\u00A0b\tc\u0085d\uFEFFe\u200Bf', 'a b c def'],
  ['đăng k' + c(0x200e) + 'ý', 'dang k' + c(0x200e) + 'y', 'dang ky'],
  ['a' + c(0x200f) + 'b' + c(0x200c) + 'c' + c(0x200d) + 'd', 'a' + c(0x200f) + 'b' + c(0x200c) + 'c' + c(0x200d) + 'd', 'abcd'],
];

describe('tiengViet', () => {
  it('mẫu dạng NFD thật sự là dấu tách rời', () => {
    expect(boMau[4]?.[0]).not.toBe('Đất đai');
  });

  it.each(boMau)('boDau(%j)', (vao, boDauKq) => {
    expect(boDau(vao)).toBe(boDauKq);
  });

  it.each(boMau)('chuanHoaTimKiem(%j)', (vao, _boDauKq, timKiemKq) => {
    expect(chuanHoaTimKiem(vao)).toBe(timKiemKq);
  });
});
