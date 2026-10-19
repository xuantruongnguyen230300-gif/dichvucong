import { describe, expect, it } from 'vitest';
import common from '../src/core/i18n/vi/common.json' with { type: 'json' };
import { taoDacTaTrang } from './dac-ta-trang.ts';

describe('taoDacTaTrang', () => {
  const dacTa = taoDacTaTrang(common);

  it('đủ mẫu tiêu đề, trang 404 và 3 trang theo đường dẫn', () => {
    expect(dacTa.mauTieuDe).toBe('{{trang}} – {{trungTam}}');
    expect(Object.keys(dacTa.trang).sort()).toEqual(['/', '/linh-vuc', '/thu-tuc']);
    expect(dacTa.khongTimThay).toEqual({
      ten: common.trang['khong-tim-thay'].ten,
      moTa: common.trang['khong-tim-thay']['mo-ta'],
    });
  });

  it('chữ lấy đúng từ common.json, không rỗng', () => {
    expect(dacTa.trang['/']).toEqual({ ten: common.trang['trang-chu'].ten, moTa: common.trang['trang-chu']['mo-ta'] });
    expect(dacTa.trang['/thu-tuc']?.ten).toBe(common.trang['danh-muc'].ten);
    expect(dacTa.trang['/linh-vuc']?.ten).toBe(common.trang['linh-vuc'].ten);
    for (const t of [...Object.values(dacTa.trang), dacTa.khongTimThay]) {
      expect(t.ten).not.toBe('');
      expect(t.moTa).not.toBe('');
    }
  });
});
