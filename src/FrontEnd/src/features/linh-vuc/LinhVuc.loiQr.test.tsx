import { act, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { taoLinhVuc } from '../../test-utils/danhMucMau';
import { dungTrongRouter } from '../thu-tuc/thuTucMau';
import { napNgonNguLinhVuc } from './i18n';
import { LinhVuc } from './LinhVuc';
import { RanhGioiQr } from './RanhGioiQr';

// Chunk QrLinhVuc không nạp được (mạng, Cloudflare): import() bị từ chối
vi.mock('./QrLinhVuc', () => {
  throw new Error('Failed to fetch dynamically imported module');
});

beforeAll(napNgonNguLinhVuc);
afterEach(() => vi.unstubAllGlobals());

const TAM_LINH_VUC = Array.from({ length: 8 }, (_, i) => taoLinhVuc(`lv-${i}`, `Lĩnh vực ${i + 1}`, 2, 1));

describe('LinhVuc — chunk QrLinhVuc nạp lỗi (F05 L3)', () => {
  it('chỉ mất mã QR: đủ 8 ô, tên và liên kết còn, không báo lỗi của cả trang', async () => {
    const loiConsole = vi.spyOn(console, 'error').mockImplementation(() => undefined); // React ghi lỗi đã bắt
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((dau) =>
        Promise.resolve(String(dau).startsWith('/api/linh-vuc/quay') ? Response.json([]) : Response.json(TAM_LINH_VUC)),
      ),
    );
    await act(async () => {
      dungTrongRouter(<LinhVuc />, { diaChi: '/linh-vuc' });
    });

    const luoi = await screen.findByRole('list', { name: 'Danh sách lĩnh vực' });
    const cacO = within(luoi).getAllByRole('listitem');
    expect(cacO).toHaveLength(8);
    for (const [i, o] of cacO.entries()) {
      expect(within(o).getByRole('link', { name: `Lĩnh vực ${i + 1}` })).toBeInTheDocument();
    }
    // Chunk lỗi (bất đồng bộ): chú thích "Quét để xem thủ tục" biến mất ở mọi ô vì không hứa quét ở nơi không có mã
    await waitFor(() => expect(screen.queryAllByText('Quét để xem thủ tục')).toHaveLength(0));
    expect(document.querySelectorAll('svg[data-qr]')).toHaveLength(0);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(within(luoi).getAllByRole('listitem')).toHaveLength(8);
    // Ô tìm của trang vẫn dùng được
    expect(screen.getByRole('searchbox', { name: 'Tìm lĩnh vực' })).toBeInTheDocument();
    loiConsole.mockRestore();
  });
});

describe('RanhGioiQr', () => {
  function Hong(): never {
    throw new Error('hỏng');
  }

  it('con lỗi thì hiện fallback, gọi khiLoi đúng một lần; con tốt thì giữ nguyên', () => {
    const loiConsole = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const khiLoi = vi.fn();
    const { rerender } = render(
      <RanhGioiQr fallback={<span>chỗ giữ</span>} khiLoi={khiLoi}>
        <Hong />
      </RanhGioiQr>,
    );
    expect(screen.getByText('chỗ giữ')).toBeInTheDocument();
    expect(khiLoi).toHaveBeenCalledTimes(1);
    rerender(
      <RanhGioiQr fallback={<span>chỗ giữ</span>} khiLoi={khiLoi}>
        <Hong />
      </RanhGioiQr>,
    );
    expect(khiLoi).toHaveBeenCalledTimes(1);
    loiConsole.mockRestore();

    render(
      <RanhGioiQr fallback={<span>chỗ giữ 2</span>}>
        <span>mã QR</span>
      </RanhGioiQr>,
    );
    expect(screen.getByText('mã QR')).toBeInTheDocument();
    expect(screen.queryByText('chỗ giữ 2')).toBeNull();
  });
});
