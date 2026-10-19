import { describe, expect, it } from 'vitest';
import { tinhTaiDau, type ThongTinChunk } from './kiem-tra-kich-thuoc';

const c = (file: string, gzip: number, tuyChon: Partial<ThongTinChunk> = {}): ThongTinChunk => ({
  file,
  gzip,
  imports: [],
  moduleIds: [],
  laVao: false,
  ...tuyChon,
});

const BO: ThongTinChunk[] = [
  c('index.js', 30, { laVao: true, imports: ['vendor.js', 'rt.js'] }),
  c('vendor.js', 100, { imports: ['rt.js'] }),
  c('rt.js', 1),
  c('TrangChu.js', 10, { moduleIds: [String.raw`D:\app\src\features\trang-chu\TrangChu.tsx`], imports: ['dung-chung.js', 'vendor.js'] }),
  c('dung-chung.js', 5),
  c('vi-tc.js', 2, { moduleIds: ['D:/app/src/features/trang-chu/i18n/vi.json'] }),
  c('DanhMuc.js', 40, { moduleIds: ['D:/app/src/features/danh-muc/DanhMuc.tsx'] }),
  c('grid.js', 50),
];

describe('tinhTaiDau', () => {
  it('entry + import tĩnh + chunk của trang chủ (mỗi chunk tính một lần); chunk nạp lười khác không tính', () => {
    const kq = tinhTaiDau(BO, ['features/trang-chu/TrangChu', 'features/trang-chu/i18n'], [3]);
    expect(kq.chunk.sort()).toEqual(['TrangChu.js', 'dung-chung.js', 'index.js', 'rt.js', 'vendor.js', 'vi-tc.js']);
    expect(kq.tong).toBe(30 + 100 + 1 + 10 + 5 + 2 + 3);
  });

  it('đoạn module không khớp chunk nào → lỗi (cấu hình lỗi thời)', () => {
    expect(() => tinhTaiDau(BO, ['features/khong-co'])).toThrow(/features\/khong-co/);
  });

  it('không có chunk vào → lỗi', () => {
    expect(() => tinhTaiDau([c('a.js', 1)], [])).toThrow();
  });
});
