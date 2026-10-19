import { describe, expect, it } from 'vitest';
import { i18n } from '../../../core/i18n';
import { daNapNgonNguThuTuc, napNgonNguThuTuc } from '.';
import vi from './vi.json';

describe('napNgonNguThuTuc', () => {
  it('chưa nạp thì daNapNgonNguThuTuc() là false; nạp xong là true (nơi dùng bỏ `use()` và vẽ ngay, không hiện khung chờ thừa)', async () => {
    expect(daNapNgonNguThuTuc()).toBe(false);
    const a = napNgonNguThuTuc();
    expect(daNapNgonNguThuTuc()).toBe(false);
    await a;
    expect(daNapNgonNguThuTuc()).toBe(true);
  });

  it('trả cùng một promise ở mọi lần gọi và đăng ký namespace thu-tuc', async () => {
    const a = napNgonNguThuTuc();
    expect(napNgonNguThuTuc()).toBe(a);
    await a;
    expect(i18n.t('khoi.tieu-de', { ns: 'thu-tuc' })).toBe('Thủ tục thường gặp');
    expect(napNgonNguThuTuc()).toBe(a);
  });

  it('câu chữ chính của khối thường gặp và popup', () => {
    expect(vi.khoi['tim-nhan']).toBe('Tìm theo tên, mã thủ tục hoặc lĩnh vực');
    expect(vi.khoi['tat-ca']).toBe('Tất cả');
    expect(vi['muc-do']['toan-trinh']).toBe('Toàn trình');
    expect(vi['cong-dvc']).toBe('Xem và nộp trên Cổng DVC');
  });
});
