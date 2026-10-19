import { describe, expect, it } from 'vitest';
import { KHOA_MA, laMaHopLe } from './maThuTuc';

describe('laMaHopLe', () => {
  it.each(['1.001193', '9.999999', '2.000815', 'A_b-1.2', '.1', '1..','1'.repeat(20)])('chấp nhận %s', (ma) => {
    expect(laMaHopLe(ma)).toBe(true);
  });

  it.each([
    ['rỗng', ''],
    ['21 ký tự', '1'.repeat(21)],
    ['có thẻ HTML', 'abc<b>x</b>'],
    ['có dấu cách', '1.001 193'],
    ['đi lên thư mục cha', '../x'],
    ['còn mã hoá phần trăm', '1.001193%20'],
    ['có xuống dòng ở cuối', '1.001193\n'],
    ['có dấu tiếng Việt', 'thủ'],
    ['một dấu chấm', '.'],
    ['hai dấu chấm', '..'],
    ['toàn dấu chấm', '.'.repeat(20)],
  ])('từ chối mã %s', (_ten, ma) => {
    expect(laMaHopLe(ma)).toBe(false);
  });

  it('tham số trên địa chỉ tên là ma', () => {
    expect(KHOA_MA).toBe('ma');
  });
});
