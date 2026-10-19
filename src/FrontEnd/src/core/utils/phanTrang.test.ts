import { describe, expect, it } from 'vitest';
import { catTrang, chuanHoaSoTrang, dayTrang } from './phanTrang';

const B = 'bo-qua';

describe('dayTrang', () => {
  it.each([
    [1, [1, 2, B, 20]],
    [2, [1, 2, 3, B, 20]],
    [10, [1, B, 9, 10, 11, B, 20]],
    [19, [1, B, 18, 19, 20]],
    [20, [1, B, 19, 20]],
  ])('20 trang, trang %i', (hienTai, mong) => {
    expect(dayTrang(hienTai, 20)).toEqual(mong);
  });

  it('1 trang chỉ có [1]', () => {
    expect(dayTrang(1, 1)).toEqual([1]);
  });

  it('ít trang thì không có chỗ hở', () => {
    expect(dayTrang(2, 3)).toEqual([1, 2, 3]);
  });
});

describe('chuanHoaSoTrang', () => {
  it('lớn hơn tổng số trang thì lấy trang cuối', () => {
    expect(chuanHoaSoTrang('99', 3)).toBe(3);
  });
  it('hợp lệ thì giữ', () => {
    expect(chuanHoaSoTrang('2', 3)).toBe(2);
  });
  it('số rất dài (20 chữ số) vẫn lấy trang cuối (AC-14)', () => {
    expect(chuanHoaSoTrang('99999999999999999999', 20)).toBe(20);
    expect(chuanHoaSoTrang('1234567890123', 3)).toBe(3);
  });
  it('số 0 đứng đầu: "03" → 3, "00002" → 2, "000" → 1', () => {
    expect(chuanHoaSoTrang('03', 5)).toBe(3);
    expect(chuanHoaSoTrang('00002', 3)).toBe(2);
    expect(chuanHoaSoTrang('000', 3)).toBe(1);
    expect(chuanHoaSoTrang('0000000000000000000000001', 3)).toBe(1);
  });
  it.each(['abc', '-1', '0', '1.5', '2abc', '', null])('%s → 1', (tho) => {
    expect(chuanHoaSoTrang(tho, 3)).toBe(1);
  });
  it('tổng số 0 → 1', () => {
    expect(chuanHoaSoTrang('5', 0)).toBe(1);
  });
});

describe('catTrang', () => {
  const ds = Array.from({ length: 30 }, (_, i) => i + 1);
  it('trang n bắt đầu từ mục moiTrang × (n − 1) + 1', () => {
    expect(catTrang(ds, 3, 12)).toEqual([25, 26, 27, 28, 29, 30]);
    expect(catTrang(ds, 1, 12)[0]).toBe(1);
  });
});
