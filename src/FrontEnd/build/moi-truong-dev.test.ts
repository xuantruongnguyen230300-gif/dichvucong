import { describe, expect, it } from 'vitest';
import { API_URL_MAC_DINH, PORT_MAC_DINH, docApiUrl, docPort } from './moi-truong-dev.ts';

describe('docApiUrl (API_URL)', () => {
  it('không đặt hoặc rỗng thì dùng mặc định', () => {
    expect(docApiUrl(undefined)).toBe(API_URL_MAC_DINH);
    expect(docApiUrl('  ')).toBe(API_URL_MAC_DINH);
  });

  it.each([
    ['https://localhost:7157', 'https://localhost:7157'],
    ['http://127.0.0.1:5000/', 'http://127.0.0.1:5000'],
  ])('nhận %s', (vao, ra) => {
    expect(docApiUrl(vao)).toBe(ra);
  });

  it.each(['không-phải-url', 'ftp://localhost:21', 'javascript:alert(1)'])('từ chối %s, thông báo không chép giá trị', (vao) => {
    expect(() => docApiUrl(vao)).toThrow(/API_URL/);
    expect(() => docApiUrl(vao)).not.toThrow(new RegExp(vao.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});

describe('docPort (PORT)', () => {
  it('không đặt hoặc rỗng thì 5173', () => {
    expect(docPort(undefined)).toBe(PORT_MAC_DINH);
    expect(docPort('')).toBe(5173);
  });

  it.each([['1', 1], ['5199', 5199], ['65535', 65535]])('nhận %s', (vao, ra) => {
    expect(docPort(vao)).toBe(ra);
  });

  it.each(['0', '65536', '-1', '80.5', 'abc', '1e3', '0x50'])('từ chối %s', (vao) => {
    expect(() => docPort(vao)).toThrow(/PORT/);
  });
});
