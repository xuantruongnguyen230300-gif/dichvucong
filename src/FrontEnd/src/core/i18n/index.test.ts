import { describe, expect, it } from 'vitest';
import { dangKyNamespace, i18n } from '.';

describe('dangKyNamespace', () => {
  it('nạp namespace lười một lần và dùng được qua t()', async () => {
    let soLanNap = 0;
    const nguon = {
      vi: async () => {
        soLanNap++;
        return { default: { chao: 'Xin chào' } };
      },
    };
    await dangKyNamespace('thu', nguon);
    await dangKyNamespace('thu', nguon);
    expect(soLanNap).toBe(1);
    expect(i18n.getResource('vi', 'thu', 'chao')).toBe('Xin chào');
  });

  it('thiếu ngôn ngữ hiện tại thì dùng ngôn ngữ mặc định', async () => {
    await dangKyNamespace('thu2', { vi: async () => ({ default: { a: 'b' } }) });
    expect(i18n.getResource('vi', 'thu2', 'a')).toBe('b');
  });
});
