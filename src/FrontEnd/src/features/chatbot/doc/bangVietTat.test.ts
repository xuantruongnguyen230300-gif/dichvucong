import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { phanHoiLoi } from '../../thu-tuc/thuTucMau';
import { BANG_VIET_TAT_MAU, giaFetchVietTat } from '../../../test-utils/giaSpeech';

// Mỗi ca nạp lại module để promise nhớ ở mức module bắt đầu từ trống
beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

const taiMoi = async () => (await import('./bangVietTat')).taiBangVietTat;

describe('taiBangVietTat', () => {
  it('gọi GET /api/tro-ly/viet-tat đúng một lần dù gọi nhiều lần, không thân yêu cầu', async () => {
    const fetchGia = giaFetchVietTat();
    const tai = await taiMoi();
    const [a, b] = await Promise.all([tai(), tai()]);
    expect(await tai()).toEqual(BANG_VIET_TAT_MAU);
    expect(a).toEqual(b);
    expect(fetchGia).toHaveBeenCalledOnce();
    const [dia, tuyChon] = fetchGia.mock.calls[0]!;
    expect(String(dia)).toBe('/api/tro-ly/viet-tat');
    expect(tuyChon?.method).toBe('GET');
    expect(tuyChon?.body).toBeUndefined();
  });

  it('lỗi 500: trả bảng rỗng cho lần này, lần sau tải lại', async () => {
    let lan = 0;
    const fetchGia = giaFetchVietTat(() => (lan++ === 0 ? phanHoiLoi(500, 'loi-he-thong') : Response.json(BANG_VIET_TAT_MAU)));
    const tai = await taiMoi();
    expect(await tai()).toEqual([]);
    expect(await tai()).toEqual(BANG_VIET_TAT_MAU);
    expect(fetchGia).toHaveBeenCalledTimes(2);
  });

  it('mất mạng: trả bảng rỗng, không ném lỗi', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch')));
    const tai = await taiMoi();
    await expect(tai()).resolves.toEqual([]);
  });

  it('bỏ phần tử sai hình dạng; không phải mảng thì rỗng', async () => {
    giaFetchVietTat(() =>
      Response.json([
        { chuVietTat: 'TTHC', dayDu: 'thủ tục hành chính' },
        { chuVietTat: 'XYZ' },
        { chuVietTat: 5, dayDu: 'năm' },
        null,
        'chuỗi',
        { chuVietTat: 'đk', dayDu: 'đăng ký', thuTu: 3 },
      ]),
    );
    const tai = await taiMoi();
    expect(await tai()).toEqual([
      { chuVietTat: 'TTHC', dayDu: 'thủ tục hành chính' },
      { chuVietTat: 'đk', dayDu: 'đăng ký' },
    ]);

    vi.resetModules();
    giaFetchVietTat(() => Response.json({ khong: 'phai mang' }));
    expect(await (await taiMoi())()).toEqual([]);
  });
});
