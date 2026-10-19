import { describe, expect, it } from 'vitest';
import { dinhDangNgay, dinhDangSo } from './dinhDang';

describe('dinhDangNgay', () => {
  it('đổi yyyy-MM-dd sang dd/mm/yyyy', () => {
    expect(dinhDangNgay('2026-10-08')).toBe('08/10/2026');
    expect(dinhDangNgay('2026-01-31')).toBe('31/01/2026');
  });

  it('không đúng dạng hoặc trống thì trả null', () => {
    for (const x of ['', '08/10/2026', '2026-10-08T00:00:00Z', 'abc', null, undefined]) {
      expect(dinhDangNgay(x)).toBeNull();
    }
  });
});

describe('dinhDangSo', () => {
  it('dấu chấm ngăn nghìn kiểu Việt', () => {
    expect(dinhDangSo(1000)).toBe('1.000');
    expect(dinhDangSo(266)).toBe('266');
    expect(dinhDangSo(0)).toBe('0');
    expect(dinhDangSo(1234567)).toBe('1.234.567');
  });
});
