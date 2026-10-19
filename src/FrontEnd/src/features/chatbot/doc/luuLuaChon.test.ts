import { afterEach, describe, expect, it, vi } from 'vitest';
import { docCoBat, ghiCoBat } from './luuLuaChon';

afterEach(() => vi.restoreAllMocks());

describe('luuLuaChon (BR-5)', () => {
  it('mặc định tắt', () => {
    expect(docCoBat()).toBe(false);
  });

  it('"1" bật, "0" tắt, giá trị lạ tắt', () => {
    window.localStorage.setItem('doc-bat', '1');
    expect(docCoBat()).toBe(true);
    window.localStorage.setItem('doc-bat', '0');
    expect(docCoBat()).toBe(false);
    window.localStorage.setItem('doc-bat', 'true');
    expect(docCoBat()).toBe(false);
  });

  it('ghi đúng khoá doc-bat, chỉ giá trị "1"/"0"', () => {
    ghiCoBat(true);
    expect(window.localStorage.getItem('doc-bat')).toBe('1');
    ghiCoBat(false);
    expect(window.localStorage.getItem('doc-bat')).toBe('0');
    expect(window.localStorage).toHaveLength(1);
  });

  it('storage bị chặn: không ném lỗi, giữ được trong bộ nhớ trang', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('chặn', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('chặn', 'SecurityError');
    });
    expect(() => ghiCoBat(true)).not.toThrow();
    expect(docCoBat()).toBe(true);
    ghiCoBat(false);
    expect(docCoBat()).toBe(false);
  });
});
