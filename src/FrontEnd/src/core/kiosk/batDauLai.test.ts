import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { batDauLai, thaoTacTrinhDuyet } from './batDauLai';

describe('batDauLai (F09 BR-7)', () => {
  const cancel = vi.fn();

  beforeEach(() => {
    vi.spyOn(thaoTacTrinhDuyet, 'diToi').mockImplementation(() => undefined);
    cancel.mockReset();
    vi.stubGlobal('speechSynthesis', { cancel });
    window.localStorage.setItem('cach-xem', 'bang');
    window.localStorage.setItem('doc-gia', '1');
    window.sessionStorage.setItem('kiosk', '1');
  });
  afterEach(() => {
    document.body.hidden = false;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('đi tới /?kiosk=1, dừng đọc, ẩn body ngay', () => {
    batDauLai();
    expect(thaoTacTrinhDuyet.diToi).toHaveBeenCalledExactlyOnceWith('/?kiosk=1');
    expect(cancel).toHaveBeenCalledOnce();
    expect(document.body.hidden).toBe(true);
  });

  it('không có speechSynthesis: vẫn đi', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    batDauLai();
    expect(thaoTacTrinhDuyet.diToi).toHaveBeenCalledOnce();
  });

  it('speechSynthesis.cancel ném lỗi: vẫn đi', () => {
    cancel.mockImplementation(() => {
      throw new Error('không có giọng');
    });
    batDauLai();
    expect(thaoTacTrinhDuyet.diToi).toHaveBeenCalledOnce();
    expect(document.body.hidden).toBe(true);
  });

  it('không đụng localStorage và sessionStorage', () => {
    batDauLai();
    expect(window.localStorage.getItem('cach-xem')).toBe('bang');
    expect(window.localStorage.getItem('doc-gia')).toBe('1');
    expect(window.sessionStorage.getItem('kiosk')).toBe('1');
    expect(window.localStorage).toHaveLength(2);
  });
});
