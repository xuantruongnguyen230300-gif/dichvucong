import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBayGio } from './useBayGio';

beforeEach(() => {
  vi.useFakeTimers({ now: new Date('2026-10-12T03:00:00Z') });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const datTrangThaiTab = (trangThai: DocumentVisibilityState) =>
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(trangThai);

describe('useBayGio', () => {
  it('trả thời điểm hiện tại và đổi sau mỗi 60 giây', () => {
    const { result } = renderHook(() => useBayGio());
    expect(result.current.toISOString()).toBe('2026-10-12T03:00:00.000Z');
    act(() => vi.advanceTimersByTime(59_999));
    expect(result.current.toISOString()).toBe('2026-10-12T03:00:00.000Z');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.toISOString()).toBe('2026-10-12T03:01:00.000Z');
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.toISOString()).toBe('2026-10-12T03:02:00.000Z');
  });

  it('khoảng tuỳ chọn', () => {
    const { result } = renderHook(() => useBayGio(1_000));
    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current.toISOString()).toBe('2026-10-12T03:00:01.000Z');
  });

  it('tab hiện lại → cập nhật ngay, không chờ bộ đếm', () => {
    datTrangThaiTab('hidden');
    const { result } = renderHook(() => useBayGio());
    vi.setSystemTime(new Date('2026-10-12T04:30:00Z')); // bộ đếm của tab ẩn bị trình duyệt hoãn
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.toISOString()).toBe('2026-10-12T03:00:00.000Z'); // vẫn ẩn → chưa đổi
    datTrangThaiTab('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.toISOString()).toBe('2026-10-12T04:30:00.000Z');
  });

  it('gỡ khỏi cây: không còn bộ đếm lẫn trình nghe', () => {
    const them = vi.spyOn(document, 'addEventListener');
    const go = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useBayGio());
    expect(vi.getTimerCount()).toBe(1);
    const trinhNghe = them.mock.calls.find(([loai]) => loai === 'visibilitychange')![1];
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(go).toHaveBeenCalledWith('visibilitychange', trinhNghe);
  });
});
