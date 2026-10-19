import { describe, expect, it } from 'vitest';
import { capCuaLinhVuc, taoLinkDanhMuc, taoLinkQr } from './linkQr';

describe('capCuaLinhVuc (BR-1)', () => {
  it('có thủ tục cấp xã → xa; chỉ cấp tỉnh → tinh; biên 0 và 1', () => {
    expect(capCuaLinhVuc({ soThuTucXa: 0 })).toBe('tinh');
    expect(capCuaLinhVuc({ soThuTucXa: 1 })).toBe('xa');
    expect(capCuaLinhVuc({ soThuTucXa: 266 })).toBe('xa');
  });
});

describe('taoLinkDanhMuc', () => {
  it('đường dẫn danh mục đã lọc lĩnh vực', () => {
    expect(taoLinkDanhMuc('xa', 'ho-tich')).toBe('/thu-tuc?cap=xa&lv=ho-tich');
    expect(taoLinkDanhMuc('tinh', 'dat-dai')).toBe('/thu-tuc?cap=tinh&lv=dat-dai');
  });

  it('mã có ký tự lạ được mã hoá, không phá cấu trúc địa chỉ', () => {
    expect(taoLinkDanhMuc('xa', 'a&b=c d/#')).toBe('/thu-tuc?cap=xa&lv=a%26b%3Dc%20d%2F%23');
  });
});

describe('taoLinkQr (AC-2, AC-7)', () => {
  it('lĩnh vực có thủ tục cấp xã → cap=xa', () => {
    expect(taoLinkQr('https://x.vn', { ma: 'ho-tich', soThuTucXa: 5 })).toBe('https://x.vn/thu-tuc?cap=xa&lv=ho-tich');
    expect(taoLinkQr('https://x.vn', { ma: 'ho-tich', soThuTucXa: 1 })).toBe('https://x.vn/thu-tuc?cap=xa&lv=ho-tich');
  });

  it('lĩnh vực chỉ có thủ tục cấp tỉnh → cap=tinh', () => {
    expect(taoLinkQr('https://x.vn', { ma: 'thuy-loi', soThuTucXa: 0 })).toBe('https://x.vn/thu-tuc?cap=tinh&lv=thuy-loi');
  });

  it('tên miền lấy đúng từ tham số gốc (mở bằng localhost thì QR chứa localhost)', () => {
    expect(taoLinkQr('http://localhost:5173', { ma: 'ho-tich', soThuTucXa: 5 })).toBe(
      'http://localhost:5173/thu-tuc?cap=xa&lv=ho-tich',
    );
  });

  it('khớp với liên kết trong ô: cùng cấp, cùng mã', () => {
    const l = { ma: 'chung-thuc', soThuTucXa: 3 };
    expect(taoLinkQr('https://x.vn', l)).toBe(`https://x.vn${taoLinkDanhMuc(capCuaLinhVuc(l), l.ma)}`);
  });
});
