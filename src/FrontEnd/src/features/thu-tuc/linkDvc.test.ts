import { describe, expect, it } from 'vitest';
import { linkDvc } from './linkDvc';

describe('linkDvc', () => {
  it('trùng từng ký tự với Vàm Cỏ', () => {
    expect(linkDvc('1.001193')).toBe(
      'https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach?keyword=1.001193&showAdvanced=false&formalityType=STANDARD&limit=10&activeKey=STANDARD',
    );
  });

  it('mã hoá ký tự đặc biệt của mã', () => {
    expect(linkDvc('a b/c')).toContain('keyword=a%20b%2Fc&showAdvanced=false');
  });

  it('mã chứa ký tự tách tham số không chèn được tham số mới', () => {
    const url = new URL(linkDvc('x&limit=999#y'));
    expect(url.hostname).toBe('dichvucong.gov.vn');
    expect(url.searchParams.get('keyword')).toBe('x&limit=999#y');
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.hash).toBe('');
  });
});
