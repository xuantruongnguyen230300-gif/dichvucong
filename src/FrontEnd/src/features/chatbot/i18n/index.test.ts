import { describe, expect, it } from 'vitest';
import { i18n } from '../../../core/i18n';
import { napNgonNguTroLy } from '.';
import vi from './vi.json';

describe('napNgonNguTroLy', () => {
  it('trả cùng một promise ở mọi lần gọi và đăng ký namespace chatbot', async () => {
    const a = napNgonNguTroLy();
    const b = napNgonNguTroLy();
    expect(b).toBe(a);
    await a;
    expect(i18n.getResource('vi', 'chatbot', 'khung.ten')).toBe('Trợ lý thủ tục');
    expect(napNgonNguTroLy()).toBe(a);
  });

  it('câu chữ spec ghi sẵn', () => {
    expect(vi.nhap['toi-da']).toBe('Tối đa {{so}} ký tự');
    expect(vi['chu-de'].rong).toBe('Chưa có thủ tục nào thuộc lĩnh vực này.');
    expect(vi['trung-tam']['dang-mo']).toBe('Đang trong giờ làm việc');
    expect(vi['trung-tam']['ngoai-gio']).toBe('Ngoài giờ làm việc');
    expect(vi['thu-tuc']['cong-dvc']).toBe('Xem và nộp trên Cổng DVC');
  });

  it('không có emoji (design-system); câu nộp tại Trung tâm không nhắc quầy (BR-3)', () => {
    expect(JSON.stringify(vi)).not.toMatch(/\p{Extended_Pictographic}/u);
    for (const khoa of [
      'nop-tai-trung-tam',
      'nop-tai-trung-tam-linh-vuc',
      'nop-tai-trung-tam-chung',
      'nop-tai-trung-tam-chung-linh-vuc',
      'nhac-neu-linh-vuc',
    ] as const) {
      expect(vi.quay[khoa].toLowerCase()).not.toContain('quầy');
    }
  });
});
