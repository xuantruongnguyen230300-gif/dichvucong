import { act, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { taoLinhVuc } from '../../test-utils/danhMucMau';
import { dungTrongRouter } from '../thu-tuc/thuTucMau';
import { HAN_CHO_QUAY_MS } from './api/quayLinhVuc';
import { napNgonNguLinhVuc } from './i18n';
import { LinhVuc } from './LinhVuc';

beforeAll(napNgonNguLinhVuc);
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const DANH_SACH = Array.from({ length: 5 }, (_, i) => taoLinhVuc(`lv-${i}`, `Lĩnh vực ${i + 1}`, 2, 1));

/** `/api/linh-vuc/quay` treo: không trả lời, chỉ kết thúc khi yêu cầu bị huỷ (như fetch thật khi `abort()`). */
function giaFetchQuayTreo() {
  return vi.fn<typeof fetch>().mockImplementation((dau, init) => {
    if (!String(dau).startsWith('/api/linh-vuc/quay')) return Promise.resolve(Response.json(DANH_SACH));
    return new Promise<Response>((_giai, tuChoi) => {
      init?.signal?.addEventListener('abort', () => tuChoi(new DOMException('Aborted', 'AbortError')), { once: true });
    });
  });
}

describe('LinhVuc — quầy treo (F05 L4)', () => {
  it(`quầy không trả lời: vẫn khung chờ trước hạn, sau ${HAN_CHO_QUAY_MS} ms hiện lưới không có dòng quầy, không báo lỗi`, async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('fetch', giaFetchQuayTreo());
    await act(async () => {
      dungTrongRouter(<LinhVuc />, { diaChi: '/linh-vuc' });
    });

    await act(() => vi.advanceTimersByTimeAsync(HAN_CHO_QUAY_MS - 500));
    expect(screen.queryByRole('list', { name: 'Danh sách lĩnh vực' })).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải…');

    await act(() => vi.advanceTimersByTimeAsync(1000));
    const luoi = screen.getByRole('list', { name: 'Danh sách lĩnh vực' });
    expect(within(luoi).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.queryByText(/^Quầy/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText('Đang tải…')).toBeNull();
  });
});
