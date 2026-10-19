import { describe, expect, it } from 'vitest';
import { phanLoaiLienKet, taoLinkDienThoai, taoLinkEmail } from './lienKet';

describe('phanLoaiLienKet', () => {
  it('nhận web, điện thoại, thư', () => {
    expect(phanLoaiLienKet('https://dichvucong.gov.vn/p/home')?.loai).toBe('web');
    expect(phanLoaiLienKet('http://example.vn')?.loai).toBe('web');
    expect(phanLoaiLienKet('tel:02723893900')).toEqual({ loai: 'dien-thoai', href: 'tel:02723893900' });
    expect(phanLoaiLienKet('mailto:a@b.vn')).toEqual({ loai: 'thu', href: 'mailto:a@b.vn' });
  });

  it.each([
    'javascript:alert(1)',
    ' JavaScript:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,x',
    'vbscript:x',
    '/thu-tuc',
    '//evil.example',
    'https://',
    '',
    'tel:12',
    'mailto:khong-co-a-cong',
    'tel:%',
    'mailto:%zz',
    'tel:%E0%A4%A',
  ])('từ chối %j', (tho) => {
    expect(phanLoaiLienKet(tho)).toBeNull();
  });

  it('từ chối null và undefined', () => {
    expect(phanLoaiLienKet(null)).toBeNull();
    expect(phanLoaiLienKet(undefined)).toBeNull();
  });
});

describe('taoLinkDienThoai / taoLinkEmail', () => {
  it('giữ chữ số và dấu + ở đầu', () => {
    expect(taoLinkDienThoai('(0272) 389 3900')).toBe('tel:02723893900');
    expect(taoLinkDienThoai('+84 272 389')).toBe('tel:+84272389');
    expect(taoLinkDienThoai('12')).toBeNull();
  });
  it('email đúng dạng', () => {
    expect(taoLinkEmail('a@b.vn')).toBe('mailto:a@b.vn');
    expect(taoLinkEmail('abc')).toBeNull();
  });
});
