import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { datKhoMan } from '../../test-utils/khoMan';
import { giaFetchDanhMuc } from '../../test-utils/danhMucMau';
import { i18n } from '../../core/i18n';
import { KhoiThuongGap } from './KhoiThuongGap';
import { dungTrongRouter } from './thuTucMau';
import { taoBo43 } from './thuongGapMau';

// Câu chữ `thu-tuc` do test này điều khiển: chưa "về" thì khối phải hiện khung chờ, về rồi mới có chữ.
const dieuKhien = vi.hoisted(() => ({ giai: () => undefined as void, lenh: null as Promise<void> | null }));

vi.mock('./i18n', async (importOriginal) => {
  const goc = await importOriginal<typeof import('./i18n')>();
  dieuKhien.lenh = new Promise<void>((xong) => {
    dieuKhien.giai = xong;
  }).then(() => goc.napNgonNguThuTuc());
  return { napNgonNguThuTuc: () => dieuKhien.lenh as Promise<void>, daNapNgonNguThuTuc: goc.daNapNgonNguThuTuc };
});

afterEach(() => vi.unstubAllGlobals());

describe('KhoiThuongGap khi câu chữ thu-tuc chưa về', () => {
  it('hiện Skeleton, sau đó đủ chữ; không bao giờ hiện khoá thô', async () => {
    expect(i18n.hasResourceBundle('vi', 'thu-tuc')).toBe(false);
    datKhoMan(768);
    giaFetchDanhMuc(taoBo43());
    await act(async () => {
      dungTrongRouter(<KhoiThuongGap />);
    });

    // Chưa có chữ: khung chờ, chưa có tiêu đề, không có khoá thô
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải…');
    expect(screen.queryByRole('heading', { name: 'Thủ tục thường gặp' })).toBeNull();
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(document.body.textContent).not.toMatch(/khoi\.|the\.|bang\.|thu-tuc:/);

    await act(async () => {
      dieuKhien.giai();
      await dieuKhien.lenh;
    });

    expect(await screen.findAllByRole('article')).toHaveLength(12);
    expect(screen.getByRole('heading', { level: 2, name: 'Thủ tục thường gặp' })).toBeInTheDocument();
    expect(i18n.hasResourceBundle('vi', 'thu-tuc')).toBe(true);
    expect(document.body.textContent).not.toMatch(/khoi\.|the\.|bang\.|chi-tiet\.|thu-tuc:/);
  });
});
