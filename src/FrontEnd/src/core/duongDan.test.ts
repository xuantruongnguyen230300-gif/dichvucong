import { describe, expect, it } from 'vitest';
import common from './i18n/vi/common.json';
import { DUONG_DAN, DUONG_DAN_THEO_TRANG, type KhoaTrang } from './duongDan';

describe('duongDan', () => {
  it('mỗi trang có đường dẫn đều có câu chữ ten, ten-ngan, mo-ta', () => {
    for (const khoa of Object.keys(DUONG_DAN_THEO_TRANG) as (keyof typeof DUONG_DAN_THEO_TRANG)[]) {
      const trang = common.trang[khoa];
      expect(trang.ten).toBeTruthy();
      expect(trang['ten-ngan']).toBeTruthy();
      expect(trang['mo-ta']).toBeTruthy();
    }
  });

  it('KhoaTrang trùng đúng các khoá common:trang', () => {
    const khoa: Record<KhoaTrang, true> = { 'trang-chu': true, 'danh-muc': true, 'linh-vuc': true, 'khong-tim-thay': true };
    expect(Object.keys(common.trang).sort()).toEqual(Object.keys(khoa).sort());
  });

  it('đường dẫn bắt đầu bằng "/" và không trùng nhau', () => {
    const ds = Object.values(DUONG_DAN);
    expect(ds.every((d) => d.startsWith('/'))).toBe(true);
    expect(new Set(ds).size).toBe(ds.length);
    expect(Object.values(DUONG_DAN_THEO_TRANG).sort()).toEqual([...ds].sort());
  });
});
