import { describe, expect, it } from 'vitest';
import { i18n } from '../i18n';
import { ApiError } from './http';
import { khoaLoi } from './loi';

// Bảng mã lỗi của plan F00 mục 2b — mọi mã BE trả phải có câu chữ trong common.json
const maBe = [
  'du-lieu-khong-hop-le',
  'khong-tim-thay',
  'phuong-thuc-khong-hop-le',
  'yeu-cau-qua-lon',
  'qua-nhieu-yeu-cau',
  'loi-he-thong',
  'mat-ket-noi', // chỉ có ở FE
];

describe('khoaLoi', () => {
  it.each(maBe)('mã %s có câu chữ riêng', (code) => {
    const key = khoaLoi(new ApiError(400, { code }));
    expect(key).toBe(`loi.${code}`);
    expect(i18n.t(key, { ns: 'common' })).not.toBe(i18n.t('loi.mac-dinh', { ns: 'common' }));
  });

  it('mã lạ, thiếu mã hoặc lỗi không phải ApiError → mặc định', () => {
    expect(khoaLoi(new ApiError(500, { code: 'ma-la' }))).toBe('loi.mac-dinh');
    expect(khoaLoi(new ApiError(500, null))).toBe('loi.mac-dinh');
    expect(khoaLoi(new TypeError('Failed to fetch'))).toBe('loi.mac-dinh');
  });
});
