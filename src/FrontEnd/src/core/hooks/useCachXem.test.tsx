import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { datCheDoKiosk } from '../kiosk/cheDoKiosk';
import { datKhoMan } from '../../test-utils/khoMan';
import { useCachXem } from './useCachXem';

describe('useCachXem', () => {
  it('dưới 600 px luôn là thẻ, kể cả khi đã chọn bảng', () => {
    datKhoMan(1280);
    const { result } = renderHook(() => useCachXem());
    act(() => result.current.datCachXem('bang'));
    expect(result.current.cachXem).toBe('bang');
    act(() => datKhoMan(375));
    expect(result.current.cachXem).toBe('the');
    expect(result.current.laDienThoai).toBe(true);
    expect(result.current.daChon).toBe('bang');
  });

  it('chưa chọn: 600–1023 px là thẻ, từ 1024 px là bảng', () => {
    datKhoMan(800);
    const { result } = renderHook(() => useCachXem());
    expect(result.current.cachXem).toBe('the');
    act(() => datKhoMan(1280));
    expect(result.current.cachXem).toBe('bang');
  });

  it('chưa chọn ở kiosk → thẻ', () => {
    datKhoMan(1280);
    datCheDoKiosk(true);
    const { result } = renderHook(() => useCachXem());
    expect(result.current.cachXem).toBe('the');
  });

  it('hai component cùng dùng hook: chọn ở một chỗ thì cả hai đổi', () => {
    datKhoMan(800);
    const a = renderHook(() => useCachXem());
    const b = renderHook(() => useCachXem());
    act(() => a.result.current.datCachXem('bang'));
    expect(b.result.current.cachXem).toBe('bang');
    expect(window.localStorage.getItem('cach-xem')).toBe('bang');
  });

  it('thu xuống dưới 600 px rồi nới lại → về bảng (AC-11)', () => {
    datKhoMan(1280);
    const { result } = renderHook(() => useCachXem());
    act(() => result.current.datCachXem('bang'));
    act(() => datKhoMan(375));
    expect(result.current.cachXem).toBe('the');
    act(() => datKhoMan(1280));
    expect(result.current.cachXem).toBe('bang');
  });

  it('đồng bộ giữa các tab qua sự kiện storage', () => {
    datKhoMan(800);
    const { result } = renderHook(() => useCachXem());
    window.localStorage.setItem('cach-xem', 'bang');
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'cach-xem' }));
    });
    expect(result.current.cachXem).toBe('bang');
  });
});
