import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { datCheDoKiosk, khoiTaoCheDoKiosk } from './cheDoKiosk';
import { useCheDoKiosk } from './useCheDoKiosk';

const laKiosk = () => document.documentElement.classList.contains('kiosk');

afterEach(() => {
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

describe('chế độ kiosk', () => {
  it('?kiosk=1 → class kiosk, lưu sessionStorage, xoá tham số, giữ tham số khác', () => {
    window.history.replaceState(null, '', '/danh-muc?kiosk=1&q=a#x');
    khoiTaoCheDoKiosk();
    expect(laKiosk()).toBe(true);
    expect(window.sessionStorage.getItem('kiosk')).toBe('1');
    expect(window.location.search).toBe('?q=a');
    expect(window.location.hash).toBe('#x');
  });

  it('địa chỉ dạng //abc?kiosk=1 không làm sập, vẫn bật kiosk', () => {
    window.history.replaceState(null, '', `${window.location.origin}//abc?kiosk=1&q=a`);
    expect(() => khoiTaoCheDoKiosk()).not.toThrow();
    expect(laKiosk()).toBe(true);
    expect(window.location.pathname).toBe('/abc');
    expect(window.location.search).toBe('?q=a');
  });

  it('tải lại không có tham số → vẫn là kiosk', () => {
    window.history.replaceState(null, '', '/?kiosk=1');
    khoiTaoCheDoKiosk();
    document.documentElement.classList.remove('kiosk');
    window.history.replaceState(null, '', '/');
    khoiTaoCheDoKiosk();
    expect(laKiosk()).toBe(true);
  });

  it('?kiosk=0 → tắt', () => {
    datCheDoKiosk(true);
    window.history.replaceState(null, '', '/?kiosk=0');
    khoiTaoCheDoKiosk();
    expect(laKiosk()).toBe(false);
    expect(window.sessionStorage.getItem('kiosk')).toBeNull();
    expect(window.location.search).toBe('');
  });

  it('không có tham số và chưa lưu → thường', () => {
    khoiTaoCheDoKiosk();
    expect(laKiosk()).toBe(false);
  });

  it('sessionStorage ném lỗi → vẫn bật cho lần tải này', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('chặn');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('chặn');
    });
    window.history.replaceState(null, '', '/?kiosk=1');
    khoiTaoCheDoKiosk();
    expect(laKiosk()).toBe(true);
    expect(window.location.search).toBe('');
  });

  it('useCheDoKiosk theo dõi thay đổi', () => {
    const { result } = renderHook(() => useCheDoKiosk());
    expect(result.current).toBe(false);
    act(() => datCheDoKiosk(true));
    expect(result.current).toBe(true);
    expect(laKiosk()).toBe(true);
  });
});
