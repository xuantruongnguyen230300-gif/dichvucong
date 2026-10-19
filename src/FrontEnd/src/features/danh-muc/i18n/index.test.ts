import { describe, expect, it } from 'vitest';
import { i18n } from '../../../core/i18n';
import { napNgonNguDanhMuc } from '.';
import vi from './vi.json';

describe('napNgonNguDanhMuc', () => {
  it('trả cùng một promise ở mọi lần gọi và đăng ký namespace danh-muc', async () => {
    const a = napNgonNguDanhMuc();
    expect(napNgonNguDanhMuc()).toBe(a);
    await a;
    expect(i18n.t('tab.xa', { ns: 'danh-muc' })).toBe('Thủ tục cấp xã');
    expect(napNgonNguDanhMuc()).toBe(a);
  });

  it('câu chữ chính theo plan §4.7', () => {
    expect(vi['thong-ke']).toEqual({
      nhan: 'Thống kê danh mục',
      xa: 'Thủ tục cấp xã',
      tinh: 'Thủ tục cấp tỉnh',
      'linh-vuc': 'Lĩnh vực',
    });
    expect(vi.loc['nhan-tim']).toBe('Tìm theo tên, mã thủ tục hoặc lĩnh vực');
    expect(vi.loc['linh-vuc-co-so']).toBe('{{ten}} ({{so}})');
    expect(vi['ket-qua'].so).toBe('{{so}} thủ tục');
    expect(vi['ket-qua']['so-dang-loc']).toBe('{{so}} thủ tục (đang lọc)');
  });

  it('không có chữ "Ưu tiên" ở khoá nào (BR-6)', () => {
    expect(JSON.stringify(vi).toLowerCase()).not.toContain('ưu tiên');
  });
});
